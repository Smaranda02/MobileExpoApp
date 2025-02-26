import { View, Text, Button, TextInput, StyleSheet, Dimensions, TouchableOpacity, Alert, Platform, Vibration } from 'react-native';
import React, { useEffect, useRef, useState } from 'react'
import { MQTTClientSingleton } from '@/mqttService';

const AirQuality = () => {

  const [connected, setConnected] = useState<boolean>(false);
  const [currentTemperature, setCurrentTemperature] = useState<number | null>(null);
  const [currentHumidity, setCurrentHumidity] = useState<number | null>(null);
  const [currentPressure, setCurrentPressure] = useState<number | null>(null);
  const [currentGasResistance, setCurrentGasResistance] = useState<number | null>(null);
  const [aqi, setAqi] = useState<number | null>(null);
  const [humidityTip, setHumidityTip] = useState<string>('');
  const [airQualityTip, setAirQualityTip] = useState<string>('');

    const MQTT_TOPIC = 'esp32/airQuality'; // The topic you want to publish to
    const mqttClient = useRef<MQTTClientSingleton | null>(null); // Use useRef for MQTT client
    const GAS_THRESHOLD = 50  // Adjust based on environment
    var smokeWarningDisplayed = false;
    var waterWarningDisplayed = false;
    const MQTT_TOPIC_WATER = 'esp32/water'; // The topic you want to publish to

    
  
  useEffect(() => {
    mqttClient.current = MQTTClientSingleton.getInstance();
    setConnected(mqttClient.current.isConnected());

     // Handle incoming messages
     const messageHandler =  (topic: string, payload: string) => {
        if (topic === MQTT_TOPIC) {
          const data = JSON.parse(payload); // Deserialize JSON
              setCurrentTemperature(parseFloat(data.temperature));
              setCurrentHumidity(parseFloat(data.humidity));
              setCurrentPressure(parseFloat(data.pressure));
              setCurrentGasResistance(parseFloat(data.gasResistance));

              const calculatedAqi = calculateAQI(parseFloat(data.gasResistance), parseFloat(data.humidity));
              setAqi(calculatedAqi);
              setHumidityTip(getHumidityTip(parseFloat(data.humidity)));
              setAirQualityTip(getAirQualityTip(calculatedAqi));

              if (currentGasResistance && currentGasResistance < GAS_THRESHOLD) {
                if(smokeWarningDisplayed == false){
                  showSmokeDetectedWarning();
                  smokeWarningDisplayed = true;
                }
              }
          }

          if(topic === MQTT_TOPIC_WATER){
            if(waterWarningDisplayed == false){
              showWaterWarning();
              waterWarningDisplayed = true;
            }
          }
    };

    mqttClient.current.registerMessageCallback(messageHandler);

    return () => {
      mqttClient.current?.disconnect(); // Disconnect on component unmount
    };
  }, []);



  const calculateAQI = (gasResistance: number, humidity: number) => {
    let gasScore = gasResistance > 50 ? 100 : gasResistance > 20 ? 75 : gasResistance > 10 ? 50 : 25;
    let humidityScore = humidity >= 30 && humidity <= 60 ? 100 : humidity < 30 ? (humidity / 30.0) * 100 : ((100 - (humidity - 60)) / 40.0) * 100;
    return (gasScore * 0.7) + (humidityScore * 0.3);
  };

  const getHumidityTip = (humidity: number) => {
    if (humidity < 30) return '🔥 Low humidity! Use a humidifier or water bowl.';
    if (humidity > 60) return '💨 High humidity! Use a dehumidifier or ventilate.';
    return '✅ Optimal humidity level!';
  };

  const getAirQualityTip = (aqi: number) => {
    if (aqi > 80) return '🌟 Excellent air quality! Enjoy!';
    if (aqi > 50) return '🌬️ Moderate air quality. Ventilate if needed.';
    if (aqi > 30) return '⚠️ Poor air quality! Consider an air purifier.';
    return '🚨 Very poor air quality! Improve ventilation immediately!';
  };


  const showSmokeDetectedWarning = () => {
    if (Platform.OS === 'android') {
      Vibration.vibrate([0, 500, 200, 500, 200, 500]); // Pattern of vibration
    }
     // Show an alarming alert
     Alert.alert(
      '🔥 SMOKE DETECTED! 🔥',
      '⚠️ WARNING! The air quality is critical. Please take immediate precautions!',
      [
        {
          text: 'Take Action',
          onPress: () => {
            console.log('User acknowledged the warning');
          },
        },
      ],
      { cancelable: false }
    );
  };


  const showWaterWarning = () => {
    if (Platform.OS === 'android') {
      Vibration.vibrate([0, 500, 200, 500, 200, 500]); // Pattern of vibration
    }
     // Show an alarming alert
     Alert.alert(
      '💧 WATER DETECTED! 💧',
      '⚠️ WARNING! There is a water leak in the living room! Take measures! ',
      [
        {
          text: 'Take Action',
          onPress: () => {
            console.log('User acknowledged the warning');
          },
        },
      ],
      { cancelable: false }
    );
  };


  return (
    <View style={styles.container}>
      <Text style={styles.header}>Air Quality</Text>
      <View style={styles.dataContainer}>
        <Text style={styles.label}>🌡️ Temperature: {currentTemperature !== null ? `${currentTemperature} °C` : 'Loading...'}</Text>
        <Text style={styles.label}>💧 Humidity: {currentHumidity !== null ? `${currentHumidity} %` : 'Loading...'}</Text>
        <Text style={styles.label}>🌍 Pressure: {currentPressure !== null ? `${currentPressure} hPa` : 'Loading...'}</Text>
        <Text style={styles.label}>🔥 Gas Resistance: {currentGasResistance !== null ? `${currentGasResistance} kΩ` : 'Loading...'}</Text>
        <Text style={styles.label}>🌎 AQI: {aqi !== null ? `${aqi.toFixed(2)}` : 'Calculating...'}</Text>
      </View>
      <View style={styles.tipContainer}>
        <Text style={styles.tipHeader}>🌿 Air Quality Tips</Text>
        <Text style={styles.tip}>{airQualityTip}</Text>
      </View>
      <View style={styles.tipContainer}>
        <Text style={styles.tipHeader}>💧 Humidity Tips</Text>
        <Text style={styles.tip}>{humidityTip}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
    header: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
    dataContainer: { backgroundColor: '#fff', padding: 15, borderRadius: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
    label: { fontSize: 18, marginBottom: 8 },
    tipContainer: { backgroundColor: '#e3f2fd', padding: 15, borderRadius: 10, marginTop: 15 },
    tipHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
    tip: { fontSize: 16 },
  });
  
export default AirQuality;

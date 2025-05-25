//TO DO :: it takes as desired temperature the pre last one not the last it is becayuse of the render or smth i dont know the fuck is react doing 

import { View, Text, Button, TextInput, StyleSheet, Dimensions, TouchableOpacity, Alert, Platform, Vibration, ScrollView } from 'react-native';
import React, { useEffect, useRef, useState } from 'react'
import { MQTTClientSingleton } from '@/services/mqttService';
import { useTemperatureStore } from '@/stores/useTemperatureStore';
import { MIN_FAN_TEMP, MQTT_TOPIC_AIR_QUALITY, MQTT_TOPIC_WATER, MIN_WATER_THRESHOLD } from '@/constants';
const AirQuality = () => {

  const [connected, setConnected] = useState<boolean>(false);
  const [currentTemperature, setCurrentTemperature] = useState<number | 22>(0);
  const [currentHumidity, setCurrentHumidity] = useState<number | null>(null);
  const [currentPressure, setCurrentPressure] = useState<number | null>(null);
  const [currentGasResistance, setCurrentGasResistance] = useState<number | null>(null);
  const [aqi, setAqi] = useState<number | null>(null);
  const [humidityTip, setHumidityTip] = useState<string>('');
  const [airQualityTip, setAirQualityTip] = useState<string>('');
  const {desiredTemperatureFan, fanState, setFan, setDesiredTemperatureFan} = useTemperatureStore();

  const mqttClient = useRef<MQTTClientSingleton | null>(null); // Use useRef for MQTT client
  const GAS_THRESHOLD = 100  // Adjust based on environment
  var smokeWarningDisplayed = false;
  var waterWarningDisplayed = false;

  var initialTemepratureSet = false;
  
  useEffect(() => {
    mqttClient.current = MQTTClientSingleton.getInstance();
    setConnected(mqttClient.current.isConnected());

     // Handle incoming messages
     const messageHandler =  (topic: string, payload: string) => {
        if (topic === MQTT_TOPIC_AIR_QUALITY) {
          const data = JSON.parse(payload); // Deserialize JSON
              setCurrentTemperature(parseFloat(data.temperature));
              setCurrentHumidity(parseFloat(data.humidity));
              setCurrentPressure(parseFloat(data.pressure));
              setCurrentGasResistance(parseFloat(data.gasResistance));

              if(!initialTemepratureSet){
                setDesiredTemperatureFan(Math.trunc(data.temperature));
                initialTemepratureSet = true;
              }

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
            // console.log(payload);
            if(parseFloat(payload) > MIN_WATER_THRESHOLD && waterWarningDisplayed == false){
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

  
  const turnOnOffFan = (fanState: number) => {
    setFan(fanState);
  };

  const increaseTemperature = () => {
      setDesiredTemperatureFan(desiredTemperatureFan + 1);
  };

  const decreaseTemperature = () => {
      setDesiredTemperatureFan(desiredTemperatureFan - 1);
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
      <ScrollView>
      <View style={styles.container}>
      <Text style={styles.header}>Air Quality</Text>
      <View style={styles.dataContainer}>
        <Text style={styles.label}>🌡️ Temperature: {!isNaN(currentTemperature) ? `${currentTemperature} °C` : 'Loading...'}</Text>
        <Text style={styles.label}>💧 Humidity: {currentHumidity !== null && !isNaN(currentHumidity) ? `${currentHumidity} %` : 'Loading...'}</Text>
        <Text style={styles.label}>🌍 Pressure: {currentPressure !== null && !isNaN(currentPressure)? `${currentPressure} hPa` : 'Loading...'}</Text>
        <Text style={styles.label}>🔥 Gas Resistance: {currentGasResistance !== null && !isNaN(currentGasResistance)? `${currentGasResistance} kΩ` : 'Loading...'}</Text>
        <Text style={styles.label}>🌎 AQI: {aqi !== null && !isNaN(aqi) ? `${aqi.toFixed(2)}` : 'Calculating...'}</Text>
      </View>
      <View style={styles.tipContainer}>
        <Text style={styles.tipHeader}>🌿 Air Quality Tips</Text>
        <Text style={styles.tip}>{airQualityTip}</Text>
      </View>
      <View style={styles.tipContainer}>
        <Text style={styles.tipHeader}>💧 Humidity Tips</Text>
        <Text style={styles.tip}>{humidityTip}</Text>
      </View>

      <View style={styles.section}>
          <Text style={styles.header}>Fan Control</Text>
      
            <TouchableOpacity
              style={[styles.heaterButton, fanState > 1 ? styles.onButton : styles.offButton]}
              onPress={() => turnOnOffFan(fanState > 1 ? 1 : 255)}
            >
              <Text style={styles.heaterButtonText}>{fanState == 1 ? 'Turn ON' : 'Turn OFF'}</Text>
            </TouchableOpacity>
      </View>

      <View style={styles.section}>
              <Text style={styles.header}>Set Desired Temperature</Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                style={[styles.tempButton,
                  desiredTemperatureFan - 1 < MIN_FAN_TEMP && styles.buttonDisabled
                ]} 
                onPress={decreaseTemperature}
                disabled={desiredTemperatureFan - 1 < MIN_FAN_TEMP}>
                  <Text style={styles.buttonText}>-</Text>
                </TouchableOpacity>
      
                <Text style={styles.desiredTemp}>{desiredTemperatureFan}°C</Text>
      
                <TouchableOpacity 
                style={[
                  styles.tempButton,
                  desiredTemperatureFan + 1 > Math.trunc(currentTemperature) && styles.buttonDisabled
                ]} 
                onPress={increaseTemperature}
                disabled={desiredTemperatureFan + 1 > Math.trunc(currentTemperature)}>
                  <Text style={styles.buttonText}>+</Text>
                </TouchableOpacity>
              </View>
        </View>
    </View>
    </ScrollView>
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
    heaterButton: {
      paddingVertical: 15,
      paddingHorizontal: 40,
      borderRadius: 25,
      marginVertical: 10,
      width: '70%',
      alignItems: 'center',
    },
    heaterButtonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
    },
  onButton: {
    backgroundColor: '#f44336',
  },
  offButton: {
    backgroundColor: '#4caf50',
  },
    section: {
      marginBottom: 40,
      alignItems: 'center',
    },
    temperature: {
      fontSize: 48,
      color: '#D84315',
      fontWeight: 'bold',
    },
    desiredTemp: {
      fontSize: 36,
      color: '#333',
      fontWeight: 'bold',
      marginVertical: 5,
      marginRight: 10,
      marginLeft: 10
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '60%',
      marginVertical: 20,
    },
    button: {
      backgroundColor: '#1976D2',
      paddingVertical: 15,
      paddingHorizontal: 30,
      borderRadius: 30,
      justifyContent: 'center',
      alignItems: 'center',
    },
    buttonText: {
      color: '#fff',
      fontSize: 32,
      fontWeight: 'bold',
    },
    
    tempButton: {
      backgroundColor: '#1976d2',
      width: 60,
      height: 60,
      borderRadius: 30,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 4,
    },

    buttonDisabled: {
      backgroundColor: '#B0BEC5', // grayish tone for disabled
    }
  });
  
export default AirQuality;

import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { useTemperatureStore } from '@/stores/useTemperatureStore';
import { MAX_HEATER_TEMP, MIN_HEATER_TEMP, MQTT_TOPIC_TEMPERATURE } from '@/constants';
import { MQTTClientSingleton } from '@/services/mqttService';
const Temperature = () => {
  const [currentTemperature, setCurrentTemperature] = useState<number | null>(null);
  const {
    desiredTemperatureHeater,
    heaterState,
    setHeater,
    setDesiredTemperatureHeater,
  } = useTemperatureStore();

  const mqttClient = useRef<MQTTClientSingleton | null>(null);

  useEffect(() => {
    mqttClient.current = MQTTClientSingleton.getInstance();

    const messageHandler = (topic: string, payload: string) => {
      if (topic === MQTT_TOPIC_TEMPERATURE) {
        const temperature = parseFloat(payload);
        setCurrentTemperature(temperature);
      }
    };

    mqttClient.current.registerMessageCallback(messageHandler);
  }, []);

  const increaseTemperature = () => {
      setDesiredTemperatureHeater(desiredTemperatureHeater + 1);
  };

  const decreaseTemperature = () => {
      setDesiredTemperatureHeater(desiredTemperatureHeater - 1);
  };

  const toggleHeater = () => {
    setHeater(heaterState === 1 ? 255 : 1);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Text style={Platform.OS == 'web'? styles.titleWeb : styles.title}>
        Heater Control
      </Text>

      <TouchableOpacity
        style={[
          Platform.OS == 'web' ? styles.heaterButtonWeb : styles.heaterButton,
          heaterState !== 1 ? styles.onButton : styles.offButton,
        ]}
        onPress={toggleHeater}
      >
        <Text style={ Platform.OS == 'web' ? styles.heaterButtonTextWeb : styles.heaterButtonText}>
          {heaterState !== 1 ? 'Turn OFF' : 'Turn ON'}
        </Text>
      </TouchableOpacity>

      <View style={styles.section}>
        <Text style={ Platform.OS == 'web' ? styles.labelWeb : styles.label}>Current Temperature</Text>
        <Text style={styles.currentTemp}>
          {currentTemperature !== null && !isNaN(currentTemperature) ? `${currentTemperature}°C` : 'Loading...'}
        </Text>
      </View>

      <View style={styles.section}>
          <Text style={ Platform.OS == 'web' ? styles.labelWeb : styles.label}>
              Desired Temperature
          </Text>
        <View style={styles.tempControl}>
          <TouchableOpacity style={[styles.tempButton,
                          desiredTemperatureHeater - 1 < MIN_HEATER_TEMP && styles.buttonDisabled
          ]}
           onPress={decreaseTemperature}
           disabled={desiredTemperatureHeater - 1 < MIN_HEATER_TEMP}
           >
            <Text style={styles.tempButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={ Platform.OS == 'web' ? styles.desiredTempWeb : styles.desiredTemp}>
            {desiredTemperatureHeater}°C
            </Text>
          <TouchableOpacity 
              style={[styles.tempButton,
                desiredTemperatureHeater + 1 > MAX_HEATER_TEMP && styles.buttonDisabled
              ]} 
            onPress={increaseTemperature}
            disabled={desiredTemperatureHeater + 1 > MAX_HEATER_TEMP}
            >
            <Text style={styles.tempButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default Temperature;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f4f8',
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    marginBottom: 24,
    color: '#0d47a1',
  },
  titleWeb: {
    fontSize: 60,
    fontWeight: '700',
    // marginBottom: 200,
    marginBottom: 30,
    color: '#0d47a1',
  },
  heaterButton: {
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    width: '80%',
    alignItems: 'center',
    marginBottom: 30,
    elevation: 3,
  },

  heaterButtonWeb: {
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    width: 500,
    alignItems: 'center',
    marginBottom: 30,
    elevation: 3,
    fontSize: 30
  },
  onButton: {
    backgroundColor: '#f44336',
  },
  offButton: {
    backgroundColor: '#4caf50',
  },
  heaterButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
   heaterButtonTextWeb: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '600',
  },
  section: {
    marginBottom: 32,
    alignItems: 'center',
  },
  label: {
    fontSize: 22,
    fontWeight: '500',
    color: '#333',
    marginBottom: 12,
  },
  labelWeb: {
    fontSize: 60,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
    marginTop: 50
  },
  currentTemp: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ff5722',
  },
  desiredTemp: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 20,
  },
   desiredTempWeb: {
    fontSize: 50,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 20,
  },
  tempControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
  tempButtonText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
   buttonDisabled: {
      backgroundColor: '#B0BEC5', // grayish tone for disabled
    }
});

import { View, Text, Button, TextInput, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import React, { useEffect, useRef, useState } from 'react'
import { LineChart } from "react-native-chart-kit";

import { MQTTClientSingleton } from '@/services/mqttService';

const Socket = () => {

  const [connected, setConnected] = useState<boolean>(false);

    const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const [currentDayData, setCurrentDayData] = useState<number[]>([]);
    // Holds real-time air quality values for the current day
    const [dailyData, setDailyData] = useState(Array(7).fill(0)); // Holds the mean air quality for the last 7 days


    // const MQTT_TOPIC = 'esp32/socket'; // The topic you want to publish to
    const MQTT_TOPIC = 'esp32/air'; // The topic you want to publish to

    const mqttClient = useRef<MQTTClientSingleton | null>(null); // Use useRef for MQTT client
    
  
  useEffect(() => {
    mqttClient.current = MQTTClientSingleton.getInstance();
    setConnected(mqttClient.current.isConnected());

     // Handle incoming messages
     const messageHandler =  (topic: string, payload: string) => {
      if (topic === MQTT_TOPIC) {
        const newData = JSON.parse(payload.toString()); // Parse incoming JSON payload
        const airQualityValue = newData.airQuality; 
        
        // Update current day's data
        setCurrentDayData((prevData: number[])  => {
          const updatedData = [...prevData, airQualityValue];
          return updatedData;
        });
      }

    };

    mqttClient.current.registerMessageCallback(messageHandler);

    return () => {
      mqttClient.current?.disconnect(); // Disconnect on component unmount
    };
  }, []);


  useEffect(() => {
    if (currentDayData.length > 0) {
      // Calculate the mean for the current day
      const currentDayMean =
        currentDayData.reduce((sum, value) => sum + value, 0) / currentDayData.length;

      // Update dailyData with the new mean for the current day
      setDailyData(prevDailyData => {
        const todayIndex = new Date().getDay(); // Get the current day index (0 = Sunday, 1 = Monday, etc.)
        const updatedDailyData = [...prevDailyData];
        updatedDailyData[todayIndex] = currentDayMean;
        return updatedDailyData;
      });
    }
  }, [currentDayData]);



  return (

    <View style={styles.container}>
    <Text style={styles.title}>Weekly Air Quality Chart</Text>
    <LineChart
      data={{
        labels, // Day labels (Mon, Tue, etc.)
        datasets: [
          {
            data: dailyData, // Daily mean air quality values
          },
        ],
      }}
      width={Dimensions.get('window').width - 30}
      height={220}
      chartConfig={{
        backgroundColor: '#1E2923',
        backgroundGradientFrom: '#08130D',
        backgroundGradientTo: '#1F4E39',
        decimalPlaces: 2, // Show up to 2 decimal places
        color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        style: {
          borderRadius: 16,
        },
      }}
      bezier
    />
  </View>
  )
}

export default Socket

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f4f4',
    padding: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});
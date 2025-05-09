import { View, Text, StyleSheet, ScrollView} from 'react-native';
import { Picker } from "@react-native-picker/picker";
import React, { useEffect, useRef, useState } from 'react';
import { MQTTClientSingleton } from '@/services/mqttService';
import ConsumptionChart from '../consumptionCharts';

const Consumption = () => {
  const [selectedESP, setSelectedESP] = useState<'ESP1' | 'ESP2' | 'Solar Panel'>('ESP1');
  const selectedESPRef = useRef<'ESP1' | 'ESP2' | 'Solar Panel'>('ESP1');
  const [connected, setConnected] = useState<boolean>(false);
  const [currentShuntVoltage, setCurrentShuntVoltage] = useState<number | null>(null);
  const [currentBusVoltage, setCurrentBusVoltage] = useState<number | null>(null);
  const [currentCurrent, setCurrentCurrent] = useState<number | null>(null);
  const [currentPower, setCurrentPower] = useState<number | null>(null);
  const [currentLoadVoltage, setCurrentLoadVoltage] = useState<number | null>(null);

  const MQTT_TOPIC_ESP1 = 'esp32/consumption-esp1';
  const MQTT_TOPIC_ESP2 = 'esp32/consumption-esp2';
  const MQTT_TOPIC_SOLAR_PANEL = 'esp32/solar-panel';
  const SERVER_IP = "192.168.1.100";

  const mqttClient = useRef<MQTTClientSingleton | null>(null);

  const sendToBackend = async (device: string, current: number) => {
    try {
      await fetch(`http://${SERVER_IP}:3000/reading`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device, current })
      });

      // console.log("Sent");
    
    } catch (error) {
      console.error('Failed to send reading to backend:', error);
    }
  };

  
  useEffect(() => {
    mqttClient.current = MQTTClientSingleton.getInstance();
    setConnected(mqttClient.current.isConnected());

    // Handle incoming messages
    const messageHandler = async (topic: string, payload: string) => {
      
      let targetTopic;
      switch (selectedESPRef.current) {
        case 'ESP1':
          targetTopic = MQTT_TOPIC_ESP1;
          break;
        case 'ESP2':
          targetTopic = MQTT_TOPIC_ESP2;
          break;
        case 'Solar Panel':
          targetTopic = MQTT_TOPIC_SOLAR_PANEL;
          break;
        default:
          return; 
      }
      
    
      if (topic !== targetTopic) return; // Ignore other topics
    
      // console.log(`Received message from ${topic}: ${payload}`);
      const data = JSON.parse(payload);
      const current = parseFloat(data.current); 
      
      if(selectedESPRef.current == 'ESP1' || selectedESPRef.current == "ESP2"){

        const response = await fetch(`http://${SERVER_IP}:3000/avg-current-today?device=${selectedESPRef.current}`);
        const result = await response.json();
        const avg_current = result[0].average_current;

        if(current < avg_current - 50 && avg_current) { //we cut off the spikes from being seen in the interface
          setCurrentShuntVoltage(parseFloat(data.shuntVoltage));
          setCurrentBusVoltage(parseFloat(data.busVoltage));
          setCurrentCurrent(parseFloat(data.current));
          setCurrentPower(parseFloat(data.power));
          setCurrentLoadVoltage(parseFloat(data.loadVoltage));
          // console.log(parseFloat(data.current));
        }
      }

      sendToBackend(selectedESPRef.current, current);

    };
    //50 / 100 micro faraizi electrolitic explodeaza si urc gradual
    //ala e o mare antena

    
    mqttClient.current.registerMessageCallback(messageHandler);

    return () => {
      mqttClient.current?.disconnect(); // Clean up on component unmount
    };
  }, [selectedESP]);


  useEffect(() => {
    selectedESPRef.current = selectedESP;
  }, [selectedESP]);
  

  return (
    <ScrollView>
    <View style={styles.container}>
      <Text style={styles.header}>Consumption</Text>

      {/* Dropdown to select ESP */}
      <Picker
        selectedValue={selectedESP}
        onValueChange={(value) => setSelectedESP(value)}
        style={styles.picker}
      >
        <Picker.Item label="ESP1" value="ESP1" />
        <Picker.Item label="ESP2" value="ESP2" />
        <Picker.Item label="Solar Panel" value="Solar Panel" />
      </Picker>

      <View style={styles.dataContainer}>
        <Text style={styles.label}>
          Shunt Voltage: {currentShuntVoltage !== null ? `${currentShuntVoltage} mV` : 'Loading...'}
        </Text>
        <Text style={styles.label}>
          Bus Voltage: {currentBusVoltage !== null ? `${currentBusVoltage} V` : 'Loading...'}
        </Text>
        <Text style={styles.label}>
          Current: {currentCurrent !== null ? `${currentCurrent} mA` : 'Loading...'}
        </Text>
        <Text style={styles.label}>
          Load Voltage: {currentLoadVoltage !== null ? `${currentLoadVoltage} V` : 'Loading...'}
        </Text>
        <Text style={styles.label}>
          Power: {currentPower !== null ? `${currentPower} mW` : 'Loading...'}
        </Text>
      </View>

      <ConsumptionChart device={selectedESP} />

      </View>
    </ScrollView>


  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  picker: { height: 50, width: '100%', marginBottom: 15 },
  dataContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3
  },
  label: { fontSize: 18, marginBottom: 8 },
});

export default Consumption;

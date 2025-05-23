import { View, Text, StyleSheet, ScrollView} from 'react-native';
import { Picker } from "@react-native-picker/picker";
import React, { useEffect, useRef, useState } from 'react';
import { MQTTClientSingleton } from '@/services/mqttService';
import ConsumptionChart from '../consumptionCharts';
import { SERVER_IP } from '@/constants';
import { getDate } from 'date-fns';
import SolarPanelChart from '../solarPanelChart';

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

  let powerHourArray : number []=  [];
  let lastHourRead = Date.now();

  const mqttClient = useRef<MQTTClientSingleton | null>(null);

  const sendToBackend = async (device: string, current: number) => {
    try {
      await fetch(`http://${SERVER_IP}:3000/reading`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device, current })
      });
    
    } catch (error) {
      console.error('Failed to send reading to backend:', error);
    }
  };

  const postHourAverage = async (power: number, date: string, time: number) => {
    try {

      const timestamp = date.split('T')[0]; // Extract YYYY-MM-DD
      
      await fetch(`http://${SERVER_IP}:3000/solar-panel-reading`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ power, timestamp, time })
      });
    
    } catch (error) {
      console.error('Failed to send reading to backend:', error);
    }
  };

  const handleSolarPanelPower = async (power: number) => {
    powerHourArray.push(power);
    console.log("received power: ", power);
    console.log("array: ", powerHourArray);

    const now = Date.now();
    const oneHour = 60 * 60 * 1000;

    // if (now - lastHourRead >= oneHour) {
    if (now - lastHourRead >= 60 * 1000) {

      const sum = powerHourArray.reduce((acc, val) => acc + val, 0);
      const averagePower = Math.round((sum / powerHourArray.length) * 100) / 100;

      const currentHour = new Date().getHours(); // 0-23
      const timestamp = new Date().toISOString(); // Full ISO timestamp
      postHourAverage(averagePower, timestamp, currentHour);

      powerHourArray = [];
      lastHourRead = now;
  
      console.log(`✅ Posted average power: ${averagePower.toFixed(2)} W at hour ${currentHour}`);
    }
  };


  useEffect(() => {
    const interval = setInterval(() => {
      const fakePower = (Math.random() * 10).toFixed(2);
      // console.log("set interval");
      // handleSolarPanelPower(parseFloat(fakePower));
      // postHourAverage(10, new Date().toISOString() , 13);
    }, 10 * 1000); // every 10 seconds for testing
  
    return () => clearInterval(interval); // ✅ cleanup when component unmounts
  }, []);
  

  useEffect(() => {
    mqttClient.current = MQTTClientSingleton.getInstance();
    setConnected(mqttClient.current.isConnected());

    // for (let hour = 0; hour < 24; hour++) {
    //   const fakePower = parseFloat((Math.random() * 10 + 5).toFixed(2)); // Power between 5–15 W
    //   const date = new Date();
    //   date.setHours(hour, 0, 0, 0); // Set to this hour
    //   const timestamp = date.toISOString();

    //   postHourAverage(fakePower, timestamp, hour);
    // }


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
    
      const data = JSON.parse(payload);
      // console.log("Payload: ", payload);
      const current = parseFloat(data.current);
      //received each minute

      
      
      if(selectedESPRef.current == 'ESP1' || selectedESPRef.current == "ESP2"){

        const response = await fetch(`http://${SERVER_IP}:3000/avg-current-today?device=${selectedESPRef.current}`);
        const response_avg_current = await response.json();    
        
        const response_min_current = await fetch(`http://${SERVER_IP}:3000/min-current-today?device=${selectedESPRef.current}`);
        const result_min_current = await response_min_current.json();    

        let avg_current = 0;
        let min_current = 0;

        if(response_avg_current[0]){
          avg_current = response_avg_current[0].average_current;
        }

        if(result_min_current[0]){
          min_current = result_min_current[0].min_current;
        }

        // console.log("Current min form store: ", min_current);

        if(min_current != null && current < min_current + 50) { //we cut off the spikes from being seen in the interface
          setCurrentShuntVoltage(parseFloat(data.shuntVoltage));
          setCurrentBusVoltage(parseFloat(data.busVoltage));
          setCurrentCurrent(parseFloat(data.current));
          setCurrentPower(parseFloat(data.power));
          setCurrentLoadVoltage(parseFloat(data.loadVoltage));
          // console.log(parseFloat(data.current));
        }
      }

      else {
        //solar panel
        const power = parseFloat(data.power);
        // handleSolarPanelPower(power);
      }
   
      sendToBackend(selectedESPRef.current, current);

    };
   
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

      {selectedESP == 'Solar Panel' ?  
      <SolarPanelChart/> :
      <ConsumptionChart device={selectedESP} />
      }
     

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

import { View, Text, Button, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { MQTTClientSingleton } from '@/services/mqttService';
import { useLedStore } from '@/stores/useLedStore';
import { useTemperatureStore } from '@/stores/useTemperatureStore';
import { MQTT_TOPIC_TEMPERATURE } from '@/services/mqttService';

const Temperature = () => {
  const [currentTemperature, setCurrentTemperature] = useState<number | null>(null);
  const {desiredTemperatureHeater, heaterState, fanState, setHeater, setFan, setDesiredTemperatureHeater} = useTemperatureStore();

  const mqttClient = useRef<MQTTClientSingleton | null>(null);

  useEffect(() => {
    mqttClient.current = MQTTClientSingleton.getInstance();

    const messageHandler = (topic: string, payload: string) => {
      if (topic === MQTT_TOPIC_TEMPERATURE) {
        const temperature = parseFloat(payload);
        setCurrentTemperature(temperature);
        // setFanHeaterState(checkTemperature());
      }
    };

    mqttClient.current.registerMessageCallback(messageHandler);

    return () => {
      mqttClient.current?.disconnect();
    };
  }, []);


  const increaseTemperature = () => {
    if (desiredTemperatureHeater < 35) {
      setDesiredTemperatureHeater(desiredTemperatureHeater + 1);
    }
  };

  const decreaseTemperature = () => {
    if (desiredTemperatureHeater > 15) {
      setDesiredTemperatureHeater(desiredTemperatureHeater - 1);
    }
  };


  const toggleHeater = (newHeaterState: number) => {
    setHeater(newHeaterState);
  };

  
  // const checkTemperature = () => {
  //   if (currentTemperature) {
  //     if (desiredTemperatureHeater - currentTemperature >= 1) return 'Turning OFF the Heater';
  //     if (currentTemperature - desiredTemperatureHeater >= 4) return 'It\'s too hot. Turning ON the FAN';
  //     return 'Turn off';
  //   }
  //   return 'Turn off';
  // };


    
    const processTranscription = (result_entities: any) => {
      try {
          // const jsonData: SpeechCommands[] = JSON.parse(result_entities);
          console.log("PArsing ... ")
          // console.log("Recording entities: ",recordingEntities)
          var jsonData = JSON.parse(result_entities);
          console.log("json data is : ", jsonData)

          for (const data of jsonData) {
            const topic = `esp32/${data.location}`;
            const command = data.action;
            const device = data.device;
            const value = data.value;
    
            // Implement your command handling logic here
            if (command?.includes("off") || command?.includes("down") || command?.includes("minimum")) {
              if(device == "AC"){
                //turnOnOffFan(0);
              }
              if(device == "heater"){
                toggleHeater(0);
              }
            } 
            
            if (command?.includes("on") || command?.includes("up") || command?.includes("maximum")) {
              if(device == "AC"){
                //turnOnOffFan(255);
              }
              if(device == "heater"){
                toggleHeater(255);
              }
            }
            
            if(value){
              setDesiredTemperatureHeater(value);
            }
              
          }
        } catch (error) {
          console.error("Failed to process transcription:", error);
        }
      }
    

  return (
    
    <ScrollView>
    <View style={styles.container}>
      <Text style={styles.header}>Heater Control</Text>

      <TouchableOpacity
        style={[styles.heaterButton, heaterState  == 1 ? styles.onButton : styles.offButton]}
        onPress={() => toggleHeater(heaterState > 1 ? 1 : 255)}
      >
        <Text style={styles.heaterButtonText}>{heaterState == 1 ? 'Turn ON' : 'Turn OFF'}</Text>
      </TouchableOpacity>

      <View style={styles.section}>
        <Text style={styles.header}>Current Temperature</Text>
        <Text style={styles.temperature}>{currentTemperature !== null ? `${currentTemperature} °C` : 'Loading...'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.header}>Set Desired Temperature</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={decreaseTemperature}>
            <Text style={styles.buttonText}>-</Text>
          </TouchableOpacity>

          <Text style={styles.desiredTemp}>{desiredTemperatureHeater}°C</Text>

          <TouchableOpacity style={styles.button} onPress={increaseTemperature}>
            <Text style={styles.buttonText}>+</Text>
          </TouchableOpacity>
        </View>

      </View>
     
    </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: 20,
  },
  section: {
    marginBottom: 40,
    alignItems: 'center',
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1565C0',
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
    marginVertical: 20,
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
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  heaterButton: {
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginVertical: 10,
    width: '70%',
    alignItems: 'center',
  },
  onButton: {
    backgroundColor: '#4CAF50',
  },
  offButton: {
    backgroundColor: '#BDBDBD',
  },
  heaterButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  stateContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  stateHeader: {
    fontSize: 18,
    color: '#424242',
    fontWeight: 'bold',
  },
  stateText: {
    fontSize: 16,
    color: '#757575',
  },
});

export default Temperature;

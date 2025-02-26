import { View, Text, Button, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { MQTTClientSingleton } from '@/mqttService';
import AudioService, { SpeechCommands } from '@/audioService';

const Temperature = () => {
  const [desiredTemperature, setDesiredTemperature] = useState(25);
  const [heaterState, setHeaterState] = useState(0);
  const [fanState, setFanState] = useState(0);
  const [connected, setConnected] = useState<boolean>(false);
  const [currentTemperature, setCurrentTemperature] = useState<number | null>(null);
  const [fanHeaterState, setFanHeaterState] = useState<string>('');
  const [recording, setRecording] = useState<boolean>(false);
  const [recordingEntities, setRecordingEntities] = useState("");

  const MQTT_TOPIC = 'esp32/temperature';
  const mqttClient = useRef<MQTTClientSingleton | null>(null);

  useEffect(() => {
    mqttClient.current = MQTTClientSingleton.getInstance();
    setConnected(mqttClient.current.isConnected());

    const messageHandler = (topic: string, payload: string) => {
      if (topic === MQTT_TOPIC) {
        const temperature = parseFloat(payload);
        setCurrentTemperature(temperature);
        setFanHeaterState(checkTemperature());
      }
    };

    mqttClient.current.registerMessageCallback(messageHandler);

    return () => {
      mqttClient.current?.disconnect();
    };
  }, []);

  const increaseTemperature = () => {
    setDesiredTemperature((prevTemp) => (prevTemp < 35 ? prevTemp + 1 : prevTemp));
    publishDesiredTemperature();
  };

  const decreaseTemperature = () => {
    setDesiredTemperature((prevTemp) => (prevTemp > 15 ? prevTemp - 1 : prevTemp));
  };

  const publishDesiredTemperature = () => {
    if (mqttClient.current?.isConnected()) {
      const messageContent = JSON.stringify({ desiredTemperature: desiredTemperature + 1 });
      mqttClient.current?.publishMessage(MQTT_TOPIC, messageContent);
      console.log(`Message published: ${messageContent}`);
    } else {
      console.log('Not connected to MQTT broker');
    }
  };

  const handleInputChange = (value: any) => {
    const parsedValue = parseInt(value);
    if (!isNaN(parsedValue)) {
      setDesiredTemperature(parsedValue);
    }
  };

  const turnOnOffHeater = (heaterState: number) => {
    if (mqttClient.current?.isConnected()) {
      setHeaterState(heaterState);
      const message = heaterState ? 'ON' : 'OFF';
      const messageContent = JSON.stringify({ heaterState: message });
      mqttClient.current?.publishMessage(MQTT_TOPIC, messageContent);
      console.log(`Message published: ${messageContent}`);
    } else {
      console.log('Not connected to MQTT broker');
    }
  };

  
  const turnOnOffFan = (fanState: number) => {
    if (mqttClient.current?.isConnected()) {
      setFanState(fanState);
      const message = fanState ? 'ON' : 'OFF';
      const messageContent = JSON.stringify({ fanState: message });
      mqttClient.current?.publishMessage(MQTT_TOPIC, messageContent);
      console.log(`Message published: ${messageContent}`);
    } else {
      console.log('Not connected to MQTT broker');
    }
  };

  const checkTemperature = () => {
    if (currentTemperature) {
      if (desiredTemperature - currentTemperature >= 1) return 'Turning OFF the Heater';
      if (currentTemperature - desiredTemperature >= 4) return 'It\'s too hot. Turning ON the FAN';
      return 'Turn off';
    }
    return 'Turn off';
  };

   const handleStartRecording = async () => {
      setRecording(true);
      await AudioService.startRecording();
    };
  
    const handleStopRecording = async () => {
      setRecording(false);
      await AudioService.stopRecording();
      setRecordingEntities(AudioService.getEntities())
      processTranscription(recordingEntities);

    };

    
    const processTranscription = (result_entities: any) => {
      try {
          // const jsonData: SpeechCommands[] = JSON.parse(result_entities);
          var jsonData = JSON.parse(result_entities);

          for (const data of jsonData) {
            const topic = `esp32/${data.location}`;
            const command = data.action;
            const device = data.device;
            const value = data.value;
    
            // Implement your command handling logic here
            if (command?.includes("off") || command?.includes("down") || command?.includes("minimum")) {
              if(device == "AC"){
                turnOnOffFan(0);
              }
              if(device == "heater"){
                turnOnOffHeater(0);
              }
            } 
            
            if (command?.includes("on") || command?.includes("up") || command?.includes("maximum")) {
              if(device == "AC"){
                turnOnOffFan(255);
              }
              if(device == "heater"){
                turnOnOffHeater(255);
              }
            }
            
            if(value){
              setDesiredTemperature(value);
              publishDesiredTemperature();
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
        style={[styles.heaterButton, heaterState ? styles.onButton : styles.offButton]}
        onPress={() => turnOnOffHeater(heaterState ? 0 : 255)}
      >
        <Text style={styles.heaterButtonText}>{heaterState ? 'Turn OFF' : 'Turn ON'}</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Fan Control</Text>

      <TouchableOpacity
        style={[styles.heaterButton, fanState ? styles.onButton : styles.offButton]}
        onPress={() => turnOnOffFan(fanState ? 0 : 255)}
      >
        <Text style={styles.heaterButtonText}>{fanState ? 'Turn OFF' : 'Turn ON'}</Text>
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

          <Text style={styles.desiredTemp}>{desiredTemperature}°C</Text>

          <TouchableOpacity style={styles.button} onPress={increaseTemperature}>
            <Text style={styles.buttonText}>+</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.stateContainer}>
          <Text style={styles.stateHeader}>Fan / Heater State</Text>
          <Text style={styles.stateText}>{fanHeaterState}</Text>
        </View>
      </View>

      <View style={styles.container}>
            <Button
              title={recording ? 'Stop Recording' : 'Start Recording'}
              onPress={recording ? handleStopRecording : handleStartRecording}
            />      
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

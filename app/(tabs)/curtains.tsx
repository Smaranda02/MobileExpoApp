import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Button,
} from "react-native";
import { MQTTClientSingleton } from '@/mqttService';
import AudioService from "@/audioService";

const MQTT_TOPIC = "esp32/curtains"; // The topic you want to publish to

const Curtains = () => {
  const [curtainsState, setCurtainsState] = useState(0);
  const [connected, setConnected] = useState<boolean>(false);
  const [recording, setRecording] = useState<boolean>(false);
  const [recordingEntities, setRecordingEntities] = useState("");

  const mqttClient = useRef<MQTTClientSingleton | null>(null); // Use useRef for MQTT client


  useEffect(() => {
    mqttClient.current = MQTTClientSingleton.getInstance();

    setConnected(mqttClient.current.isConnected());

    return () => {
      mqttClient.current?.disconnect(); // Disconnect on component unmount
    };
  }, []);


  const handleCurtainsStatePublish = (curtainsCommand?: number) => {
    if (mqttClient.current?.isConnected()) {

      setCurtainsState(prevState => {
        const newState = curtainsCommand ?? (prevState ? 0 : 255);
        const message = newState ? "UP" : "DOWN"; 
        console.log("Message:", message);
        const messageContent = JSON.stringify({ curtainsState : message});
        mqttClient.current?.publishMessage(MQTT_TOPIC, messageContent);
        console.log(`Message published: ${messageContent}`);
        return newState;
      });
    
    } else {
      console.log("Not connected to MQTT broker");
    }
  };


  
  const processTranscription = (result_entities: any) => {
    try {

      var jsonData = JSON.parse(result_entities);
      console.log("Json data : ", JSON.parse(result_entities))
      
      for (const data of jsonData) {
        const topic = `esp32/${data.location}`;
        const command = data.action;

        // Implement your command handling logic here
        if (command?.includes("off") || command?.includes("down") || command?.includes("minimum")) {
          handleCurtainsStatePublish(0);
        } else if (command?.includes("on") || command?.includes("up") || command?.includes("maximum")) {
          handleCurtainsStatePublish(255);
        }

      }
    } catch (error) {
      console.error("Failed to process transcription:", error);
    }
  }


   const handleStartRecording = async () => {
      setRecording(true);
      await AudioService.startRecording();
    };
  
    const handleStopRecording = async () => {
      setRecording(false);
      await AudioService.stopRecording();
      var resultEntities = AudioService.getEntities();
      setRecordingEntities(resultEntities)
      processTranscription(resultEntities);
    };
    


  return (
    <View>
      <View style={styles.container}>
        <Text style={styles.status}>
          {connected
            ? "Connected to MQTT broker"
            : "Connecting to MQTT broker..."}
        </Text>

        <TouchableOpacity
          style={[
            styles.button,
            curtainsState ? styles.offButton : styles.onButton,
          ]}
          onPress={() => handleCurtainsStatePublish()}
        >
          <Text style={styles.buttonText}>{curtainsState ? "CURTAINS DOWN" : "CURTAINS UP"}</Text>
        </TouchableOpacity>
      </View>


    <View style={styles.container}>
      <Button
        title={recording ? 'Stop Recording' : 'Start Recording'}
        onPress={recording ? handleStopRecording : handleStartRecording}
      />      
    </View>

      
    </View>
  );
};

export default Curtains;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  status: {
    fontSize: 18,
    marginBottom: 20,
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginVertical: 10,
    width: "70%",
    alignItems: "center",
  },
  onButton: {
    backgroundColor: "#4CAF50", // Green color for ON
  },
  offButton: {
    backgroundColor: "#BDBDBD", // Grey color for OFF
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

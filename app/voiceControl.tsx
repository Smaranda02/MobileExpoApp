import React, { useState, useEffect, useRef } from "react";
import { View, Button, Text, Alert } from "react-native";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import { MQTTClientSingleton } from "@/mqttService";

interface SpeechCommands {
  action?: string;
  device?: string;
  location?: string; // Optional property
  value?: number,
  other?: string,
  color?: string
}

export default function AudioRecorder() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [audioUri, setAudioUri] = useState<string>("");
  const [transcription, setTranscription] = useState<string>("");
  // const SERVER_URL = "http://192.168.100.92:5000/transcribe"; // Pi IP Hotspot Smara
  const SERVER_URL = "http://192.168.100.102:8000/transcribe"; // Pi IP WIFI Home
  // const SERVER_URL = "https://fast-api-app-production-a1f6.up.railway.app/transcribe";
  // const SERVER_URL = "https://fast-api-app-txk4.onrender.com/transcribe"

  const mqttClient = useRef<MQTTClientSingleton | null>(null); // Use useRef for MQTT client
  const [connected, setConnected] = useState<boolean>(false);

  useEffect(() => {
    async function requestPermissions() {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "You need to allow microphone access.");
      }
    }
    requestPermissions();
  }, []);

  
  useEffect(() => {
      mqttClient.current = MQTTClientSingleton.getInstance();
  
      setConnected(mqttClient.current.isConnected());
  
      return () => {
        mqttClient.current?.disconnect(); // Disconnect on component unmount
      };
  }, []);
  

  async function startRecording() {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Please allow microphone access.");
        return;
      }

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      console.log("Recording started...");
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  }

  async function stopRecording() {
    try {
      if (!recording) return;

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI(); // Get the audio file URI
      setRecording(null);
      console.log("Recording saved at:", uri);

      if (!uri) return;

      // Move file to a writable storage directory
      const newPath = `${FileSystem.documentDirectory}recorded_audio.wav`;
      await FileSystem.moveAsync({
        from: uri,
        to: newPath,
      });

      setAudioUri(newPath);
      // console.log("Audio saved to:", newPath);

      // Send audio file to Raspberry Pi for transcription
      sendAudioToServer(newPath);
    } catch (err) {
      console.error("Failed to stop recording", err);
    }
  }

  
  const handleCommandPublish = (topic:any, command: any) => {
    if (mqttClient.current?.isConnected()) {
      const messageContent = JSON.stringify({command});
      mqttClient.current?.publishMessage(topic, messageContent);
      console.log(`Message published: ${messageContent}`);
    } else {
      console.log("Not connected to MQTT broker");
    }
  };

  async function sendAudioToServer(uri: string) {
    try {
      const formData = new FormData();
      if(uri){
      formData.append("file", {
        uri: uri,
        name: "audio.wav",
        type: "audio/wav",
      } as any);
    }

      console.log("Sending file to server:", uri);

      const response = await fetch(SERVER_URL, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const result = await response.json();
      console.log("Transcription result:", result.transcription);
      console.log("NER", result.NER);

      setTranscription(result.NER || "No transcription received.");

      let result_entities = result.NER;
      

      const jsonData : SpeechCommands[] = JSON.parse(result_entities) //daca are "" pe keys
      
      for(var data of jsonData){
        var topic = `esp32/${data["location"]}`
        var command = data["action"];
        
        handleCommandPublish(topic, command);
      }

    } catch (err) {
      console.error("Error sending audio:", err);
      Alert.alert("Error", "Failed to send audio to server.");
    }
  }

  return (
    <View>
      <Button title="Start Recording" onPress={startRecording} disabled={recording !== null} />
      <Button title="Stop & Send" onPress={stopRecording} disabled={recording === null} />
      {transcription && <Text>Transcription {transcription}</Text>}

    </View>
  );
}

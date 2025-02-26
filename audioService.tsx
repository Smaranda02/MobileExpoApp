

import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import { Alert } from "react-native";
import { MQTTClientSingleton } from "@/mqttService";

export interface SpeechCommands {
  action?: string;
  device?: string;
  location?: string;
  value?: number;
  other?: string;
  color?: string;
}

class AudioService {
  private recording: Audio.Recording | null = null;
  private audioUri: string = "";
  private transcription: string = "";
  private entities: string = "";
  // private SERVER_URL = "http://192.168.100.102:8000/transcribe"; //home wifi
  private SERVER_URL = "http://192.168.191.206:8000/transcribe" //Smara hotspot 

  constructor() {
  }

  async requestPermissions() {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "You need to allow microphone access.");
      throw new Error("Microphone permission not granted");
    }
  }

  async startRecording() {
    try {
      await this.requestPermissions();

      if (this.recording) {
        console.warn("Recording is already in progress.");
        return; // Prevent starting a new recording if one is already active
      }

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      this.recording = recording;
      console.log("Recording started...");
    } catch (err) {
      console.error("Failed to start recording", err);
      Alert.alert("Error", "Failed to start recording.");
    }
  }

  async stopRecording() {
    try {
      if (!this.recording) {
        console.warn("No recording in progress.");
        return; // No recording to stop
      }

      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      this.recording = null; // Reset the recording instance
      console.log("Recording saved at:", uri);

      if (!uri) return;

      // Move file to a writable storage directory
      const newPath = `${FileSystem.documentDirectory}recorded_audio.wav`;
      await FileSystem.moveAsync({
        from: uri,
        to: newPath,
      });

      this.audioUri = newPath;
      await this.sendAudioToServer(newPath);
    } catch (err) {
      console.error("Failed to stop recording", err);
      Alert.alert("Error", "Failed to stop recording.");
    }
  }

  async sendAudioToServer(uri: string) {
    try {
      const formData = new FormData();
      formData.append("file", {
        uri: uri,
        name: "audio.wav",
        type: "audio/wav",
      } as any);

      console.log("Sending file to server:", uri);

      const response = await fetch(this.SERVER_URL, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const result = await response.json();
      console.log("Transcription result:", result.transcription);
      console.log("NER", result.NER);

      this.entities = result.NER || "No transcription received.";

    } catch (err) {
      console.error("Error sending audio:", err);
      Alert.alert("Error", "Failed to send audio to server.");
    }
  }

  getTranscription() {
    return this.transcription;
  }

  getEntities() {
    return this.entities;
  }
}

export default new AudioService();

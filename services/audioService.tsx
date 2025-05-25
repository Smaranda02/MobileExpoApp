

// import { AudioRecorder, AudioModule, useAudioRecorder, RecordingPresets } from "expo-audio";
// import * as FileSystem from "expo-file-system";
// import { Alert } from "react-native";
// import { MQTTClientSingleton } from "@/mqttService";

// export interface SpeechCommands {
//   action?: string;
//   device?: string;
//   location?: string;
//   value?: number;
//   other?: string;
//   color?: string;
// }

// class AudioService {
//   private recording: AudioRecorder | null = null;
//   private audioUri: string = "";
//   private transcription: string = "";
//   private entities: string = "";
//   // private SERVER_URL = "http://192.168.100.102:8000/transcribe"; //cernisoara wifi
//   // private SERVER_URL = "http://192.168.191.206:8000/transcribe" //Smara hotspot 
//   private SERVER_URL = "http://192.168.1.102:8000/transcribe" //foisorului wifi

//   constructor() {
//   }

//   async requestPermissions() {
//     const { status } = await AudioModule.requestRecordingPermissionsAsync();
//     if (status !== "granted") {
//       Alert.alert("Permission Denied", "You need to allow microphone access.");
//       throw new Error("Microphone permission not granted");
//     }
//   }

//   async startRecording() {
//     try {
//       await this.requestPermissions();

//       if (this.recording) {
//         console.warn("Recording is already in progress.");
//         return; // Prevent starting a new recording if one is already active
//       }

//       const recording = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

//       this.recording = recording;
//       console.log("Recording started...");
//     } catch (err) {
//       console.error("Failed to start recording", err);
//       Alert.alert("Error", "Failed to start recording.");
//     }
//   }

//   async stopRecording() {
//     try {
//       if (!this.recording) {
//         console.warn("No recording in progress.");
//         return; // No recording to stop
//       }

//       await this.recording.stop();
//       const uri = this.recording.uri;
//       this.recording = null; // Reset the recording instance
//       console.log("Recording saved at:", uri);

//       if (!uri) return;

//       // Move file to a writable storage directory
//       const newPath = `${FileSystem.documentDirectory}recorded_audio.wav`;
//       await FileSystem.moveAsync({
//         from: uri,
//         to: newPath,
//       });

//       this.audioUri = newPath;
      
//       await this.sendAudioToServer(newPath);
//     } catch (err) {
//       console.error("Failed to stop recording", err);
//       Alert.alert("Error", "Failed to stop recording.");
//     }
//   }

//   async sendAudioToServer(uri: string) {
//     try {
//       const formData = new FormData();
//       formData.append("file", {
//         uri: uri,
//         name: "audio.wav",
//         type: "audio/wav",
//       } as any);

//       console.log("Sending file to server:", uri);

//       const response = await fetch(this.SERVER_URL, {
//         method: "POST",
//         body: formData,
//         // headers: {
//         //   "Content-Type": "multipart/form-data",
//         // },
//       });

//       const result = await response.json();
//       console.log("Transcription result:", result.transcription);
//       console.log("NER : ", result.NER);

//       this.entities = result.NER || "No transcription received.";

//     } catch (err) {
//       console.error("Error sending audio:", err);
//       Alert.alert("Error", "Failed to send audio to server.");
//     }
//   }

//   getTranscription() {
//     return this.transcription;
//   }

//   getEntities() {
//     return this.entities;
//   }
// }

// export default new AudioService();




// import { AudioRecorder, AudioModule, RecordingOptions, RecordingOptionsAndroid, RecordingOptionsIos, RecordingPresets } from "expo-audio";
// import * as FileSystem from "expo-file-system";
// import { Alert } from "react-native";
// import { MQTTClientSingleton } from "@/mqttService";
// import { AudioQuality } from "expo-audio";
// import { IOSOutputFormat } from "expo-audio";

// export interface SpeechCommands {
//   action?: string;
//   device?: string;
//   location?: string;
//   value?: number;
//   other?: string;
//   color?: string;
// }

// class AudioService {
//   private recording: AudioRecorder | null = null;
//   private audioUri: string = "";
//   private transcription: string = "";
//   private entities: string = "";
//   // private SERVER_URL = "http://192.168.100.102:8000/transcribe"; //cernisoara wifi
//   // private SERVER_URL = "http://192.168.191.206:8000/transcribe" //Smara hotspot 
//   private SERVER_URL = "http://192.168.1.102:8000/transcribe" //foisorului wifi

//   constructor() {
//   }

//   async requestPermissions() {
//     const { status } = await AudioModule.requestRecordingPermissionsAsync();
//     if (status !== "granted") {
//       Alert.alert("Permission Denied", "You need to allow microphone access.");
//       throw new Error("Microphone permission not granted");
//     }
//   }

//   async startRecording() {
//     try {
//       await this.requestPermissions();

//       if (this.recording) {
//         console.warn("Recording is already in progress.");
//         return; // Prevent starting a new recording if one is already active
//       }

      

//       const optionsAndroid : RecordingOptionsAndroid = {
//           extension: "",
//           outputFormat: "mpeg4",
//           audioEncoder : "default"
//       }; 

//       const optionsIos : RecordingOptionsIos = {
//         extension: "",
//         outputFormat: IOSOutputFormat.MPEG4AAC,
//         audioQuality : AudioQuality.HIGH
//     }; 

//       const options : Partial<RecordingOptions> = {
//        extension : "",
//        android : optionsAndroid,
//        ios: optionsIos
//       };

//       console.log("Hello;")
//       const recorder : AudioRecorder = new AudioRecorder(options);
//       const a = new AudioRecorder(RecordingPresets.HIGH_QUALITY);
//       console.log("Recorder : ", new AudioRecorder(RecordingPresets.HIGH_QUALITY));
//       await recorder.prepareToRecordAsync();
      
//       await recorder.record();
//       this.recording = recorder;
//       console.log("Recording started...");
//     } catch (err) {
//       console.error("Failed to start recording", err);
//       Alert.alert("Error", "Failed to start recording.");
//     }
//   }

//   async stopRecording() {
//     try {
//       if (!this.recording) {
//         console.warn("No recording in progress.");
//         return; // No recording to stop
//       }

//       await this.recording.stop();
//       const uri = this.recording.uri;
//       this.recording = null; // Reset the recording instance
//       console.log("Recording saved at:", uri);

//       if (!uri) return;

//       // Move file to a writable storage directory
//       const newPath = `${FileSystem.documentDirectory}recorded_audio.mpeg4`;
//       await FileSystem.moveAsync({
//         from: uri,
//         to: newPath,
//       });

//       this.audioUri = newPath;
      
//       await this.sendAudioToServer(newPath);
//     } catch (err) {
//       console.error("Failed to stop recording", err);
//       Alert.alert("Error", "Failed to stop recording.");
//     }
//   }

//   async sendAudioToServer(uri: string) {
//     try {
//       const formData = new FormData();
//       formData.append("file", {
//         uri: uri,
//         name: "audio.mpeg4",
//         type: "audio/mpeg4",
//       } as any);

//       console.log("Sending file to server:", uri);

//       const response = await fetch(this.SERVER_URL, {
//         method: "POST",
//         body: formData,
//         // headers: {
//         //   "Content-Type": "multipart/form-data",
//         // },
//       });

//       const result = await response.json();
//       console.log("Transcription result:", result.transcription);
//       console.log("NER : ", result.NER);

//       this.transcription = result.transcription || "No transcription received.";
//       this.entities = result.NER || "No entities received.";

//     } catch (err) {
//       console.error("Error sending audio:", err);
//       Alert.alert("Error", "Failed to send audio to server.");
//     }
//   }

//   getTranscription() {
//     return this.transcription;
//   }

//   getEntities() {
//     return this.entities;
//   }
// }

// export default new AudioService();



// // Create a new recorder instance instead of using the hook
//       // const options : Partial<RecordingOptions> = {
//       //   // preset: RecordingPresets.HIGH_QUALITY,
//       //   android: {
//       //     extension: '.wav',
//       //     // outputFormat: 1, // wav format
//       //     // audioEncoder: 2, // PCM encoding
//       //   },
//       //   ios: {
//       //     extension: '.wav',
//       //     outputFormat: 'lpcm', // Linear PCM
//       //     // audioQuality: 'max',
//       //     sampleRate: 44100,
//       //     // numberOfChannels: 2,
//       //     // bitRate: 128000,
//       //     linearPCMBitDepth: 16,
//       //     linearPCMIsBigEndian: false,
//       //     linearPCMIsFloat: false,
//       //   },
//       // };






import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { SERVER_IP } from '@/constants';

import {
  useAudioRecorder,
  AudioModule,
  RecordingPresets,
} from 'expo-audio';

export interface SpeechCommands {
  action?: string;
  device?: string;
  location?: string;
  value?: number;
  other?: string;
  color?: string;
}

const SERVER_URL = `http://${SERVER_IP}:8000/transcribe`; // foisorului wifi

export function useAudioService() {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [entities, setEntities] = useState('');
  const [audioUri, setAudioUri] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await AudioModule.requestRecordingPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'You need to allow microphone access.');
      }
    })();
  }, []);

  const startRecording = async () => {
    try {
      await recorder.prepareToRecordAsync();
      recorder.record();
      setIsRecording(true);
      console.log('Recording started...');
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Error', 'Failed to start recording.');
    }
  };

  
  const stopRecording = async () => {
    try {
      await recorder.stop(); // capture stop result
      setIsRecording(false);
  
      const uri = recorder?.uri; // get the actual uri returned from stop()
      if (!uri) {
        console.warn('No URI returned from stop()');
        return;
      }  
      console.log('Recording saved at:', uri);
  
      // const newPath = `${FileSystem.documentDirectory}recorded_audio.m4a`;
      // await FileSystem.copyAsync({
      //   from: uri,
      //   to: newPath,
      // });
  
      const fileUri = uri.startsWith('file://') ? uri : `file://${uri}`;
      setAudioUri(fileUri);
      return await sendAudioToServer(fileUri);
  
    } catch (err) {
      console.error('Failed to stop recording', err);
      Alert.alert('Error', 'Failed to stop recording.');
    }
  };
  
  
  const sendAudioToServer = async (uri: string) => {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri,
        name: 'audio.m4a',
        type: 'audio/m4a',
      } as any);

      console.log('Sending file to server:', uri);

      const response = await fetch(SERVER_URL, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      console.log('Transcription result:', result.transcription);
      console.log('NER:', result.NER);

      setTranscription(result.transcription || 'No transcription received.');
      setEntities(result.NER || 'No entities received.');

      return result;
    } catch (err) {
      console.error('Error sending audio:', err);
      Alert.alert('Error', 'Failed to send audio to server.');
    }
  };

  return {
    isRecording,
    startRecording,
    stopRecording,
    transcription,
    entities,
    audioUri,
    recorder
  };
}

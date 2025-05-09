import { Text, TouchableOpacity, View, Button, TextInput, StyleSheet, ActivityIndicator, SafeAreaView, ScrollView, Alert } from "react-native";
import { Link, Redirect, router } from "expo-router";
import CustomButton from "@/components/CustomButton";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { useAudioRecorder, RecordingPresets, AudioModule } from "expo-audio";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import VoiceProcessingService from "@/services/voiceProcessingService";
import { useAudioService } from "@/services/audioService";

export default function FirstPage() {
  const [recording, setRecording] = useState<boolean>(false);
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  const [recordingEntities, setRecordingEntities] = useState("");


  const {
    recorder,
    startRecording,
    stopRecording,
    transcription,
    entities,
  } = useAudioService();


  useEffect(() => {
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        Alert.alert('Microphone permission denied');
      }
    })();
  }, []);


  
    const processTranscription = (result_entities: any) => {
      try {
        // console.log("the result : ", result_entities)
        // const jsonData = Array.isArray(result_entities) ? result_entities : JSON.parse(result_entities);
        var jsonData = JSON.parse(result_entities);
    
        //For use Effect test of calling the handlePublishColor twice 
        // const topic = `esp32`;
        // setRed(0);
        // handleColorPublish(topic);
        
        for (const data of jsonData) {

          const device =  data.device?.toLowerCase();
          const other = data.other;


          if(device === "curtains" || device == "rollers" || device === "curtain" || device == "roller" ){
            VoiceProcessingService.processCurtains(data);
          }
          else if(device === 'lights' || device === 'leds' || device === 'light' || device === 'led'){
            VoiceProcessingService.processLights(data);
          }
          else if(device === 'heater' || device === 'thermostat' || device === 'heat' || other === "temperature"){
            VoiceProcessingService.processHeater(data);
          }
          else if(device === 'ac' || device === 'fan' || device === 'ventilator'){
            VoiceProcessingService.processAC(data);
          }
        }

        // VoiceProcessingService.processAC({"device" : "fan", "action": "on"});
    
      } catch (error) {
        console.error("Failed to process transcription:", error);
      }
    }
  

  const handleMicPress = async () => {
    if (recorder.isRecording) {
      let result = await stopRecording();
      // processTranscription(entities);
      processTranscription(result.NER);
    } else {
      await startRecording();
    }
  };


    
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.title}>Welcome to your Smart Home Controller</Text>
  
          <View style={styles.linkGroup}>
            <Link href="/ledControl" style={styles.link}>LED Control</Link>
            <Link href="/temperature" style={styles.link}>Temperature Control</Link>
            <Link href="/socket" style={styles.link}>Smart Socket Control</Link>
            <Link href="/curtains" style={styles.link}>Curtains Control</Link>
            <Link href="/airQuality" style={styles.link}>Air Quality</Link>
          </View>
  
          <CustomButton
            title="Continue with Email"
            handlePress={() => router.push("/sign-in")}
            containerStyles="w-full mt-7"
            textStyles=""
            isLoading={false}
          />
  

           <View style={styles.container}>
                <TouchableOpacity
                  style={[styles.micButton, styles.recordingButton  && styles.recordingButton]}
                  onPress={handleMicPress}
                >
                  {recorder.isRecording ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <MaterialCommunityIcons name="microphone" size={40} color="#ffffff" />
                  )}
                </TouchableOpacity>
          
          </View> 
          
        </ScrollView>
  
        <StatusBar backgroundColor="#161622" style="light" />
      </SafeAreaView>
    );
  }
  
  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: '#b3bffd',
    },
    container: {
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
    },
    scrollContainer: {
      padding: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center',
      paddingBottom: 20,
      marginTop: 30
    },
    linkGroup: {
      width: '100%',
      gap: 10,
      marginBottom: 20,
    },
    link: {
      fontSize: 16,
      color: 'white',
      backgroundColor: '#4a90e2',
      paddingVertical: 10,
      textAlign: 'center',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#357ABD',
    },
    microphoneSection: {
      marginTop: 30,
      alignItems: 'center',
    },
    micButton: {
      width: 70,
      height: 70,
      borderRadius: 35,
      backgroundColor: "#ff4081",
      alignItems: "center",
      justifyContent: "center",
      marginTop: 10,
      elevation: 5,
    },
    recordingButton: {
      backgroundColor: "#d50000",
    },
  });
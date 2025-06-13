import {
  Text,
  TouchableOpacity,
  View,
  Button,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { Link, Redirect, router } from "expo-router";
import CustomButton from "@/components/CustomButton";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import { useAudioRecorder, RecordingPresets, AudioModule } from "expo-audio";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import VoiceProcessingService from "@/services/voiceProcessingService";
import { useAudioService } from "@/services/audioService";
import { PRIMARY_COLOR, SECONDARY_COLOR, DARKER_PRIMARY, BACKGROUND_COLOR, LIGHTER_PRIMARY, LIGHTER_PRIMARY2, MQTT_TOPIC_UPDATE_RESPONSE_1, MQTT_TOPIC_UPDATE_RESPONSE_2 } from "@/constants";
import { useMqttStore } from "@/stores/useMqttStore";
import { useSession } from "@/services/authContext";
import { MQTTPublisher } from "@/services/mqttPublisher";
import { MQTTClientSingleton } from "@/services/mqttService";

import { useCurtainsStore } from "@/stores/useCurtainsStore";
import { useLedStore } from "@/stores/useLedStore";
import { useTemperatureStore } from "@/stores/useTemperatureStore";

export default function FirstPage() {
  const [recording, setRecording] = useState<boolean>(false);
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const { connected } = useMqttStore();
  const [recordingEntities, setRecordingEntities] = useState("");
  const mqttClient = useRef<MQTTClientSingleton | null>(null); // Use useRef for MQTT client

  const {updateColorsFromMCU} = useLedStore();
  const {updateFanStateFromMCU, updateHeaterStateFromMCU} = useTemperatureStore();
  const {updateCurtainsStateFromMCU} = useCurtainsStore();


  const { recorder, startRecording, stopRecording, transcription, entities } =
    useAudioService();

  const { signOut } = useSession();

  useEffect(() => {
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        Alert.alert("Microphone permission denied");
      }
    })();

    MQTTPublisher.publishStateUpdateRequest();
  }, []);

   useEffect(() => {
    mqttClient.current = MQTTClientSingleton.getInstance();

     // Handle incoming messages
     const messageHandler =  (topic: string, payload: string) => {
          const data = JSON.parse(payload); // Deserialize JSON

          if(topic === MQTT_TOPIC_UPDATE_RESPONSE_1){
             console.log(data);
             updateColorsFromMCU(data.redLiving, data.greenLiving, data.blueLiving, data.brightnessLiving, "bathroom");
             updateColorsFromMCU(data.redBedroom, data.greenBedroom, data.blueBedroom, data.brightnessBedroom, "bedroom");
             updateFanStateFromMCU(data.fan);
          }
          else if(topic == MQTT_TOPIC_UPDATE_RESPONSE_2){
             updateHeaterStateFromMCU(data.heater);
             updateCurtainsStateFromMCU(data.curtains)
          }
    };

    mqttClient.current.registerMessageCallback(messageHandler);
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
        const device = data.device?.toLowerCase();
        const other = data.other;

        if (
          device === "curtains" ||
          device == "rollers" ||
          device === "curtain" ||
          device == "roller"
        ) {
          VoiceProcessingService.processCurtains(data);
        } else if (
          device === "lights" ||
          device === "leds" ||
          device === "light" ||
          device === "led"
        ) {
          VoiceProcessingService.processLights(data);
        } else if (
          device === "heater" ||
          device === "thermostat" ||
          device === "heat" ||
          other === "temperature"
        ) {
          VoiceProcessingService.processHeater(data);
        } else if (
          device === "ac" ||
          device === "fan" ||
          device === "ventilator"
        ) {
          VoiceProcessingService.processAC(data);
        }
      }

      // VoiceProcessingService.processAC({"device" : "fan", "action": "on"});
    } catch (error) {
      console.error("Failed to process transcription:", error);
    }
  };

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

      <View style={Platform.OS == 'web' ? styles.topRightWeb : styles.topRight}>
            <TouchableOpacity onPress={signOut}>
              <Text style={Platform.OS=='web' ? styles.logoutTextWeb : styles.logoutText}>Logout</Text>
            </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={Platform.OS =="web" ? styles.titleWeb : styles.title}>
          Welcome to {"\n"} Smart Home Controller
        </Text>

        <View style={styles.linkGroup}>
          <Link href="/ledControl" style={Platform.OS =="web" ? styles.linkWeb : styles.link}>
            LED Control
          </Link>
          <Link href="/temperature" style={Platform.OS =="web" ? styles.linkWeb : styles.link}>
            Temperature Control
          </Link>
          <Link href="/socket" style={Platform.OS =="web" ? styles.linkWeb : styles.link}>
            Smart Socket Control
          </Link>
          <Link href="/airQuality" style={Platform.OS =="web" ? styles.linkWeb : styles.link}>
            Air Quality
          </Link>
          <Link href="/consumption" style={Platform.OS =="web" ? styles.linkWeb : styles.link}>
            Consumption
          </Link>
          <Link href="/programControl" style={Platform.OS =="web" ? styles.linkWeb : styles.link}>
            Curtains & LED Schedule
          </Link>
        </View>

        <Text style={Platform.OS == "web" ? styles.statusWeb : styles.status}>
          MQTT : {connected ? "✅ Connected" : "🔄 Connecting..."}
                    {/* MQTT : ✅ Connected */}

        </Text>

        {/* <CustomButton
          title="Continue with Email"
          handlePress={() => router.push("/sign-in")}
          containerStyles="w-full mt-7"
          textStyles=""
          isLoading={false}
        /> */}

        {Platform.OS != "web" ? 
        <View style={styles.container}>
          <TouchableOpacity
            style={[
              styles.micButton,
              recorder.isRecording && styles.recordingButton,
            ]}
            onPress={handleMicPress}
          >
            {recorder.isRecording ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <MaterialCommunityIcons
                name="microphone"
                size={40}
                color="#ffffff"
              />
            )}
          </TouchableOpacity>

          <Text style={styles.label}>
            {recorder.isRecording ? "Listening..." : "Tap to Speak"}
          </Text>
          
        </View>
        :
        <></>
        }
      </ScrollView>

      <StatusBar style="light" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  scrollContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 50
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    paddingBottom: 20,
    marginTop: 30,
  },
  titleWeb: {
    fontSize: 50,
    fontWeight: "bold",
    textAlign: "center",
    paddingBottom: 20,
    marginTop: -45,
    marginBottom: 50
  },
  linkGroup: {
    width: "100%",
    maxWidth: 500,
    gap: 10,
    marginBottom: 20,
  },
  link: {
    fontSize: 16,
    color: "white",
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 10,
    textAlign: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: DARKER_PRIMARY,
  },
  linkWeb: {
    fontSize: 40,
    color: "white",
    backgroundColor: PRIMARY_COLOR,
    // backgroundColor: "#007AFF",
    paddingVertical: 10,
    textAlign: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: DARKER_PRIMARY,
  },
  status: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  statusWeb: {
    fontSize: 30,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  microphoneSection: {
    marginTop: 30,
    alignItems: "center",
  },
  micButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: PRIMARY_COLOR,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    elevation: 5,
  },
  recordingButton: {
    backgroundColor: "#c1121f",
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1E1E1E",
    marginVertical: 8,
    textAlign: "center",
  },
  topRight: {
  position: 'absolute',
  top: 30,
  right: 20,
  zIndex: 999,
  borderWidth: 1,
  borderColor: PRIMARY_COLOR,
  backgroundColor: LIGHTER_PRIMARY2,
  borderRadius: 5,
  padding: 8,
  },

  topRightWeb: {
  position: 'absolute',
  top: 20,
  right: 20,
  zIndex: 999,
  borderWidth: 1,
  borderColor: LIGHTER_PRIMARY,
  backgroundColor: LIGHTER_PRIMARY2,
  borderRadius: 5,
  padding: 4
  },

  logoutText: {
  fontSize: 16,
  color: "white",
  fontWeight: 'bold',
  },


  logoutTextWeb: {
  fontSize: 40,
  color: DARKER_PRIMARY,
  fontWeight: 'bold',
  },

});

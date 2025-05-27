import React, { useState, useEffect, useRef } from "react";
// import useAudioService from "@/audioService";
import {
  View,
  Text,
  Button,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import VoiceProcessingService from "@/services/voiceProcessingService";
import { useLedStore } from "@/stores/useLedStore";
import { Room } from "@/stores/useLedStore";
import { useAudioService } from "@/services/audioService";
import { PRIMARY_COLOR, SECONDARY_COLOR, DARKER_PRIMARY } from "@/constants";
import { useSharedValue, withTiming } from "react-native-reanimated";
let Slider;

if (Platform.OS === "web") {
  Slider = require('react-native-awesome-slider').Slider; // NOT `.Slider`
} else {
  Slider = require("@react-native-community/slider").default; // Use `.default` here
}

const LedControl = () => {
  const {
    red,
    green,
    blue,
    brightness,
    brightnessBedroom,
    redBedroom,
    greenBedroom,
    blueBedroom,
    selectedRoom,
    setColor,
    setRoom,
  } = useLedStore();

  const progressBrightness = useSharedValue(0);
  const progressBlue = useSharedValue(0);
  const progressGreen = useSharedValue(0);
  const progressRed = useSharedValue(0);

  const min = useSharedValue(0);
  const max = useSharedValue(255);
  const [forceUpdateRed, setForceUpdateRed] = useState(0);
  const [forceUpdateBlue, setForceUpdateBlue] = useState(100);
  const [forceUpdateGreen, setForceUpdateGreen] = useState(200);
  const [forceUpdateBrightness, setForceUpdateBrightness] = useState(300);
  const [forceUpdateBrightnessBedroom, setForceUpdateBrightnessBedroom] = useState(700);

  const { recorder, startRecording, stopRecording, transcription, entities } =
    useAudioService();

  const processTranscription = (result_entities: any) => {
    try {
      var jsonData = JSON.parse(result_entities);

      console.log("Json data in component: ", JSON.parse(result_entities));

      //For use Effect test of calling the handlePublishColor twice
      // const topic = `esp32`;
      // setRed(0);
      // handleColorPublish(topic);

      for (const data of jsonData) {
        VoiceProcessingService.processLights(data);
      }
    } catch (error) {
      console.error("Failed to process transcription:", error);
    }
  };


  useEffect(() => {
  if (selectedRoom === "living") {
    progressRed.value = red;
    progressGreen.value = green;
    progressBlue.value = blue;
    progressBrightness.value = brightness;
  } else {
    progressRed.value = redBedroom;
    progressGreen.value = greenBedroom;
    progressBlue.value = blueBedroom;
    progressBrightness.value = brightnessBedroom;
  }

  setForceUpdateRed((prev) => prev + 1);
  setForceUpdateGreen((prev) => prev + 1);
  setForceUpdateBlue((prev) => prev + 1);
  selectedRoom === "living"
    ? setForceUpdateBrightness((prev) => prev + 1)
    : setForceUpdateBrightnessBedroom((prev) => prev + 1);

}, [selectedRoom, red, green, blue, brightness, redBedroom, greenBedroom, blueBedroom, brightnessBedroom]);


  const turnOnOFF = (value: number) => {
    if (value == 1) {
      setColor(0, 0, 0, value);

    } else {
      setColor(value, value, value, value);
    }
  };

  const handleMicPress = async () => {
    if (recorder.isRecording) {
      let result = await stopRecording();
      // processTranscription(entities);
      console.log("IN component: ", result.NER);
      processTranscription(result.NER);
    } else {
      await startRecording();
    }
  };

  const rerender = () => {
    if(Platform.OS === 'web'){
      setForceUpdateRed((prev) => prev + 1);
      setForceUpdateBlue((prev) => prev + 1);
      setForceUpdateGreen((prev) => prev + 1);
      selectedRoom == "living" ? setForceUpdateBrightness((prev) => prev + 1) : setForceUpdateBrightnessBedroom((prev) => prev + 1)
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.card}>
        <TouchableOpacity
          style={[
            styles.button,
            brightness > 1 || red || blue || green ? styles.onButton : styles.offButton,
          ]}
          onPress={() => turnOnOFF(brightness > 1 || red || blue || green ? 1 : 255)}
        >
          <Text style={styles.buttonText}>
            {brightness > 1 || red || blue || green ? "Turn OFF" : "Turn ON"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Choose Room: {selectedRoom}</Text>
        <Picker
          selectedValue={selectedRoom}
          onValueChange={(itemValue) => {setRoom(itemValue); rerender();}}
          style={styles.picker}
        >
          <Picker.Item label="Living Room" value="living" />
          <Picker.Item label="Bedroom" value="bedroom" />
        </Picker>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>
          Red:
          {selectedRoom == "living" ? red : redBedroom}
        </Text>

        {Platform.OS === "web" ? ( 

          <Slider
            key={forceUpdateRed}
            progress={progressRed}
            minimumValue={min}
            maximumValue={max}
            onValueChange={(value: number) => 
                {selectedRoom === "living"
                ? setColor(Math.round(value), green, blue, brightness)
                : setColor(
                    Math.round(value),
                    greenBedroom,
                    blueBedroom,
                    brightnessBedroom
                  )
                progressRed.value = value
                }
            }
            steps={5}
            snapToStep={true}
            theme={{
              maximumTrackTintColor: '#E0E0E0', // background track color
              minimumTrackTintColor: "red", // <- blue track
              thumbTintColor: "red" // <- blue thumb
            }}
          />
        ) : (
          <Slider
            minimumValue={0}
            maximumValue={255}
            value={selectedRoom == "living" ? red : redBedroom}
            onValueChange={(value: number) =>
              selectedRoom === "living"
                ? setColor(Math.round(value), green, blue, brightness)
                : setColor(
                    Math.round(value),
                    greenBedroom,
                    blueBedroom,
                    brightnessBedroom
                  )
            }
            step={55}
            minimumTrackTintColor="#EF5350"
            stepMarked="true"
          />
        )}

        <Text style={styles.label}>
          Green: {selectedRoom == "living" ? green : greenBedroom}
        </Text>
        {Platform.OS !== "web" ? (
          <Slider
            minimumValue={0}
            maximumValue={255}
            value={selectedRoom == "living" ? green : greenBedroom}
            onValueChange={(value: any) =>
              selectedRoom === "living"
                ? setColor(red, Math.round(value), blue, brightness)
                : setColor(
                    redBedroom,
                    Math.round(value),
                    blueBedroom,
                    brightnessBedroom
                  )
            }
            step={55}
            minimumTrackTintColor="#66BB6A"
          />
        ) : (
           <Slider
            key={forceUpdateGreen}
            progress={progressGreen}
            minimumValue={min}
            maximumValue={max}
            onValueChange={(value: number) =>
              selectedRoom === "living"
                ? setColor(red, Math.round(value), blue, brightness)
                : setColor(
                    redBedroom,
                    Math.round(value),
                    blueBedroom,
                    brightnessBedroom
                  )
            }
            steps={5}
            snapToStep={true}
            theme={{
              maximumTrackTintColor: '#E0E0E0', // background track color
              minimumTrackTintColor: "green", // <- blue track
              thumbTintColor: "green" // <- blue thumb
            }}
            
          />
        )}

        <Text style={styles.label}>
          Blue: {selectedRoom == "living" ? blue : blueBedroom}
        </Text>
        {Platform.OS !== "web" ? (
          <Slider
            minimumValue={0}
            maximumValue={255}
            value={selectedRoom == "living" ? blue : blueBedroom}
            onValueChange={(value: any) =>
              selectedRoom === "living"
                ? setColor(red, green, Math.round(value), brightness)
                : setColor(
                    redBedroom,
                    greenBedroom,
                    Math.round(value),
                    brightnessBedroom
                  )
            }
            step={55}
            minimumTrackTintColor={PRIMARY_COLOR}
          />
        ) : (
          <Slider
            key={forceUpdateBlue}
            progress={progressBlue}
            minimumValue={min}
            maximumValue={max}
             onValueChange={(value: any) =>
              selectedRoom === "living"
                ? setColor(red, green, Math.round(value), brightness)
                : setColor(
                    redBedroom,
                    greenBedroom,
                    Math.round(value),
                    brightnessBedroom
                  )
            }
            steps={5}
            snapToStep={true}
            theme={{
              maximumTrackTintColor: '#E0E0E0', // background track color
              minimumTrackTintColor: "blue", // <- blue track
              thumbTintColor: "blue" // <- blue thumb
            }}
          />
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Brightness: {selectedRoom == "living" ? brightness : brightnessBedroom}</Text>
        {Platform.OS !== "web" ? (
          <Slider
            minimumValue={1}
            maximumValue={255}
            step={51}
            value={selectedRoom == "living" ? brightness : brightnessBedroom}
            onValueChange={(value: any) =>
              selectedRoom === "living"
                ? setColor(red, green, blue, Math.round(value))
                : setColor(
                    redBedroom,
                    greenBedroom,
                    blueBedroom,
                    Math.round(value)
                  )
            }
            minimumTrackTintColor={DARKER_PRIMARY}
            thumbTintColor={PRIMARY_COLOR}
            style={{ width: "100%" }}
          />
        ) : (
          <Slider
            key={selectedRoom == "living" ? forceUpdateBrightness : forceUpdateBrightnessBedroom }
            progress={progressBrightness}
            minimumValue={min}
            maximumValue={max}
             onValueChange={(value: any) =>
              selectedRoom === "living"
                ? setColor(red, green, blue, Math.round(value))
                : setColor(
                    redBedroom,
                    greenBedroom,
                    blueBedroom,
                    Math.round(value)
                  )
            }
            steps={5}
            snapToStep={true}
            theme={{
              maximumTrackTintColor: '#E0E0E0', // background track color
              minimumTrackTintColor: PRIMARY_COLOR, // <- blue track
              thumbTintColor: SECONDARY_COLOR // <- blue thumb
            }}
          />        
          )}
      </View>

      <View style={styles.card}>
        <TouchableOpacity
          style={[
            styles.micButton,
            recorder.isRecording && styles.recordingButton,
          ]}
          onPress={handleMicPress}
        >
          {recorder.isRecording ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <MaterialCommunityIcons name="microphone" size={40} color="#fff" />
          )}
        </TouchableOpacity>
        <Text style={styles.label}>
          {recorder.isRecording ? "Listening..." : "Tap to Speak"}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#F0F4F8",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1E1E1E",
    marginVertical: 8,
    textAlign: "center",
  },
  picker: {
    height: 50,
    width: "100%",
    backgroundColor: "#E3F2FD",
    borderRadius: 12,
    marginTop: 10,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    maxWidth: 500,

  },
  onButton: {
    backgroundColor: "#f44336",
  },
  offButton: {
    backgroundColor: "#4caf50",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  micButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: PRIMARY_COLOR,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginVertical: 10,
  },
  recordingButton: {
    backgroundColor: "#D32F2F",
  },
});

export default LedControl;

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
import { PRIMARY_COLOR, SECONDARY_COLOR, DARKER_PRIMARY, LIGHTER_PRIMARY, LIGHTER_PRIMARY2, BACKGROUND_COLOR } from "@/constants";
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
    console.log("Use effect called");
  if (selectedRoom === "bathroom") {
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

      console.log(red, green, blue);

  setForceUpdateRed((prev) => prev + 1);
  setForceUpdateGreen((prev) => prev + 1);
  setForceUpdateBlue((prev) => prev + 1);
  selectedRoom === "bathroom"
    ? setForceUpdateBrightness((prev) => prev + 1)
    : setForceUpdateBrightnessBedroom((prev) => prev + 1);


        console.log(red, green, blue);

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
    console.log("Rerender called");

    console.log("Living: ", red,green,blue);
    console.log("Bedroom: ", redBedroom,greenBedroom,blueBedroom);

    if(Platform.OS === 'web'){
      setForceUpdateRed((prev) => prev + 1);
      setForceUpdateBlue((prev) => prev + 1);
      setForceUpdateGreen((prev) => prev + 1);
      selectedRoom == "bathroom" ? setForceUpdateBrightness((prev) => prev + 1) : setForceUpdateBrightnessBedroom((prev) => prev + 1)
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.card}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            Platform.OS=='web' ? styles.buttonWeb : styles.button,
             selectedRoom == "bathroom" ? 
             (red || blue || green) ?  styles.onButton : styles.offButton 
             : (redBedroom || blueBedroom || greenBedroom) ? styles.onButton : styles.offButton ,
          ]}
          onPress={() => turnOnOFF(selectedRoom == "bathroom" ? 
            (red || blue || green ? 1 : 255) 
            : (redBedroom || blueBedroom || greenBedroom ? 1 : 255))}
        >
      <Text style={Platform.OS=='web' ? styles.buttonTextWeb : styles.buttonText}>
            { 
             selectedRoom == "bathroom" ? 
             (red || blue || green) ? "Turn OFF" : "Turn ON" 
             : (redBedroom || blueBedroom || greenBedroom) ? "Turn OFF" : "Turn ON"  }
          </Text>
        </TouchableOpacity>
      </View>
      </View>

      <View style={styles.card}>
      <Text style={Platform.OS=='web' ? styles.labelWeb : styles.label}>
          Choose Room: {selectedRoom.charAt(0).toUpperCase() + selectedRoom.slice(1)}</Text>
          <View style={{"alignItems": "center"}}>
            <Picker
              selectedValue={selectedRoom}
              onValueChange={(itemValue) => {setRoom(itemValue); rerender();}}
              style={Platform.OS=='web' ? styles.pickerWeb : styles.picker}
            >
              <Picker.Item label="Bathroom" value="bathroom"/>
              <Picker.Item label="Bedroom" value="bedroom" />
            </Picker>
        </View>
      </View>

      <View style={styles.card}>
      <Text style={Platform.OS=='web' ? styles.labelWeb : styles.label}>
          Red:
          {selectedRoom == "bathroom" ? red : redBedroom}
        </Text>

        {Platform.OS === "web" ? ( 
          <View >
          <Slider
            key={forceUpdateRed}
            progress={progressRed}
            minimumValue={min}
            maximumValue={max}
            onValueChange={(value: number) => 
                {selectedRoom === "bathroom"
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
              maximumTrackTintColor: '#E0E0E0',
              minimumTrackTintColor: "#c1121f",
              thumbTintColor: '#c1121f',    
              bubbleBackgroundColor: 'black',
              thumbStyle: {
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: 'black',            // just to be safe, override directly
              },
            }}
            sliderHeight={20}
            markWidth={10}
            thumbWidth={35}
            bubbleWidth={10}
            marksStyle={styles.mark}
            sliderColor="red"
          />
          </View>
        ) : (
          <Slider
            minimumValue={0}
            maximumValue={255}
            value={selectedRoom == "bathroom" ? red : redBedroom}
            onValueChange={(value: number) =>
              selectedRoom === "bathroom"
                ? setColor(Math.round(value), green, blue, brightness)
                : setColor(
                    Math.round(value),
                    greenBedroom,
                    blueBedroom,
                    brightnessBedroom
                  )
            }
            step={55}
            minimumTrackTintColor="#c1121f"
            thumbTintColor="#c1121f"
            stepMarked="true"
          />
        )}

        <Text style={Platform.OS=='web' ? styles.labelWeb : styles.label}>
          Green: {selectedRoom == "bathroom" ? green : greenBedroom}
        </Text>
        {Platform.OS !== "web" ? (
          <Slider
            minimumValue={0}
            maximumValue={255}
            value={selectedRoom == "bathroom" ? green : greenBedroom}
            onValueChange={(value: any) =>
              selectedRoom === "bathroom"
                ? setColor(red, Math.round(value), blue, brightness)
                : setColor(
                    redBedroom,
                    Math.round(value),
                    blueBedroom,
                    brightnessBedroom
                  )
            }
            step={55}
            minimumTrackTintColor="#679436"
            thumbTintColor="#679436"
          />
        ) : (
           <Slider
            key={forceUpdateGreen}
            progress={progressGreen}
            minimumValue={min}
            maximumValue={max}
            onValueChange={(value: number) =>
              selectedRoom === "bathroom"
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
              maximumTrackTintColor: '#E0E0E0', 
              minimumTrackTintColor: "#679436", 
              thumbTintColor: "#679436" 
            }}
             sliderHeight={20}
            markWidth={10}
            thumbWidth={35}
            bubbleWidth={10}
            
          />
        )}

        <Text style={Platform.OS=='web' ? styles.labelWeb : styles.label}>
          Blue: {selectedRoom == "bathroom" ? blue : blueBedroom}
        </Text>
        {Platform.OS !== "web" ? (
          <Slider
            minimumValue={0}
            maximumValue={255}
            value={selectedRoom == "bathroom" ? blue : blueBedroom}
            onValueChange={(value: any) =>
              selectedRoom === "bathroom"
                ? setColor(red, green, Math.round(value), brightness)
                : setColor(
                    redBedroom,
                    greenBedroom,
                    Math.round(value),
                    brightnessBedroom
                  )
            }
            step={55}
            minimumTrackTintColor="#01497c"
            thumbTintColor="#01497c"
          />
        ) : (
          <Slider
            key={forceUpdateBlue}
            progress={progressBlue}
            minimumValue={min}
            maximumValue={max}
             onValueChange={(value: any) =>
              selectedRoom === "bathroom"
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
              minimumTrackTintColor: "#01497c", // <- blue track
              thumbTintColor: "#01497c" // <- blue thumb
            }}
             sliderHeight={20}
            markWidth={10}
            thumbWidth={35}
            bubbleWidth={10}
          />
        )}
      </View>

      <View style={styles.card}>
      <Text style={Platform.OS=='web' ? styles.labelWeb : styles.label}>
          Brightness: {selectedRoom == "bathroom" ? brightness : brightnessBedroom}</Text>
        {Platform.OS !== "web" ? (
          <Slider
            minimumValue={1}
            maximumValue={255}
            step={51}
            value={selectedRoom == "bathroom" ? brightness : brightnessBedroom}
            onValueChange={(value: any) =>
              selectedRoom === "bathroom"
                ? setColor(red, green, blue, Math.round(value))
                : setColor(
                    redBedroom,
                    greenBedroom,
                    blueBedroom,
                    Math.round(value)
                  )
            }
            minimumTrackTintColor="#f7c59f"
            thumbTintColor="#f7c59f"
            style={{ width: "100%" }}
          />
        ) : (
          <Slider
            key={selectedRoom == "bathroom" ? forceUpdateBrightness : forceUpdateBrightnessBedroom }
            progress={progressBrightness}
            minimumValue={min}
            maximumValue={max}
             onValueChange={(value: any) =>
              selectedRoom === "bathroom"
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
              minimumTrackTintColor: "#f7c59f", // <- blue track
              thumbTintColor: "#f7c59f" // <- blue thumb
            }}
             sliderHeight={20}
            markWidth={10}
            thumbWidth={35}
            bubbleWidth={10}
          />        
          )}
      </View>

      {Platform.OS!=='web' ? 
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
      :
      <></>
      }
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: BACKGROUND_COLOR,
  },
  card: {
    backgroundColor: "#e2fdff",
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
  labelWeb: {
    fontSize: 40,
    fontWeight: "500",
    color: "#1E1E1E",
    marginVertical: 8,
    textAlign: "center",
  },
  picker: {
    height: 60,
    width: "70%",
    backgroundColor: LIGHTER_PRIMARY2,
    borderRadius: 12,
    marginTop: 10,
    alignItems:"center",
    justifyContent: "center",
    fontSize: 16,
    color: "white"
  },
    pickerWeb: {
    height: 50,
    width: "50%",
    backgroundColor: "#E3F2FD",
    borderRadius: 12,
    marginTop: 10,
    alignItems:"center",
    justifyContent: "center",
    fontSize: 30

  },
  buttonContainer:{
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    // marginTop: 12,
    width: 200,
  },
  buttonWeb: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    // marginTop: 12,
    // maxWidth: 500,
    width: 500
  },
  onButton: {
    backgroundColor: "#c1121f",
  },
  offButton: {
    backgroundColor: "#679436",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
   buttonTextWeb: {
    color: "#fff",
    fontSize: 30,
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
 slider: {
    flex: 1,                    // take up full screen space
    justifyContent: 'center',  // vertical centering
    alignItems: 'center',      // horizontal centering
    padding: 16, 
 },
  mark: {
    color:"black",
    backgroundColor:"black"
  }
});

export default LedControl;

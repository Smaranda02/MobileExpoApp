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
// import Slider from "@react-native-community/slider";
// import Slider  from 'react-native-awesome-slider';
import { Picker } from "@react-native-picker/picker";
import { MQTTClientSingleton } from '@/services/mqttService';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import VoiceProcessingService from "@/services/voiceProcessingService";
import { useLedStore } from "@/stores/useLedStore";
import { Room } from "@/stores/useLedStore";
import { useAudioService } from "@/services/audioService";
import { PRIMARY_COLOR,SECONDARY_COLOR,DARKER_PRIMARY} from "@/constants";
import { useSharedValue } from "react-native-reanimated";
let Slider;

if (Platform.OS === 'web') {
  Slider = require('react-native-awesome-slider').Slider; // NOT `.Slider`
} else {
  Slider = require('@react-native-community/slider').default; // Use `.default` here
}


const LedControl = () => {

  const { red, green, blue, brightness, redBedroom, greenBedroom, blueBedroom, selectedRoom, setColor, setRoom } = useLedStore();
  const progress = useSharedValue(50);

  const {
      recorder,
      startRecording,
      stopRecording,
      transcription,
      entities,
    } = useAudioService();
  

  const processTranscription = (result_entities: any) => {
    try {
      var jsonData = JSON.parse(result_entities);

      console.log("Json data in component: ", JSON.parse(result_entities))

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
  }
  

  const turnOnOFF = (value: number) => {
    if(value == 1){
      setColor(0, 0, 0, value);
    }

    else{
      setColor(value, value, value, value);
    }
  };

  
  const handleMicPress = async () => {
    if (recorder.isRecording) {
      let result = await stopRecording();
      // processTranscription(entities);
      console.log("IN componeny: ", result.NER);
      processTranscription(result.NER);
    } else {
      await startRecording();
    }
  };


//   return (
//     <ScrollView contentContainerStyle={styles.scrollContainer}>
//       <View>
//       <View style={styles.container}>
//         <Text style={styles.status}>
//           {connected
//             ? "Connected to MQTT broker"
//             : "Connecting to MQTT broker..."}
//         </Text>

//         <TouchableOpacity
//           style={[
//             styles.button,
//             brightness > 1 ? styles.onButton : styles.offButton,
//           ]}
//           onPress={() => turnOnOFF(brightness > 1 ? 1 : 255)}
//         >
//           <Text style={styles.buttonText}>{brightness > 1 ? "ON" : "OFF"}</Text>
//         </TouchableOpacity>
//       </View>

//       <View>
//         <Text className="text-xl text-red-500">
//           Choose room : {selectedRoom}
//         </Text>
//         <View className="justify-center alignItems-center items-center w-full">
//           <Picker
//             selectedValue={selectedRoom}
//             onValueChange={(itemValue) => setRoom(itemValue)}
//             style={{ height: 100, width: 200 }} // Add width and height for visibility
//           >
//             <Picker.Item label="Living room" value="living" />
//             <Picker.Item label="Bedroom" value="bedroom" />
//           </Picker>
//         </View>
//       </View>

//       <View>
//         <Text>Red: {selectedRoom == 'living' ? red : redBedroom}</Text>
//         <Slider
//           minimumValue={0}
//           maximumValue={255}
//           value={selectedRoom == 'living' ? red : redBedroom}
//           onValueChange={(value) => {
//             selectedRoom == 'living' 
//             ? 
//             setColor(Math.round(value), green, blue, brightness)
//             : 
//             setColor(Math.round(value), greenBedroom, blueBedroom, brightness)
            
//           }
//         }
//           step={55}
//           minimumTrackTintColor="red"
//         />

//         <Text>Green: {selectedRoom == 'living' ? green : greenBedroom}</Text>
//         <Slider
//           minimumValue={0}
//           maximumValue={255}
//           value={selectedRoom == 'living' ? green : greenBedroom}
//           onValueChange={(value) => {
//             selectedRoom == 'living' 
//             ? 
//             setColor(red, Math.round(value), blue, brightness)
//             :
//             setColor(redBedroom, Math.round(value), blueBedroom, brightness)

//             }
//           }
//           step={55}
//           minimumTrackTintColor="green"
//         />

//         <Text>Blue: {selectedRoom == 'living' ? blue : blueBedroom}</Text>
//         <Slider
//           minimumValue={0}
//           maximumValue={255}
//           value={selectedRoom == 'living' ? blue : blueBedroom}
//           onValueChange={(value) => {
//             selectedRoom == 'living' 
//             ?
//             setColor(red, green, Math.round(value), brightness)
//             :
//             setColor(redBedroom, greenBedroom, Math.round(value), brightness)
//             }
//           }
//           step={55}
//           minimumTrackTintColor="blue"
//         />
//       </View>

//       <Text></Text>
//       <Text></Text>

//       <View>
//         <Text className="mr-2">Choose led intensity : {brightness}</Text>
//         <Slider
//           minimumValue={1}
//           maximumValue={255}
//           step={51}
//           value={brightness}
//           onValueChange={(value) => {
//             selectedRoom == 'living' 
//             ?
//             setColor(red, green, blue, Math.round(value))
//             :
//             setColor(redBedroom, greenBedroom, blueBedroom, Math.round(value))
//           }}
//           minimumTrackTintColor="#1fb28a"
//           maximumTrackTintColor="#d3d3d3"
//           thumbTintColor="#1fb28a"
//           style={{ width: 300, height: 40 }} // You still need to apply inline styles for Slider width/height
//         />
//       </View>
// {/* 
//       <TouchableOpacity style={styles.container} onPress={handleMicPress}>
//             <Text>{recorder.isRecording ? "Stop" : "Start"}</Text>
//       </TouchableOpacity> */}

//        {/* <View style={styles.container}>
//       <Button
//         title={recording ? 'Stop Recording' : 'Start Recording'}
//         onPress={recording ? handleStopRecording : handleStartRecording}
//       />      
//     </View> */}


//     <View style={styles.container}>
//       <TouchableOpacity
//         style={[styles.micButton, styles.recordingButton  && styles.recordingButton]}
//         onPress={handleMicPress}
//       >
//         {recorder.isRecording ? (
//           <ActivityIndicator size="small" color="#ffffff" />
//         ) : (
//           <MaterialCommunityIcons name="microphone" size={40} color="#ffffff" />
//         )}
//       </TouchableOpacity>

//     </View> 
//     {/* npm install react-native-vector-icons */}


//       </View>
//     </ScrollView>

//   );
// };

// export default LedControl;

// const styles = StyleSheet.create({
//   scrollContainer: {
//     flexGrow: 1, // Allows the ScrollView to take the full height of the screen
//     justifyContent: "center", // Centers content vertically
//     alignItems: "center", // Centers content horizontally
//   },
//   container: {
//     alignItems: "center",
//     justifyContent: "center",
//     padding: 20,
//   },
//   status: {
//     fontSize: 18,
//     marginBottom: 20,
//   },

//  button: {
//     paddingVertical: 15,
//     paddingHorizontal: 40,
//     borderRadius: 25,
//     marginVertical: 10,
//     width: "70%",
//     alignItems: "center",
//   },
//   onButton: {
//     backgroundColor: "#4CAF50", // Green color for ON
//   },
//   offButton: {
//     backgroundColor: "#BDBDBD", // Grey color for OFF
//   },
//   buttonText: {
//     color: "#fff",
//     fontSize: 18,
//     fontWeight: "bold",
//   },
//   micButton: {
//     width: 70,
//     height: 70,
//     borderRadius: 35,
//     backgroundColor: "#ff4081",
//     alignItems: "center",
//     justifyContent: "center",
//     marginBottom: 20,
//     elevation: 5,
//   },
//   recordingButton: {
//     backgroundColor: "#d50000", // Darker color when recording
//   },
//   transcriptionText: {
//     marginTop: 20,
//     fontSize: 16,
//     color: "#333",
//   },
// });

return (
  <ScrollView contentContainerStyle={styles.scrollContainer}>
    <View style={styles.card}>

      <TouchableOpacity
        style={[
          styles.button,
          brightness > 1 ? styles.onButton : styles.offButton,
        ]}
        onPress={() => turnOnOFF(brightness > 1 ? 1 : 255)}
      >
        <Text style={styles.buttonText}>
          {brightness > 1 ? "Turn OFF" : "Turn ON"}
        </Text>
      </TouchableOpacity>
    </View>

    <View style={styles.card}>
      <Text style={styles.label}>Choose Room: {selectedRoom}</Text>
      <Picker
        selectedValue={selectedRoom}
        onValueChange={(itemValue) => setRoom(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Living Room" value="living" />
        <Picker.Item label="Bedroom" value="bedroom" />
      </Picker>
    </View>

    <View style={styles.card}>
      <Text style={styles.label}>Red: 
        {selectedRoom == 'living' ? red : redBedroom}
        </Text>
      


      {Platform.OS === 'web' ? (
        <Slider
          progress={selectedRoom == 'living' ? red : redBedroom}
          onValueChange={(value: any) =>
            selectedRoom === 'living'
              ? setColor(Math.round(value), green, blue, brightness)
              : setColor(Math.round(value), greenBedroom, blueBedroom, brightness)
          }
          minimumValue={0}
          maximumValue={255}
          steps={5}
          snapToStep={true}
        />
      ) : (
        <Slider
        minimumValue={0}
        maximumValue={255}
        value={selectedRoom == 'living' ? red : redBedroom}
        onValueChange={(value: any) =>
          selectedRoom === 'living'
            ? setColor(Math.round(value), green, blue, brightness)
            : setColor(Math.round(value), greenBedroom, blueBedroom, brightness)
        }
        step={55}
        minimumTrackTintColor="#EF5350"
        />
      )}


      <Text style={styles.label}>Green: {selectedRoom == 'living' ? green : greenBedroom}</Text>
      { Platform.OS !== 'web' ? 
      <Slider
        minimumValue={0}
        maximumValue={255}
        value={selectedRoom == 'living' ? green : greenBedroom}
        onValueChange={(value: any) =>
          selectedRoom === 'living'
            ? setColor(red, Math.round(value), blue, brightness)
            : setColor(redBedroom, Math.round(value), blueBedroom, brightness)
        }
        step={55}
        minimumTrackTintColor="#66BB6A"
      /> 
      :
      <Text>Hello</Text>
      }

      <Text style={styles.label}>Blue: {selectedRoom == 'living' ? blue : blueBedroom}</Text>
      { Platform.OS !== 'web' ? 
      <Slider
        minimumValue={0}
        maximumValue={255}
        value={selectedRoom == 'living' ? blue : blueBedroom}
        onValueChange={(value: any) =>
          selectedRoom === 'living'
            ? setColor(red, green, Math.round(value), brightness)
            : setColor(redBedroom, greenBedroom, Math.round(value), brightness)
        }
        step={55}
        minimumTrackTintColor={PRIMARY_COLOR}
      /> :
      <Text>Hello</Text>
      }
    </View>

    <View style={styles.card}>
      <Text style={styles.label}>Brightness: {brightness}</Text>
      { Platform.OS !== 'web' ? 
      <Slider
        minimumValue={1}
        maximumValue={255}
        step={51}
        value={brightness}
        onValueChange={(value: any) =>
          selectedRoom === 'living'
            ? setColor(red, green, blue, Math.round(value))
            : setColor(redBedroom, greenBedroom, blueBedroom, Math.round(value))
        }
        minimumTrackTintColor={DARKER_PRIMARY}
        thumbTintColor={PRIMARY_COLOR}
        style={{ width: "100%" }}
      /> :
      <Text>Hello</Text>
      } 
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
  textAlign: "center"
},
picker: {
  height: 50,
  width: "100%",
  backgroundColor: "#E3F2FD",
  borderRadius: 12,
  marginTop: 10,
},
button: {
  maxWidth: 500,
  paddingVertical: 12,
  paddingHorizontal: 30,
  borderRadius: 30,
  alignItems: "center",
  justifyContent: "center",
  marginTop: 12,

},
 onButton: {
    backgroundColor: '#f44336',
  },
  offButton: {
    backgroundColor: '#4caf50',
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

import React, { useState, useEffect, useRef } from "react";
import AudioService from "@/audioService";
import { SpeechCommands } from "@/audioService";
import {
  View,
  Text,
  Button,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import Slider from "@react-native-community/slider";
import axios from "axios";
import { Picker } from "@react-native-picker/picker";
import { MQTTClientSingleton } from '@/mqttService';
import { MaterialCommunityIcons } from "@expo/vector-icons";

const MQTT_TOPIC_LIVING = "esp32/living"; // The topic you want to publish to
const MQTT_TOPIC = "esp32/relay"; // The topic you want to publish to
const MQTT_TOPIC_BEDROOM = "esp32/bedroom"; // The topic you want to publish to


const myMap: { [key: string]: string } = {
  COMMANDS: "",
  VALUE: "",
  LOCATION: "",
  DEVICE: "",
  COLOR: "",
};

interface Color {
  name: string;
  r: number;
  g: number;
  b: number;
}

// Array of colors
const colorMap: Color[] = [
  { name: "red", r: 255, g: 0, b: 0 },
  { name: "green", r: 0, g: 255, b: 0 },
  { name: "blue", r: 0, g: 0, b: 255 },
  { name: "yellow", r: 255, g: 255, b: 0 },
  { name: "cyan", r: 0, g: 255, b: 255 },
  { name: "magenta", r: 255, g: 0, b: 255 },
  { name: "orange", r: 255, g: 165, b: 0 },
  { name: "purple", r: 128, g: 0, b: 128 },
  { name: "white", r: 255, g: 255, b: 255 },
];



const Home = () => {
  const [brightness, setBrightness] = useState(0); // Initial brightness at 50%
  const [red, setRed] = useState(0);
  const [green, setGreen] = useState(0);
  const [blue, setBlue] = useState(0);
  const [text, setText] = useState("");
  const [selectedRoom, setselectedRoom] = useState("living");
  const [entities, setEntities] = useState(myMap);
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


  const processTranscription = (result_entities: any) => {
    try {

      console.log("the result : ", result_entities)
      // const jsonData = Array.isArray(result_entities) ? result_entities : JSON.parse(result_entities);
      var jsonData = JSON.parse(result_entities);

      console.log("Json data : ", JSON.parse(result_entities))

      //For use Effect test of calling the handlePublishColor twice 
      // const topic = `esp32`;
      // setRed(0);
      // handleColorPublish(topic);
      
      for (const data of jsonData) {
        const topic = `esp32/${data.location}`;
        const command = data.action;
        const color  = data.color;

        // Implement your command handling logic here
        if (command?.includes("off") || command?.includes("down") || command?.includes("minimum")) {
          setBrightness(1);
          setRed(0)
          setGreen(0)
          setBlue(0)
          handleColorPublish(topic);

        } else if (command?.includes("on") || command?.includes("up") || command?.includes("maximum")) {
          setBrightness(255);
          setRed(255)
          setGreen(255)
          setBlue(255)
        }

       if (color) {
        const col = colorMap.find(c => c.name === color);
        if (col) {
          setRed(col.r);
          setGreen(col.g);
          setBlue(col.b);
          handleColorPublish(topic);
        }
      }

      }
    } catch (error) {
      console.error("Failed to process transcription:", error);
    }
  }

  const handleColorPublish = (topic?: any) => {

    console.log("Topic is : ", topic);

    if (mqttClient.current?.isConnected()) {
      const messageContent = JSON.stringify({ red, green, blue, brightness });
      if(topic == null){
          topic = selectedRoom == "living" ? MQTT_TOPIC_LIVING : MQTT_TOPIC_BEDROOM;
        }
      mqttClient.current?.publishMessage(topic, messageContent);
      console.log(`Message published: ${messageContent}`);
    } else {
      console.log("Not connected to MQTT broker");
    }
  };

  const turnOnOFF = (value: number) => {
    setRed(value);
    setBlue(value);
    setGreen(value);
    setBrightness(value);
    handleColorPublish();
  };

  const NER = async () => {
    try {
      // const response = await axios.post('http://192.168.100.85:8000/ner', { text: text });
      // const response = await axios.post('http://192.168.191.78:8000/ner', { text: text });
      const response = await axios.post("http://192.168.100.92:8000/ner", {
        text: text,
      });
      // const response = await axios.post('http://192.168.2.100:8000/ner', { text: text });

      console.log(response.data.entities);

      const resp = response.data.entities;
      resp.forEach((element: [string, string]) => {
        const key = element[1];
        if (myMap.hasOwnProperty(key)) {
          if (myMap[key]) {
            myMap[key] += " " + element[0]; // Append with a space.
          } else {
            myMap[key] = element[0]; // Assign if it's empty.
          }
        }
      });

      console.log(myMap);
      setEntities(response.data.entities);

      if (mqttClient.current?.isConnected()) {
        const messageContent = JSON.stringify(myMap);
        const topic = MQTT_TOPIC;
        mqttClient.current.publishMessage(topic, messageContent);
        console.log(`Message published: ${messageContent}`);
      } else {
        console.log("Not connected to MQTT broker");
      }
    } catch (error) {
      console.error(error);
      alert("Error performing NER");
    }
  };

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
  

  useEffect(() => {
    // Publish whenever the RGB values change
    handleColorPublish();
  }, [red, green, blue, brightness]);

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
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
            brightness > 1 ? styles.onButton : styles.offButton,
          ]}
          onPress={() => turnOnOFF(brightness > 1 ? 1 : 255)}
        >
          <Text style={styles.buttonText}>{brightness > 1 ? "ON" : "OFF"}</Text>
        </TouchableOpacity>
      </View>

      <View>
        <Text className="text-xl text-red-500">
          Choose room : {selectedRoom}
        </Text>
        <View className="justify-center alignItems-center items-center w-full">
          <Picker
            selectedValue={selectedRoom}
            onValueChange={(itemValue) => setselectedRoom(itemValue)}
            style={{ height: 100, width: 200 }} // Add width and height for visibility
          >
            <Picker.Item label="Living room" value="living" />
            <Picker.Item label="Bedroom" value="bedroom" />
          </Picker>
        </View>
      </View>

      {/* <View>
        <Text>Enter Text for NER:</Text>

        <TextInput
          placeholder="Type something..."
          value={text}
          onChangeText={setText}
        />
        <Button title="Submit" onPress={NER} />
      </View> */}

      <View>
        <Text>Red: {red}</Text>
        <Slider
          minimumValue={0}
          maximumValue={255}
          value={red}
          onValueChange={setRed}
          step={55}
          minimumTrackTintColor="red"
        />

        <Text>Green: {green}</Text>
        <Slider
          minimumValue={0}
          maximumValue={255}
          value={green}
          onValueChange={setGreen}
          step={55}
          minimumTrackTintColor="green"
        />

        <Text>Blue: {blue}</Text>
        <Slider
          minimumValue={0}
          maximumValue={255}
          value={blue}
          onValueChange={setBlue}
          step={55}
          minimumTrackTintColor="blue"
        />
      </View>

      <Text></Text>
      <Text></Text>

      <View>
        <Text className="mr-2">Choose led intensity : {brightness}</Text>
        <Slider
          minimumValue={1}
          maximumValue={255}
          step={51}
          value={brightness}
          onValueChange={(value) => {
            setBrightness(Math.round(value));
          }}
          minimumTrackTintColor="#1fb28a"
          maximumTrackTintColor="#d3d3d3"
          thumbTintColor="#1fb28a"
          style={{ width: 300, height: 40 }} // You still need to apply inline styles for Slider width/height
        />
      </View>

      <View style={styles.container}>
      <Button
        title={recording ? 'Stop Recording' : 'Start Recording'}
        onPress={recording ? handleStopRecording : handleStartRecording}
      />      
    </View>


    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.micButton, recording && styles.recordingButton]}
        onPress={recording ? handleStopRecording : handleStartRecording}
      >
        {recording ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <MaterialCommunityIcons name="microphone" size={40} color="#ffffff" />
        )}
      </TouchableOpacity>

    </View>
    {/* npm install react-native-vector-icons */}


      </View>
    </ScrollView>

  );
};

export default Home;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1, // Allows the ScrollView to take the full height of the screen
    justifyContent: "center", // Centers content vertically
    alignItems: "center", // Centers content horizontally
  },
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
  micButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#ff4081",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    elevation: 5,
  },
  recordingButton: {
    backgroundColor: "#d50000", // Darker color when recording
  },
  transcriptionText: {
    marginTop: 20,
    fontSize: 16,
    color: "#333",
  },
});

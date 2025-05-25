import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Button,
} from "react-native";

import { useCurtainsStore } from "@/stores/useCurtainsStore";
import { Picker } from "@react-native-picker/picker";
import { useLedStore } from "@/stores/useLedStore";


const ProgramControl = () => {

  const { curtainsState, setCurtainsState } = useCurtainsStore();
  const { sunriseTime, automaticControl, setAutomaticControl}= useLedStore();
  const [sunriseStr, setSunriseStr] = useState("");

useEffect(() => {
  if(!sunriseTime) return;
  
    const formatted = sunriseTime.toLocaleTimeString("ro-RO", {
      hour: "2-digit",
      minute: "2-digit",
    });
    setSunriseStr(formatted);
}, [sunriseTime]);

  const handleCurtainsStatePublish = (curtainsCommand: number) => {
      setCurtainsState(curtainsCommand);
  };


  return (
  <View style={{ padding: 16 }}>
    {/* Curtains Toggle Button */}
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.button,
          curtainsState ? styles.offButton : styles.onButton,
        ]}
        onPress={() => handleCurtainsStatePublish(curtainsState ? 0 : 255)}
      >
        <Text style={styles.buttonText}>
          {curtainsState ? "CURTAINS DOWN" : "CURTAINS UP"}
        </Text>
      </TouchableOpacity>
    </View>

    {/* Sunrise Auto-Off Control */}
    <View style={styles.card}>
      <Text style={styles.label}>Turn off lights automatically at sunrise?</Text>

      <Picker
        selectedValue={automaticControl}
        onValueChange={(itemValue) => setAutomaticControl(itemValue)}
        style={styles.picker}
        dropdownIconColor="#333" 
        mode="dropdown"

      >
        <Picker.Item label="NO" value={false} />
        <Picker.Item label="YES" value={true} />
      </Picker>

      {automaticControl && (
        <Text style={styles.sunriseText}>
          🌅 Lights scheduled to turn off at:{" "}
          <Text style={{ fontWeight: "600" }}>{sunriseStr || "Loading..."}</Text>
        </Text>
      )}
    </View>
  </View>
)};

export default ProgramControl;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
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
  fontSize: 17,
  fontWeight: "500",
  color: "#1E1E1E",
  marginVertical: 8,
  textAlign: "center"
},
// picker: {
//   height: 50,
//   width: "100%",
//   backgroundColor: "#E3F2FD",
//   borderRadius: 12,
//   marginTop: 10,
// },

picker: {
  height: 50,
  width: "75%",
  backgroundColor: "#F0F4F8", // softer background
  // borderRadius: 20,
  marginTop: 10,
  paddingHorizontal: 12,
  color: "#1E1E1E", // dark text
  fontSize: 18,
  justifyContent: "center",
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
    width: "80%",
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
  sunriseText: {
  marginTop: 12,
  fontSize: 17,
  color: "#333",
  textAlign: "center",
}
});

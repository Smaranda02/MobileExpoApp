import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Button,
  Platform,
} from "react-native";

import { useCurtainsStore } from "@/stores/useCurtainsStore";
import { Picker } from "@react-native-picker/picker";
import { useLedStore } from "@/stores/useLedStore";
import { BACKGROUND_COLOR, DARKER_PRIMARY, LIGHTER_PRIMARY, LIGHTER_PRIMARY2, PRIMARY_COLOR } from "@/constants";

const ProgramControl = () => {
  const { curtainsState, setCurtainsState } = useCurtainsStore();
  const { sunriseTime, automaticControl, setAutomaticControl } = useLedStore();
  const [sunriseStr, setSunriseStr] = useState("");

  useEffect(() => {
    if (!sunriseTime) return;

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
    <View
      style={{ padding: 16, height: "100%", backgroundColor: BACKGROUND_COLOR }}
    >
      {/* Curtains Toggle Button */}
      <View style={styles.container}>
        <Text style={styles.title}>Curtains control</Text>
        <TouchableOpacity
          style={[
            styles.button,
            curtainsState ? styles.offButton : styles.onButton,
          ]}
          onPress={() => handleCurtainsStatePublish(curtainsState ? 0 : 255)}
        >
          <Text
            style={
              Platform.OS == "web" ? styles.buttonTextWeb : styles.buttonText
            }
          >
            {curtainsState ? "CURTAINS DOWN" : "CURTAINS UP"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sunrise Auto-Off Control */}
      <View>
        <View  style={{alignItems: "center"}}>
          <Text style={styles.title}>
              Schedule lights
          </Text>
        </View>

        <View style={Platform.OS == "web" ? styles.cardContainer : ""}>
          <View style={Platform.OS == "web" ? styles.cardWeb : styles.card}>
            <Text style={Platform.OS == "web" ? styles.labelWeb : styles.label}>
              Turn off lights automatically at sunrise?
            </Text>

            <Picker
              selectedValue={String(automaticControl)}
              onValueChange={(itemValue) =>
                setAutomaticControl(itemValue === "true")
              }
              style={Platform.OS === "web" ? styles.pickerWeb : styles.picker}
              dropdownIconColor="#333"
              mode="dropdown"
            >
              <Picker.Item label="NO" value="false" />
              <Picker.Item label="YES" value="true" />
            </Picker>

            {automaticControl && (
              <Text
                style={
                  Platform.OS != "web"
                    ? styles.sunriseText
                    : styles.sunriseTextWeb
                }
              >
                🌅 Lights scheduled to turn off at:{" "}
                <Text
                  style={
                    Platform.OS == "web"
                      ? { fontSize: 25 }
                      : { fontWeight: "600" }
                  }
                >
                  {sunriseStr || "Loading..."}
                </Text>
              </Text>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

export default ProgramControl;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    marginBottom: 15,
    color: DARKER_PRIMARY,
  },
  titleWeb: {
    fontSize: 60,
    fontWeight: "700",
    marginBottom: 30,
    color: "#0d47a1",
  },
  cardContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: BACKGROUND_COLOR, // optional
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
    alignItems: "center",
    alignContent: "center",
  },

  cardWeb: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    alignItems: "center",
    alignContent: "center",
    marginTop: 50,
    width: "50%",
  },

  label: {
    fontSize: 17,
    fontWeight: "500",
    color: DARKER_PRIMARY,
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
    height: 50,
    width: "59%",
    backgroundColor: LIGHTER_PRIMARY2, // softer background
    marginTop: 10,
    paddingHorizontal: 12,
    color: "white", // dark text
    fontSize: 18,
    justifyContent: "center",
  },

  pickerWeb: {
    height: 50,
    width: 300,
    backgroundColor: "#F0F4F8", // softer background
    marginTop: 30,
    paddingHorizontal: 12,
    color: "#1E1E1E", // dark text
    fontSize: 30,
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
    maxWidth: 500,
    alignItems: "center",
    marginBottom: 70,
  },
  onButton: {
    backgroundColor: PRIMARY_COLOR, // Green color for ON
  },
  offButton: {
    backgroundColor: LIGHTER_PRIMARY2, // Grey color for OFF
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  buttonTextWeb: {
    color: "#fff",
    fontSize: 40,
    fontWeight: "bold",
  },
  sunriseText: {
    marginTop: 12,
    fontSize: 17,
    color: "#333",
    textAlign: "center",
  },
  sunriseTextWeb: {
    marginTop: 40,
    fontSize: 25,
    color: "#333",
    textAlign: "center",
  },
});

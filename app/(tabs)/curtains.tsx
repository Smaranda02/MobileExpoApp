import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Button,
} from "react-native";

import { useCurtainsStore } from "@/stores/useCurtainsStore";

const Curtains = () => {
  const { curtainsState, setCurtainsState } = useCurtainsStore();

  const handleCurtainsStatePublish = (curtainsCommand: number) => {
      setCurtainsState(curtainsCommand);
  };

  return (
    <View>
      <View style={styles.container}>

        <TouchableOpacity
          style={[
            styles.button,
            curtainsState ? styles.offButton : styles.onButton,
          ]}
          onPress={() => handleCurtainsStatePublish(curtainsState ? 0 : 255)}
        >
          <Text style={styles.buttonText}>{curtainsState ? "CURTAINS DOWN" : "CURTAINS UP"}</Text>
        </TouchableOpacity>
      </View>
      
    </View>
  );
};

export default Curtains;

const styles = StyleSheet.create({
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
});

import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { useTemperatureStore } from "@/stores/useTemperatureStore";
import {
  BACKGROUND_COLOR,
  DARKER_PRIMARY,
  LIGHTER_PRIMARY,
  LIGHTER_PRIMARY2,
  MAX_HEATER_TEMP,
  MIN_HEATER_TEMP,
  MQTT_TOPIC_TEMPERATURE,
  PRIMARY_COLOR,
  SECONDARY_COLOR,
} from "@/constants";
import { MQTTClientSingleton } from "@/services/mqttService";
const Temperature = () => {
  const [currentTemperature, setCurrentTemperature] = useState<number | null>(
    null
  );
  const {
    desiredTemperatureHeater,
    heaterState,
    setHeater,
    setDesiredTemperatureHeater,
    updateHeaterStateFromMCU
  } = useTemperatureStore();

  const prevTemperatureRef = useRef<number | null>(null);

  useEffect(() => {
    if ((currentTemperature) ) {
      prevTemperatureRef.current = currentTemperature;
    }
  }, [currentTemperature]);

  if(prevTemperatureRef.current){
    const prevWasNaN = isNaN(prevTemperatureRef.current);
  }

  const mqttClient = useRef<MQTTClientSingleton | null>(null);

  useEffect(() => {
    mqttClient.current = MQTTClientSingleton.getInstance();

    const messageHandler = (topic: string, payload: string) => {
      if (topic === MQTT_TOPIC_TEMPERATURE) {

        const data = JSON.parse(payload);
        console.log(payload);
        const temperature = parseFloat(data.temperature);
        // const temperature = parseFloat(data);
        const heater = parseFloat(data.heater);

        if(temperature != null){
        setCurrentTemperature(temperature);
        }

        if(!isNaN(heater) &&  heater!= undefined
        // && heater != heaterState
        ){
          updateHeaterStateFromMCU(heater);
          console.log(heater)
        }
      }
    };

    mqttClient.current.registerMessageCallback(messageHandler);
  }, []);

  const increaseTemperature = () => {
    setDesiredTemperatureHeater(desiredTemperatureHeater + 1);
  };

  const decreaseTemperature = () => {
    setDesiredTemperatureHeater(desiredTemperatureHeater - 1);
  };

  const toggleHeater = () => {
    setHeater(heaterState === 1 ? 255 : 1);
  };

  return (
    <ScrollView  contentContainerStyle={styles.scrollContainer}>

      <View style={styles.titleContainer}> 

        <Text style={Platform.OS == "web" ? styles.titleWeb : styles.title}>
          Heater Control
        </Text>

        <TouchableOpacity
          style={[
            Platform.OS == "web" ? styles.heaterButtonWeb : styles.heaterButton,
            heaterState !== 1 ? styles.onButton : styles.offButton,
          ]}
          onPress={toggleHeater}
        >
          <Text
            style={
              Platform.OS == "web"
                ? styles.heaterButtonTextWeb
                : styles.heaterButtonText
            }
          >
            {heaterState !== 1 ? "Turn OFF" : "Turn ON"}
          </Text>
        </TouchableOpacity>
      </View>
          
      <View style={styles.temperaturesContainer}>
        <View style={styles.section}>
          <Text style={Platform.OS == "web" ? styles.labelWeb : styles.label}>
            Current Temperature
          </Text>
          <Text style={styles.currentTemp}>
            {currentTemperature !== null && !isNaN(currentTemperature)
              ? `${currentTemperature }°C`
              : "Loading..."}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={Platform.OS == "web" ? styles.labelWeb : styles.label}>
            Desired Temperature
          </Text>
          <View style={styles.tempControl}>
            <TouchableOpacity
              style={[
                styles.tempButton,
                desiredTemperatureHeater - 1 < MIN_HEATER_TEMP &&
                  styles.buttonDisabled,
              ]}
              onPress={decreaseTemperature}
              disabled={desiredTemperatureHeater - 1 < MIN_HEATER_TEMP}
            >
              <Text style={styles.tempButtonText}>-</Text>
            </TouchableOpacity>
            <Text
              style={
                Platform.OS == "web"
                  ? styles.desiredTempWeb
                  : styles.desiredTemp
              }
            >
              {desiredTemperatureHeater}°C
            </Text>
            <TouchableOpacity
              style={[
                styles.tempButton,
                desiredTemperatureHeater + 1 > MAX_HEATER_TEMP &&
                  styles.buttonDisabled,
              ]}
              onPress={increaseTemperature}
              disabled={desiredTemperatureHeater + 1 > MAX_HEATER_TEMP}
            >
              <Text style={styles.tempButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default Temperature;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
    // alignItems: "center",
    // justifyContent: "center",
    backgroundColor: BACKGROUND_COLOR,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    marginBottom: 24,
    color: DARKER_PRIMARY,
  },
  titleWeb: {
    fontSize: 60,
    fontWeight: "700",
    marginBottom: 30,
    color: DARKER_PRIMARY,
  },
  titleContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 50
  },
  temperaturesContainer: {
    alignItems: "center",
    justifyContent: "center",
  },

  heaterButton: {
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    width: "80%",
    alignItems: "center",
    marginBottom: 30,
    elevation: 3,
  },

  heaterButtonWeb: {
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    width: 500,
    alignItems: "center",
    marginBottom: 30,
    elevation: 3,
    fontSize: 30,
  },
   onButton: {
    backgroundColor: "#c1121f",
  },
  offButton: {
    backgroundColor: "#679436",
  },
  heaterButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
  },
  heaterButtonTextWeb: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "600",
  },
  section: {
    marginBottom: 32,
    alignItems: "center",
  },
  label: {
    fontSize: 30,
    fontWeight: "700",
    color: DARKER_PRIMARY,
    marginBottom: 12,
  },
  labelWeb: {
    fontSize: 60,
    fontWeight: "700",
    color: DARKER_PRIMARY,
    marginBottom: 12,
    marginTop: 50,
  },
  currentTemp: {
    fontSize: 48,
    fontWeight: "bold",
    color: PRIMARY_COLOR,
  },
  desiredTemp: {
    fontSize: 36,
    fontWeight: "bold",
    color: PRIMARY_COLOR,
    marginHorizontal: 20,
  },
  desiredTempWeb: {
    fontSize: 50,
    fontWeight: "bold",
    color: PRIMARY_COLOR,
    marginHorizontal: 20,
  },
  tempControl: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  tempButton: {
    backgroundColor: PRIMARY_COLOR,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  tempButtonText: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
  },
  buttonDisabled: {
    backgroundColor: "#B0BEC5", // grayish tone for disabled
  },
});

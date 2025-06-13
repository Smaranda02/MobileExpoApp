//TO DO :: it takes as desired temperature the pre last one not the last it is becayuse of the render or smth i dont know the fuck is react doing

import {
  View,
  Text,
  Button,
  TextInput,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
  Platform,
  Vibration,
  ScrollView,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { MQTTClientSingleton } from "@/services/mqttService";
import { useTemperatureStore } from "@/stores/useTemperatureStore";
import {
  MIN_FAN_TEMP,
  MQTT_TOPIC_AIR_QUALITY,
  MQTT_TOPIC_WATER,
  MIN_WATER_THRESHOLD,
  LIGHTER_PRIMARY,
  LIGHTER_PRIMARY2,
  BACKGROUND_COLOR,
  PRIMARY_COLOR,
  DARKER_PRIMARY,
  MQTT_TOPIC_FAN,
  GAS_THRESHOLD,
} from "@/constants";
const AirQuality = () => {
  const [connected, setConnected] = useState<boolean>(false);
  const [currentTemperature, setCurrentTemperature] = useState<number | 22>(0);
  const [currentHumidity, setCurrentHumidity] = useState<number | null>(null);
  // const [currentPressure, setCurrentPressure] = useState<number | null>(null);
  const [currentGasResistance, setCurrentGasResistance] = useState<
    number | null
  >(null);
  const [aqi, setAqi] = useState<number | null>(null);
  const [humidityTip, setHumidityTip] = useState<string>("");
  const [airQualityTip, setAirQualityTip] = useState<string>("");
  const {
    desiredTemperatureFan,
    fanState,
    setFan,
    setDesiredTemperatureFan,
    updateFanStateFromMCU,
  } = useTemperatureStore();

  const mqttClient = useRef<MQTTClientSingleton | null>(null); // Use useRef for MQTT client
  const priorityFanState = useRef(false);

  var smokeWarningDisplayed = false;
  var waterWarningDisplayed = false;

  var initialTemepratureSet = false;

  //   useEffect(() => {
  // }, [desiredTemperatureFan, fanState, setFan, setDesiredTemperatureFan, updateFanStateFromMCU]);

  useEffect(() => {
    mqttClient.current = MQTTClientSingleton.getInstance();
    setConnected(mqttClient.current.isConnected());

    // Handle incoming messages
    const messageHandler = (topic: string, payload: string) => {
      if (topic === MQTT_TOPIC_AIR_QUALITY) {
        const data = JSON.parse(payload); // Deserialize JSON
        setCurrentTemperature(parseFloat(data.temperature));
        setCurrentHumidity(parseFloat(data.humidity));
        // setCurrentPressure(parseFloat(data.pressure));
        setCurrentGasResistance(parseFloat(data.gasResistance));
        //console.log("Gas resistance : .",data.gasResistance);

        if (!initialTemepratureSet) {
          setDesiredTemperatureFan(Math.trunc(data.temperature));
          initialTemepratureSet = true;
        }

        const calculatedAqi = calculateAQI(
          parseFloat(data.gasResistance),
          parseFloat(data.humidity)
        );
        setAqi(calculatedAqi);
        setHumidityTip(getHumidityTip(parseFloat(data.humidity)));
        setAirQualityTip(getAirQualityTip(calculatedAqi));

        if (data.gasResistance && parseFloat(data.gasResistance) < GAS_THRESHOLD) {
          if (smokeWarningDisplayed == false) {
            // console.log("wat")
            showSmokeDetectedWarning();
            smokeWarningDisplayed = true;
          }
        }
      }

      if (topic === MQTT_TOPIC_WATER) {
        // console.log(payload);
        if (
          parseFloat(payload) > MIN_WATER_THRESHOLD &&
          waterWarningDisplayed == false
        ) {
          showWaterWarning();
          waterWarningDisplayed = true;
        }
      }

      if (topic === MQTT_TOPIC_FAN) {
        let fanPayload = parseInt(payload);

        if (!priorityFanState.current) {
          updateFanStateFromMCU(fanPayload);
        }
      }
    };

    mqttClient.current.registerMessageCallback(messageHandler);
  }, []);

  const calculateAQI = (gasResistance: number, humidity: number) => {
    let gasScore =
      gasResistance > 700
        ? 100
        : gasResistance > 500
          ? 75
          : gasResistance > 400
            ? 50
            : 25;
    let humidityScore =
      humidity >= 30 && humidity <= 60
        ? 100
        : humidity < 30
          ? (humidity / 30.0) * 100
          : ((100 - (humidity - 60)) / 40.0) * 100;
    return gasScore * 0.7 + humidityScore * 0.3;
  };

  const getHumidityTip = (humidity: number) => {
    if (humidity < 30)
      return "🔥 Low humidity! Use a humidifier or water bowl.";
    if (humidity > 60)
      return "💨 High humidity! Use a dehumidifier or ventilate.";
    return "✅ Optimal humidity level!";
  };

  const getAirQualityTip = (aqi: number) => {
    if (aqi > 80) return "🌟 Excellent air quality! Enjoy!";
    if (aqi > 50) return "🌬️ Moderate air quality. Ventilate if needed.";
    if (aqi > 30) return "⚠️ Poor air quality! Consider an air purifier.";
    return "🚨 Very poor air quality! Improve ventilation immediately!";
  };

  const turnOnOffFan = (fanState: number) => {
    priorityFanState.current = true;
    setFan(fanState);
    setTimeout(() => {
      priorityFanState.current = false;
    }, 4000);
  };

  const increaseTemperature = () => {
    setDesiredTemperatureFan(desiredTemperatureFan + 1);
  };

  const decreaseTemperature = () => {
    setDesiredTemperatureFan(desiredTemperatureFan - 1);
  };

  const showSmokeDetectedWarning = () => {
    // console.log("smok");
    if (Platform.OS === "android") {
      Vibration.vibrate([0, 500, 200, 500, 200, 500]); // Pattern of vibration
    }
    // Show an alarming alert
    Alert.alert(
      "🔥 SMOKE DETECTED! 🔥",
      "⚠️ WARNING! The air quality is critical. Please take immediate precautions!",
      [
        {
          text: "Take Action",
          onPress: () => {
            console.log("User acknowledged the warning");
          },
        },
      ],
      { cancelable: false }
    );
  };

  const showWaterWarning = () => {
    if (Platform.OS === "android") {
      Vibration.vibrate([0, 500, 200, 500, 200, 500]); // Pattern of vibration
    }
    // Show an alarming alert
    Alert.alert(
      "💧 WATER DETECTED! 💧",
      "⚠️ WARNING! There is a water leak in the living room! Take measures! ",
      [
        {
          text: "Take Action",
          onPress: () => {
            console.log("User acknowledged the warning");
          },
        },
      ],
      { cancelable: false }
    );
  };

  const getAQIDescription = (aqi: any) => {
    if (aqi > 80) return "Excellent";
    if (aqi > 50) return "Moderate";
    if (aqi > 30) return "Poor";
    return "Very Poor";
  };

  const aqiColor = (aqi: any) => {
    if (aqi > 80) return "#4CAF50"; // Green
    if (aqi > 50) return "#FFC107"; // Yellow
    if (aqi > 30) return "#FF9800"; // Orange
    return "#F44336"; // Red
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        <Text style={Platform.OS == "web" ? styles.titleWeb : styles.title}>
          Air Quality
        </Text>
        <View style={styles.dataContainer}>
          <Text style={Platform.OS == "web" ? styles.labelWeb : styles.label}>
            🌡️ Temperature:{" "}
            {!isNaN(currentTemperature)
              ? `${currentTemperature} °C`
              : "Loading..."}
          </Text>
          <Text style={Platform.OS == "web" ? styles.labelWeb : styles.label}>
            💧 Humidity:{" "}
            {currentHumidity !== null && !isNaN(currentHumidity)
              ? `${currentHumidity} %`
              : "Loading..."}
          </Text>
          {/* <Text style={Platform.OS == 'web' ? styles.labelWeb : styles.label}>🌍 Pressure: {currentPressure !== null && !isNaN(currentPressure)? `${currentPressure} hPa` : 'Loading...'}</Text> */}
          {/* <Text style={Platform.OS == 'web' ? styles.labelWeb : styles.label}>🔥 Gas Resistance: {currentGasResistance !== null && !isNaN(currentGasResistance)? `${currentGasResistance} kΩ` : 'Loading...'}</Text> */}
          <Text style={Platform.OS === "web" ? styles.labelWeb : styles.label}>
            🌫️ Air quality:{" "}
            {aqi !== null && !isNaN(aqi) ? (
              <>
                {aqi.toFixed(0)}
                <Text> - </Text>
                <Text style={{ color: aqiColor(aqi), fontWeight: "bold" }}>
                  {" "}
                  {getAQIDescription(aqi)}
                </Text>
              </>
            ) : (
              "Calculating..."
            )}
          </Text>
        </View>
        <View style={styles.tipContainer}>
          <Text
            style={
              Platform.OS == "web" ? styles.tipHeaderWeb : styles.tipHeader
            }
          >
            🌿 Air Quality Tips
          </Text>
          <Text style={Platform.OS == "web" ? styles.tipWeb : styles.tip}>
            {airQualityTip}
          </Text>
        </View>
        <View style={styles.tipContainer}>
          <Text
            style={
              Platform.OS == "web" ? styles.tipHeaderWeb : styles.tipHeader
            }
          >
            💧 Humidity Tips
          </Text>
          <Text style={Platform.OS == "web" ? styles.tipWeb : styles.tip}>
            {humidityTip}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={Platform.OS == "web" ? styles.headerWeb : styles.header}>
            Fan Control
          </Text>

          <TouchableOpacity
            style={[
              Platform.OS == "web"
                ? styles.heaterButtonWeb
                : styles.heaterButton,
              fanState > 1 ? styles.onButton : styles.offButton,
            ]}
            onPress={() => turnOnOffFan(fanState > 1 ? 1 : 255)}
          >
            <Text
              style={
                Platform.OS == "web"
                  ? styles.heaterButtonTextWeb
                  : styles.heaterButtonText
              }
            >
              {fanState == 1 ? "Turn ON" : "Turn OFF"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text
            style={
              Platform.OS == "web" ? styles.headerTempWeb : styles.headerTemp
            }
          >
            Set Desired Temperature
          </Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.tempButton,
                desiredTemperatureFan - 1 < MIN_FAN_TEMP &&
                  styles.buttonDisabled,
              ]}
              onPress={decreaseTemperature}
              disabled={desiredTemperatureFan - 1 < MIN_FAN_TEMP}
            >
              <Text style={styles.buttonText}>-</Text>
            </TouchableOpacity>

            <Text
              style={
                Platform.OS == "web"
                  ? (styles.desiredTemp, styles.desiredTempWeb)
                  : styles.desiredTemp
              }
            >
              {desiredTemperatureFan}°C
            </Text>

            <TouchableOpacity
              style={[
                styles.tempButton,
                desiredTemperatureFan + 1 > Math.trunc(currentTemperature) &&
                  styles.buttonDisabled,
              ]}
              onPress={increaseTemperature}
              disabled={
                desiredTemperatureFan + 1 > Math.trunc(currentTemperature)
              }
            >
              <Text style={styles.buttonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: BACKGROUND_COLOR },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    marginTop: 10,
    color: DARKER_PRIMARY,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: DARKER_PRIMARY,
  },
  headerWeb: {
    fontSize: 40,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: DARKER_PRIMARY,
    marginTop: 20,
  },
  headerTemp: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 0,
    textAlign: "center",
    color: DARKER_PRIMARY,
    marginTop: -20,
  },
  headerTempWeb: {
    fontSize: 40,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: DARKER_PRIMARY,
  },
  titleWeb: {
    fontSize: 40,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: DARKER_PRIMARY,
  },
  dataContainer: {
    backgroundColor: "#e2fdff",
    padding: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  label: { fontSize: 18, marginBottom: 8, color: DARKER_PRIMARY },
  labelWeb: { fontSize: 30, marginBottom: 8 },
  tipContainer: {
    backgroundColor: "#e2fdff",
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
  },
  tipHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    color: DARKER_PRIMARY,
  },
  tipHeaderWeb: { fontSize: 30, fontWeight: "bold", marginBottom: 15 },
  tip: { fontSize: 16 },
  tipWeb: { fontSize: 25 },
  heaterButton: {
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginVertical: 10,
    width: "70%",
    alignItems: "center",
  },

  heaterButtonWeb: {
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginVertical: 10,
    width: "30%",
    alignItems: "center",
  },
  heaterButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  heaterButtonTextWeb: {
    color: "#fff",
    fontSize: 25,
    fontWeight: "bold",
  },
  onButton: {
    backgroundColor: "#c1121f",
  },
  offButton: {
    backgroundColor: "#679436",
  },
  section: {
    marginBottom: 40,
    alignItems: "center",
  },
  temperature: {
    fontSize: 48,
    color: "#D84315",
    fontWeight: "bold",
  },
  desiredTemp: {
    fontSize: 36,
    color: DARKER_PRIMARY,
    fontWeight: "bold",
    marginVertical: 5,
    marginRight: 10,
    marginLeft: 10,
  },
  desiredTempWeb: {
    fontSize: 36,
    color: DARKER_PRIMARY,
    fontWeight: "bold",
    marginVertical: 5,
    marginRight: 30,
    marginLeft: 30,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    // width: '60%',
    marginVertical: 20,
  },
  button: {
    backgroundColor: "#1976D2",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
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

  buttonDisabled: {
    backgroundColor: "#B0BEC5", // grayish tone for disabled
  },
});

export default AirQuality;

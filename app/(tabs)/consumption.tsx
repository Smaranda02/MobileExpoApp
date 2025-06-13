import { View, Text, StyleSheet, ScrollView, Platform } from "react-native";
import { Picker } from "@react-native-picker/picker";
import React, { useEffect, useRef, useState } from "react";
import { MQTTClientSingleton } from "@/services/mqttService";
import ConsumptionChart from "../consumptionCharts";
import {
  BACKGROUND_COLOR,
  DARKER_PRIMARY,
  LIGHTER_PRIMARY,
  LIGHTER_PRIMARY2,
  SERVER_IP,
  VALUES_ERROR_MARGIN,
} from "@/constants";
import { getDate } from "date-fns";
import SolarPanelChart from "../solarPanelChart";

const Consumption = () => {
  const [selectedESP, setSelectedESP] = useState<
    "ESP1" | "ESP2" | "Solar Panel"
  >("ESP1");
  const selectedESPRef = useRef<"ESP1" | "ESP2" | "Solar Panel">("ESP1");
  const [connected, setConnected] = useState<boolean>(false);
  const [currentShuntVoltage, setCurrentShuntVoltage] = useState<number | null>(
    null
  );
  const [currentBusVoltage, setCurrentBusVoltage] = useState<number | null>(
    null
  );
  const [currentCurrent, setCurrentCurrent] = useState<number | null>(null);
  const [currentPower, setCurrentPower] = useState<number | null>(null);
  const [currentLoadVoltage, setCurrentLoadVoltage] = useState<number | null>(
    null
  );

  const MQTT_TOPIC_ESP1 = "esp32/consumption-esp1";
  const MQTT_TOPIC_ESP2 = "esp32/consumption-esp2";
  const MQTT_TOPIC_SOLAR_PANEL = "esp32/solar-panel";

  let powerHourArray = useRef<number[]>([]);
  let currentHourArrayESP1 = useRef<number[]>([]);
  // let currentHourArrayESP2 = useRef<number[]>([]);

  // let powerHourArray : number []=  [];
  let lastHourReadSolarPanel = Date.now();
  let lastHourReadESP1 = Date.now();
  let lastHourReadESP2 = Date.now();

  const mqttClient = useRef<MQTTClientSingleton | null>(null);

  const sendToBackend = async (device: string, current: number) => {
    try {
      await fetch(`http://${SERVER_IP}:3000/reading`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ device, current }),
      });
    } catch (error) {
      console.error("Failed to send reading to backend:", error);
    }
  };

  const postHourAverage = async (power: number, date: string, time: number) => {
    try {
      const timestamp = date.split('T')[0]; // Extract YYYY-MM-DD
      await fetch(`http://${SERVER_IP}:3000/solar-panel-reading`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ power, timestamp, time })
      });
    } catch (error) {
      console.error('Failed to send reading to backend:', error);
    }
  };

  const postHourAverageMCU = async (
    device: string,
    current: number,
    date: string,
    time: number
  ) => {
    try {
      const readingDate = date.split("T")[0]; // Extract YYYY-MM-DD

      await fetch(`http://${SERVER_IP}:3000/mcu-reading`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ device, current, readingDate, time }),
      });
    } catch (error) {
      console.error("Failed to send reading to backend:", error);
    }
  };

  const handleSolarPanelPower = async (power: number) => {
    powerHourArray.current.push(power);
    console.log("received power: ", power);
    console.log("array: ", powerHourArray);
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    // if (now - lastHourRead >= oneHour) {
    if (now - lastHourReadSolarPanel >= 60 * 1000) {
      const sum = powerHourArray.current.reduce((acc, val) => acc + val, 0);
      const averagePower = Math.round((sum / powerHourArray.current.length) * 100) / 100;
      const currentHour = new Date().getHours(); // 0-23
      const timestamp = new Date().toISOString(); // Full ISO timestamp
      postHourAverage(averagePower, timestamp, currentHour);
      powerHourArray.current = [];
      lastHourReadSolarPanel = now;
      console.log(`✅ Posted average power: ${averagePower.toFixed(2)} W at hour ${currentHour}`);
    }
  };

  const handleESPCurrent = async (current: number, device: string) => {
    currentHourArrayESP1.current.push(current);
    console.log("received power: ", current);
    console.log("array: ", currentHourArrayESP1);

    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    const oneMinute = 60 * 1000;

    // if (now - lastHourRead >= oneHour) {
    if (now - lastHourReadESP1 >= oneMinute) {
      const sum = currentHourArrayESP1.current.reduce(
        (acc, val) => acc + val,
        0
      );
      const averageCurrent =
        Math.round((sum / currentHourArrayESP1.current.length) * 100) / 100;

      const currentHour = new Date().getHours(); // 0-23
      const timestamp = new Date().toISOString(); // Full ISO timestamp
      postHourAverageMCU(device, averageCurrent, timestamp, currentHour);

      currentHourArrayESP1.current = [];
      lastHourReadESP1 = now;

      console.log(
        `✅ Posted average power: ${averageCurrent.toFixed(2)} W at hour ${currentHour}`
      );
    }
  };

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     const fakePower = (Math.random() * 10).toFixed(2);
  //     // console.log("set interval");
  //     // handleSolarPanelPower(parseFloat(fakePower));
  //     // postHourAverage(10, new Date().toISOString() , 13);
  //   }, 10 * 1000); // every 10 seconds for testing

  //   return () => clearInterval(interval); // ✅ cleanup when component unmounts
  // }, []);

  useEffect(() => {
    mqttClient.current = MQTTClientSingleton.getInstance();
    setConnected(mqttClient.current.isConnected());

    // for (let hour = 0; hour < 24; hour++) {
    //   const fakePower = parseFloat((Math.random() * 10 + 5).toFixed(2)); // Power between 5–15 W
    //   const date = new Date();
    //   date.setHours(hour, 0, 0, 0); // Set to this hour
    //   const timestamp = date.toISOString();

    //   postHourAverage(fakePower, timestamp, hour);
    // }

    //  for (let hour = 0; hour < 24; hour++) {
    //   const fakeCurrent = parseFloat((Math.random() * 90 + 100).toFixed(2)); // Power between 90–190 W
    //   const date = new Date();
    //   date.setHours(hour, 0, 0, 0); // Set to this hour
    //   const timestamp = date.toISOString();

    //   postHourAverageMCU("ESP1", fakeCurrent, timestamp, hour);
    // }

    // Handle incoming messages
    const messageHandler = async (topic: string, payload: string) => {
      let targetTopic;
      switch (selectedESPRef.current) {
        case "ESP1":
          targetTopic = MQTT_TOPIC_ESP1;
          break;
        case "ESP2":
          targetTopic = MQTT_TOPIC_ESP2;
          break;
        case "Solar Panel":
          targetTopic = MQTT_TOPIC_SOLAR_PANEL;
          break;
        default:
          return;
      }

      if (topic !== targetTopic) return; // Ignore other topics

      const data = JSON.parse(payload);
      // console.log("Payload: ", payload, selectedESPRef.current);
      const current = parseFloat(data.current);
      //received each minute

      if (
        selectedESPRef.current === "ESP1" ||
        selectedESPRef.current === "ESP2"
      ) {
        let avg_current = 0;
        let min_current = 0;

        try {
          const response_min_current = await fetch(
            `http://${SERVER_IP}:3000/min-current-today?device=${selectedESPRef.current}`
          );
          const result_min_current = await response_min_current.json();

          if (Array.isArray(result_min_current) && result_min_current[0]) {
            min_current = result_min_current[0].min_current;
          }
        } catch (error) {
          console.error("Failed to fetch minimum current:", error);
        }

        try {
          if (
            min_current != null &&
            current < min_current + VALUES_ERROR_MARGIN
          ) {
            setCurrentShuntVoltage(parseFloat(data.shuntVoltage));
            setCurrentBusVoltage(parseFloat(data.busVoltage));
            setCurrentCurrent(parseFloat(data.current));
            setCurrentPower(parseFloat(data.power));
            setCurrentLoadVoltage(parseFloat(data.loadVoltage));
          }

          // sendToBackend(selectedESPRef.current, current);
          handleESPCurrent(current, selectedESPRef.current);

        } catch (error) {
          console.error(
            "Error processing current readings or sending data:",
            error
          );
        }
      } else {
        //solar panel
        setCurrentShuntVoltage(parseFloat(data.shuntVoltage));
        setCurrentBusVoltage(parseFloat(data.busVoltage));
        setCurrentCurrent(parseFloat(data.current));
        setCurrentPower(parseFloat(data.power));
        setCurrentLoadVoltage(parseFloat(data.loadVoltage));
        const power = parseFloat(data.power);
        // handleSolarPanelPower(power);
      }
    };

    mqttClient.current.registerMessageCallback(messageHandler);
  }, [selectedESP]);

  useEffect(() => {
    selectedESPRef.current = selectedESP;
  }, [selectedESP]);

  return (
    <ScrollView>
      <View style={styles.container}>
        <Text style={Platform.OS == "web" ? styles.headerWeb : styles.header}>
          Consumption
        </Text>

        {/* Dropdown to select ESP */}
        <View
          style={
            Platform.OS == "web"
              ? styles.containerWeb
              : { alignItems: "center", marginBottom: 20 }
          }
        >
          <Picker
            selectedValue={selectedESP}
            onValueChange={(value) => setSelectedESP(value)}
            style={Platform.OS == "web" ? styles.pickerWeb : styles.picker}
          >
            <Picker.Item label="ESP1" value="ESP1" />
            <Picker.Item label="ESP2" value="ESP2" />
            <Picker.Item label="Solar Panel" value="Solar Panel" />
          </Picker>
        </View>

        <View style={styles.wrapper}>
          <View
            style={
              Platform.OS == "web"
                ? styles.dataContainerWeb
                : styles.dataContainer
            }
          >
            {/* <Text style={Platform.OS=='web' ? styles.labelWeb : styles.label}>
          Shunt Voltage: {currentShuntVoltage !== null ? `${currentShuntVoltage} mV` : 'Loading...'}
        </Text> */}
            {/* <Text style={Platform.OS=='web' ? styles.labelWeb : styles.label}>
          Bus Voltage: {currentBusVoltage !== null ? `${currentBusVoltage} V` : 'Loading...'}
        </Text> */}
            <Text style={Platform.OS == "web" ? styles.labelWeb : styles.label}>
              {selectedESPRef.current === "Solar Panel"
                ? `⚡Output current: ${currentCurrent !== null ? `${currentCurrent} mA` : "Loading..."}`
                : `⚡Current draw: ${currentCurrent !== null ? `${currentCurrent} mA` : "Loading..."}`}
            </Text>

            <Text style={Platform.OS == "web" ? styles.labelWeb : styles.label}>
              {selectedESPRef.current === "Solar Panel"
                ? `🔌Output voltage: ${currentLoadVoltage !== null ? `${currentLoadVoltage} V` : "Loading..."}`
                : `🔌Supplied voltage: ${currentLoadVoltage !== null ? `${currentLoadVoltage} V` : "Loading..."}`}
            </Text>
            <Text style={Platform.OS == "web" ? styles.labelWeb : styles.label}>
              {selectedESPRef.current === "Solar Panel"
                ? `⚡Instant power output: ${currentPower !== null ? `${currentPower} mW` : "Loading..."}`
                : `⚡Instant power draw: ${currentPower !== null ? `${currentPower} mW` : "Loading..."}`}
            </Text>
          </View>
        </View>

        {selectedESP == "Solar Panel" ? (
          <SolarPanelChart />
        ) : (
          <ConsumptionChart device={selectedESP} />
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: BACKGROUND_COLOR },
  containerWeb: {
    flex: 1,
    padding: 20,
    backgroundColor: BACKGROUND_COLOR,
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: DARKER_PRIMARY,
  },
  headerWeb: {
    fontSize: 40,
    fontWeight: "bold",
    textAlign: "center",
    color: DARKER_PRIMARY,
  },
  // picker: { height: 50, width: '100%', marginBottom: 15, alignItems:"center" },

  picker: {
    height: 60,
    width: "60%",
    backgroundColor: LIGHTER_PRIMARY2,
    borderRadius: 12,
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center",
    fontSize: 25,
    color: "white",
    borderEndEndRadius: 10,
  },

  pickerWeb: {
    height: 50,
    width: "30%",
    marginBottom: 20,
    fontSize: 40,
    marginTop: 20,
  },

  dataContainer: {
    backgroundColor: "#e2fdff",
    padding: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    width: "90%",
  },

  dataContainerWeb: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    width: "45%",
  },

  label: { fontSize: 18, marginBottom: 8 },
  labelWeb: { fontSize: 40, marginBottom: 8 },

  wrapper: {
    alignItems: "center",
  },
});

export default Consumption;

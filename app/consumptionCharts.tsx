import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import {
  DARKER_PRIMARY,
  LIGHTER_PRIMARY,
  LIGHTER_PRIMARY2,
  PRIMARY_COLOR,
  SECONDARY_COLOR,
  SERVER_IP,
} from "@/constants";
import { format, parseISO } from "date-fns";

const screenWidth = Dimensions.get("window").width;

const chartConfig = {
  backgroundGradientFrom: "#ffffff",
  backgroundGradientTo: "#ffffff",
  color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  strokeWidth: 2,
  decimalPlaces: 1,
  propsForDots: {
    r: "3",
    strokeWidth: "2",
    stroke: "#007AFF",
  },
};

const RANGE_OPTIONS = [
  { label: "Today", value: "day" },
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
  { label: "6 Months", value: "6months" },
  { label: "Year", value: "year" },
];

const ESP_VOLTAGE = 5;

type ConsumptionChartProps = {
  device: "ESP1" | "ESP2";
};

export default function ConsumptionChart({ device }: ConsumptionChartProps) {
  const [range, setRange] = useState("month");
  const [data, setData] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<null | {
    value: number;
    label: string;
  }>({ value: 0, label: "" });

  const fetchData = async () => {
    setLoading(true);
    try {
      const esp_url = `http://${SERVER_IP}:3000/consumption?device=${device}&range=${range}`;
      const response = await fetch(esp_url);
      const json = await response.json();

      console.log("JSON: ", json);
      const timestamps = json.map((d: any) => d.timestamp);
      console.log(timestamps)
      const firstHour = Math.min(...timestamps);
      console.log("First hour : ", firstHour)

      const values = json.map(
        (d: any) => (d.current * ESP_VOLTAGE) / 1000
      );

      // console.log("values: ",values);

      if (range === "day") {
        const xLabels = Array.from({ length: firstHour + 1 }, (_, i) => `${String(i).padStart(2, "0")}:00`);
        const paddedValues = [
            ...Array(firstHour).fill(0), // pad with zeros at the front
            ...values,
          ];

          console.log(paddedValues)

        // const finalValues = paddedValues.slice(0, 24);
      
        setData(paddedValues);
        setLabels(xLabels);
      } 
      else {
        const xLabels = json.map((d: any, index: number) =>   format(parseISO(d.readingDate), "MMM d")); // "May 14"
        setData(values);
        setLabels(xLabels);
      }
      // setData(values);
      // setLabels(xLabels);
    } catch (error) {
      console.error("Failed to load data", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [device, range]);

  return (
    <View style={styles.chartWrapper}>
      <Text
        style={Platform.OS == "web" ? styles.chartTitleWeb : styles.chartTitle}
      >
        Energy Consumption
      </Text>

      {/* Time Range Selector */}
      <View style={styles.rangeSelector}>
        {RANGE_OPTIONS.map(({ label, value }) => (
          <TouchableOpacity
            key={value}
            style={[
              styles.rangeButton,
              range === value && styles.rangeButtonSelected,
            ]}
            onPress={() => setRange(value)}
          >
            <Text
              style={[
                Platform.OS != "web"
                  ? styles.rangeButtonText
                  : styles.rangeButtonTextWeb,
                range === value && styles.rangeButtonTextSelected,
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : data.length > 0 ? (
        <View style={styles.chartContainer}>
          <View style={styles.containerText}>
          {selectedPoint && selectedPoint.label && (
            <Text style={styles.selectedPointText}>
              Selected: {selectedPoint.label} — {selectedPoint.value.toFixed(2)}{" "}
              W
            </Text>
           )} 
           </View>

          {/* <Text style={styles.yAxisLabel}>Power (W)</Text> */}
          <ScrollView horizontal>
            <LineChart
              data={{
                labels: range == "week" 
                      //  || range == "day"
                                  ? labels
                                  : range == "day" ? labels.filter((_, index) => index % 2 === 0) 
                                  : labels.filter((_, index) => index % 5 === 0), 
                datasets: [{ data }],
              }}
              width={Math.max(data.length * 40, screenWidth)}
              height={550}
              chartConfig={{
                backgroundColor: LIGHTER_PRIMARY,
                backgroundGradientFrom: LIGHTER_PRIMARY2,
                backgroundGradientTo: SECONDARY_COLOR,
                decimalPlaces: 2,
                color: (opacity = 1) => DARKER_PRIMARY,
                labelColor: (opacity = 1) => DARKER_PRIMARY,
                propsForLabels: {
                  fontSize: 30,
                  translateY: 10,
                  translateX: 10,
                },
                paddingTop: 300,
              }}
              bezier
              onDataPointClick={({ value, index }) => {
                setSelectedPoint({ value, label: labels[index] });
              }}
              style={styles.chart}
              fromZero
              yAxisSuffix=" W"
              yLabelsOffset={50} // or -20 depending on your fontSize
              xLabelsOffset={20}
            />
          </ScrollView>
          <Text style={styles.xAxisLabel}></Text>
        </View>
      ) : (
        <Text style={styles.noData}>No data to display</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  chartWrapper: {
    marginTop: 30,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
    color: DARKER_PRIMARY,
  },
  chartTitleWeb: {
    fontSize: 40,
    fontWeight: "600",
    marginBottom: 16,
    color: DARKER_PRIMARY,
  },
  chartContainer: {
    borderRadius: 12,
    maxWidth: "95%",
    height: 750,
    // paddingLeft: 100
  },
  containerText:{
    marginTop: 20,
    fontSize: 30,
    alignItems:"center"
  },

  chart: {
    // marginLeft:100
    paddingRight: 150,
    paddingTop: 50,
  },
  xAxisLabel: {
    marginTop: 10,
    fontSize: 40,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  yAxisLabel: {
    position: "absolute",
    top: 120,
    left: 4, // ✅ shift right
    transform: [{ rotate: "-90deg" }],
    fontSize: 40,
    fontWeight: "800",
    color: "#333",
  },

  noData: {
    textAlign: "center",
    marginTop: 20,
    color: "gray",
  },
  rangeSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 20,
  },
  rangeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: LIGHTER_PRIMARY,
    marginHorizontal: 5,
    marginVertical: 4,
    borderColor: PRIMARY_COLOR,
  },
  rangeButtonSelected: {
    backgroundColor: PRIMARY_COLOR,
    borderColor: DARKER_PRIMARY,
  },
  rangeButtonText: {
    color: DARKER_PRIMARY,
    fontSize: 14,
  },
  rangeButtonTextWeb: {
    color: DARKER_PRIMARY,
    fontSize: 35,
  },
  rangeButtonTextSelected: {
    color: "#ffffff",
  },

  selectedPointText: {
    marginTop: 50,
    fontSize: 30,
    fontWeight: "bold",
    color: DARKER_PRIMARY,
    justifyContent: "center"
    // marginBottom: 10,
  },
});



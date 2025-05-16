import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { LineChart, BarChart } from "react-native-chart-kit";
import { SERVER_IP } from "@/constants";
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

export default function SolarPanelChart() {
  const [range, setRange] = useState("day");
  const [data, setData] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const solar_panel_url = `http://${SERVER_IP}:3000/consumptionSolarPanel?range=${range}`;
      const response = await fetch(solar_panel_url);
      const json = await response.json();

      console.log(json);
      //   const values = json.map((d: any) => (d.power) / 1000);
      const values = json.map((d: any) => d.power);

      // const xLabels = json.map((d: any) => d.readingDate.slice(5)); // MM-DD
      const xLabels = json.map((d: any) => {
        if (range === "day") {
          return d.timestamp; // "13:00", "14:00"
        } else {
          return format(parseISO(d.readingDate), "MMM d"); // "May 14"
        }
      });

      console.log("Labels: ", xLabels);
      setData(values);
      setLabels(xLabels);
    } catch (error) {
      1;
      console.error("Failed to load data", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [range]);

  return (
    <ScrollView>
      <View style={styles.chartWrapper}>
        <Text style={styles.chartTitle}>Energy Consumption</Text>

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
                  styles.rangeButtonText,
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
          // <View>

          //   <View style={styles.yAxisWrapper}>
          //      <Text style={styles.yAxisLabel}>Power (W)</Text>
          //   </View>

          //   <ScrollView horizontal>
          //     <LineChart
          //       data={{
          //         labels: range === 'day' ? labels : labels.filter((_, index) => index % 5 === 0),
          //         datasets: [{ data }],
          //       }}
          //       width={Math.max(data.length * 30, screenWidth)}
          //       height={260}
          //       chartConfig={chartConfig}
          //       bezier
          //       style={styles.chart}
          //       fromZero
          //     />
          //   </ScrollView>

          //   <Text style={styles.xAxisLabel}>{range === 'day' ? "Hour" : "Date"}</Text>
          // </View>
          <View>
            <View style={styles.fixedYAxisLabel}>
              <Text style={styles.yAxisLabel}>Power (W)</Text>
            </View>

            <ScrollView horizontal>
              <View style={{ paddingLeft: 40, alignItems: "center" }}>
                <BarChart
                  data={{
                    labels:
                      range === "day"
                        ? labels
                        : labels.filter((_, index) => index % 5 === 0),
                    datasets: [{ data }],
                  }}
                  width={Math.max(data.length * 40, screenWidth)}
                  height={260}
                  fromZero
                  showValuesOnTopOfBars
                  chartConfig={chartConfig}
                  style={styles.chart}
                  yAxisSuffix=""
                  yAxisLabel=""
                />
              </View>
            </ScrollView>

             <View style={styles.xFixedLabel}>
                <Text style={styles.xAxisLabel}>
                  {range === "day" ? "Hour" : "Date"}
                </Text>
              </View>
          </View>
        ) : (
          <Text style={styles.noData}>No data to display</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  chartWrapper: {
    marginTop: 30,
    alignItems: "center",
    paddingHorizontal: 20,
    // height: 300
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
  },
  chart: {
    borderRadius: 12,
  },
 xFixedLabel: {
    width: 70, // adjust as needed
    alignItems: "center",
    zIndex: 2,
    right: 100,
    left: 100,
    marginTop: 0,
  },

  xAxisLabel: {
    // textAlign: "center",
    fontSize: 50,
    fontWeight: "600",
    // left: 100
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
    borderColor: "#007AFF",
    marginHorizontal: 5,
    marginVertical: 4,
  },
  rangeButtonSelected: {
    backgroundColor: "#007AFF",
  },
  rangeButtonText: {
    color: "#007AFF",
    fontSize: 14,
  },
  rangeButtonTextSelected: {
    color: "#ffffff",
  },

  yAxisWrapper: {
    position: "absolute",
    left: -40,
    top: 100,
    zIndex: 1,
  },

  yAxisLabel: {
    transform: [{ rotate: "-90deg" }],
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  fixedYAxisLabel: {
    width: 70, // adjust as needed
    alignItems: "center",
    left: -50,
    top: 140,
    zIndex: 1,
  },
});




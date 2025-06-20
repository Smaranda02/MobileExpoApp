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
import { LineChart, BarChart } from "react-native-chart-kit";
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
      
      console.log("JSON: ", json);
      const timestamps = json.map((d: any) => d.timestamp);
      console.log(timestamps)
      const firstHour = Math.min(...timestamps);
      console.log("First hour : ", firstHour)

      const values = json.map((d: any) => d.power);
      // const values = [0,0, 0,0,0,0, 1.5, 2.5, 2.7, 3, 4.5, 5.7, 6.8, 8.3, 11.5, 10.3, 8.1, 6.5, 5.3, 3, 0, 0, 0]

        if (range === "day") {
        const xLabels = Array.from({ length: firstHour + 1 }, (_, i) => `${String(i).padStart(2, "0")}:00`);
        const paddedValues = [
            ...Array(firstHour).fill(0), // pad with zeros at the front
            ...values,
          ];

        console.log(paddedValues)
      
        setData(paddedValues);
        setLabels(xLabels);
      } 
      else {
              const xLabels = json.map((d: any, index: number) =>   format(parseISO(d.readingDate), "MMM d")); // "May 14"
              setData(values);
              setLabels(xLabels);
            }

    } catch (error) {
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
        <Text
          style={
            Platform.OS == "web" ? styles.chartTitleWeb : styles.chartTitle
          }
        >
          Energy Generation
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
            <ScrollView horizontal>
              <View>
                <BarChart
                  data={{
                    labels:
                        range === "day" || range === "week" ?  labels
                        // ? labels.filter((_, index) => index % 3 === 0)
                        : labels.filter((_, index) => index % 5 === 0),
                    datasets: [{ data }],
                  }}

                  width={Platform.OS == 'web' ? Math.max(data.length * 100, screenWidth) : Math.max(data.length * 50, screenWidth) }
                  height={Platform.OS == 'web' ? 550: 350}
                  fromZero
                  withInnerLines
                  showValuesOnTopOfBars
                  chartConfig={{
                    backgroundColor: LIGHTER_PRIMARY,
                    backgroundGradientFrom: LIGHTER_PRIMARY2,
                    backgroundGradientTo: SECONDARY_COLOR,
                    decimalPlaces: 2,
                    color: (opacity = 1) => DARKER_PRIMARY,
                    labelColor: (opacity = 1) => DARKER_PRIMARY,

                    propsForLabels: Platform.OS == 'web' ? {  
                      fontSize: 30,
                      translateY: 0,
                      translateX: 30,
                    }
                    :
                    {
                      fontSize: 20,
                      translateY: 0,
                      translateX: 10,
                    },

                    paddingTop: 300,
                    barPercentage: Platform.OS == 'web' ? 2 : 1,
                  
                  }}
                  style={Platform.OS == 'web' ? styles.chartWeb : styles.chart}
                  yAxisSuffix=" mW"
                  yAxisLabel=""
                  yLabelsOffset={Platform.OS == 'web' ? 30 : 50} // or -20 depending on your fontSize
                  xLabelsOffset={Platform.OS == 'web' ? 20 : 10}
                  segments={4}
                  

                />
              </View>
            </ScrollView>
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
    paddingHorizontal: 10,
    // fontSize: 50
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
  },
  chartTitleWeb: {
    fontSize: 40,
    fontWeight: "600",
    marginBottom: 16,
  },
  chart: {
    borderRadius: 12,
    paddingRight: 150,
    paddingTop: 50,
    // fontSize: 50
  },
  chartWeb: {
    borderRadius: 12,
    paddingRight: 130,
    paddingTop: 35,
    // fontSize: 50
  },
  chartContainer: {
    borderRadius: 12,
    maxWidth: "95%",
    height: 650,
    // fontSize: 40
    // paddingLeft: 100
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

  yAxisLabel: {
    transform: [{ rotate: "-90deg" }],
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  fixedYAxisLabel: {
    width: 70,
    alignItems: "center",
    left: -40,
    top: 140,
    zIndex: 1,
  },
});

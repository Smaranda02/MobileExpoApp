// // // ConsumptionChart.tsx
// import React, { useEffect, useState } from 'react';
// import { View, Text, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
// import { LineChart } from 'react-native-chart-kit';
// import { SERVER_IP } from '@/constants';

// const screenWidth = Dimensions.get('window').width;
// // 
// const chartConfig = {
//   backgroundGradientFrom: '#f5f5f5',
//   backgroundGradientTo: '#f5f5f5',
//   color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
//   labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
//   strokeWidth: 2,
//   decimalPlaces: 1,
//   propsForDots: {
//     r: '3',
//     strokeWidth: '2',
//     stroke: '#007AFF',
//   },
// };

// interface Props {
//   device: string;
// }

// type ConsumptionChartProps = {
//     device: 'ESP1' | 'ESP2' | 'Solar Panel';
//   };

// const ESP_VOLTAGE = 5;

// export default function ConsumptionChart({ device }: ConsumptionChartProps) {
//     const [range, setRange] = useState('month');
//   const [data, setData] = useState<number[]>([]);
//   const [labels, setLabels] = useState<string[]>([]);
//   const [loading, setLoading] = useState(false);

//   const fetchData = async () => {
//     setLoading(true);
//     try {
//       const response = await fetch(`http://${SERVER_IP}:3000/consumption?device=${device}&range=${range}`);
//       const json = await response.json();

//       const values = json.map((d: any) => d.average_current * ESP_VOLTAGE / 1000);
//       const xLabels = json.map((d: any) => d.readingDate.slice(5)); // MM-DD

//       setData(values);
//       setLabels(xLabels);
//     } catch (error) {
//       console.error('Failed to load data', error);
//     }
//     setLoading(false);
//   };

//   useEffect(() => {
//     fetchData();
//   }, [device]);

//   return (
//     <View style={styles.chartWrapper}>
//       <Text style={styles.chartTitle}>Historical Consumption</Text>
//       {loading ? (
//         <ActivityIndicator size="large" />
//       ) : data.length > 0 ? (
//         <View>
//           <Text style={styles.yAxisLabel}>Power (W)</Text>
//           <LineChart
//             data={{
//               labels,
//               datasets: [{ data }],
//             }}
//             width={screenWidth - 64}
//             height={260}
//             chartConfig={chartConfig}
//             bezier
//             style={styles.chart}
//             fromZero
//           />
//           <Text style={styles.xAxisLabel}>Date</Text>
//         </View>
//       ) : (
//         <Text style={styles.noData}>No data to display</Text>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   chartWrapper: {
//     marginTop: 30,
//     alignItems: 'center',
//   },
//   chartTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     marginBottom: 12,
//   },
//   chart: {
//     borderRadius: 12,
//   },
//   xAxisLabel: {
//     marginTop: 10,
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#333',
//     textAlign: 'center',
//   },
//   yAxisLabel: {
//     position: 'absolute',
//     top: 110,
//     left: -20,
//     transform: [{ rotate: '90deg' }],
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#333',
//   },
//   noData: {
//     textAlign: 'center',
//     marginTop: 20,
//     color: 'gray',
//   },
// });



import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { SERVER_IP } from '@/constants';
import { format, parseISO } from 'date-fns';

const screenWidth = Dimensions.get('window').width;

const chartConfig = {
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  strokeWidth: 2,
  decimalPlaces: 1,
  propsForDots: {
    r: '3',
    strokeWidth: '2',
    stroke: '#007AFF',
  },
};

const RANGE_OPTIONS = [
  { label: 'Today', value: 'day' },
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
  { label: '6 Months', value: '6months' },
  { label: 'Year', value: 'year' },
];

const ESP_VOLTAGE = 5;

type ConsumptionChartProps = {
  device: 'ESP1' | 'ESP2';
};

export default function ConsumptionChart({ device }: ConsumptionChartProps) {
  const [range, setRange] = useState('month');
  const [data, setData] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const esp_url = `http://${SERVER_IP}:3000/consumption?device=${device}&range=${range}`;
      const response = await fetch(esp_url);
      const json = await response.json();

      const values = json.map((d: any) => (d.average_current * ESP_VOLTAGE) / 1000);
      // const xLabels = json.map((d: any) => d.readingDate.slice(5)); // MM-DD
      const xLabels = json.map((d: any) => format(parseISO(d.readingDate), 'MMM d'));

      setData(values);
      setLabels(xLabels);
    } catch (error) {
      console.error('Failed to load data', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [device, range]);

  return (
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
        <View>
          <Text style={styles.yAxisLabel}>Power (W)</Text>
          <ScrollView horizontal>
            <LineChart
              data={{
                labels: labels.filter((_, index) => index % 5 === 0), // Only show every 5th label
                datasets: [{ data }],
              }}            
              width={Math.max(data.length * 30, screenWidth)}
              height={260}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              fromZero
            />
          </ScrollView>
          <Text style={styles.xAxisLabel}>Date</Text>
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
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  chart: {
    borderRadius: 12,
  },
  xAxisLabel: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  yAxisLabel: {
    position: 'absolute',
    top: 120,
    left: 4, // ✅ shift right
    transform: [{ rotate: '-90deg' }],
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  
  noData: {
    textAlign: 'center',
    marginTop: 20,
    color: 'gray',
  },
  rangeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  rangeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    marginHorizontal: 5,
    marginVertical: 4,
  },
  rangeButtonSelected: {
    backgroundColor: '#007AFF',
  },
  rangeButtonText: {
    color: '#007AFF',
    fontSize: 14,
  },
  rangeButtonTextSelected: {
    color: '#ffffff',
  },
});

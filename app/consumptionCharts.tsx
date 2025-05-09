// // ConsumptionChart.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
// import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;
const SERVER_IP = "192.168.1.100";

const chartConfig = {
  backgroundGradientFrom: '#f5f5f5',
  backgroundGradientTo: '#f5f5f5',
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

interface Props {
  device: string;
}

type ConsumptionChartProps = {
    device: 'ESP1' | 'ESP2' | 'Solar Panel';
  };

const ESP_VOLTAGE = 5;

export default function ConsumptionChart({ device }: ConsumptionChartProps) {
    const [range, setRange] = useState('month');
  const [data, setData] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://${SERVER_IP}:3000/consumption?device=${device}&range=${range}`);
      const json = await response.json();

      const values = json.map((d: any) => d.average_current * ESP_VOLTAGE / 1000);
      const xLabels = json.map((d: any) => d.readingDate.slice(5)); // MM-DD

      setData(values);
      setLabels(xLabels);
    } catch (error) {
      console.error('Failed to load data', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [device]);

  return (
    <View style={styles.chartWrapper}>
      <Text style={styles.chartTitle}>Historical Consumption</Text>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : data.length > 0 ? (
        <View>
          <Text style={styles.yAxisLabel}>Power (W)</Text>
          {/* <LineChart
            data={{
              labels,
              datasets: [{ data }],
            }}
            width={screenWidth - 64}
            height={260}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            fromZero
          /> */}
          <Text style={styles.xAxisLabel}>Date</Text>
        </View>
      ) : (
        <Text style={styles.noData}>No data to display</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  chartWrapper: {
    marginTop: 30,
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
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
    top: 110,
    left: -20,
    transform: [{ rotate: '90deg' }],
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  noData: {
    textAlign: 'center',
    marginTop: 20,
    color: 'gray',
  },
});


import mqtt, { connect, MqttClient } from 'mqtt';
import {
  MQTT_PASSWORD,
  MQTT_SERVER,
  MQTT_TOPIC,
  MQTT_TOPIC_AIR_QUALITY,
  MQTT_TOPIC_BEDROOM,
  MQTT_TOPIC_CONSUMPTION,
  MQTT_TOPIC_CONSUMPTION_ESP2,
  MQTT_TOPIC_CURTAINS,
  MQTT_TOPIC_FAN,
  MQTT_TOPIC_LIVING,
  MQTT_TOPIC_SOLAR_PANEL,
  MQTT_TOPIC_TEMPERATURE,
  MQTT_TOPIC_WATER,
  MQTT_USERNAME,
} from '@/constants';

import { useMqttStore } from '@/stores/useMqttStore';

type MessageCallback = (topic: string, payload: string) => void;

class MQTTClientSingleton {
  private static instance: MQTTClientSingleton;
  //private mqttClient: MqttClient | null = null
  private mqttClient: any;

  private connected = false;

  private messageCallbacks: MessageCallback[] = [];

  private constructor() {
    this.connect();
  }

  private connect() {
    console.log('Connecting to MQTT broker...');
       this.mqttClient = mqtt.connect(MQTT_SERVER, {
      username: MQTT_USERNAME,
      password: MQTT_PASSWORD,
      reconnectPeriod: 1000, // Auto-reconnect every 1s
    });

    this.mqttClient.on('connect', () => {
      console.log('Connected to MQTT Broker');
      this.connected = true;
      useMqttStore.getState().setMqttState(true);

      this.subscribeToTopics();
    });

    this.mqttClient.on('error', (error:any) => {
      console.error('MQTT connection error:', error);
      useMqttStore.getState().setMqttState(false);
    });

    this.mqttClient.on('close', () => {
      console.warn('MQTT connection closed');
      this.connected = false;
      useMqttStore.getState().setMqttState(false);
    });

    this.mqttClient.on('message', (topic:any, payload:any) => {
      const message = payload.toString();
      this.messageCallbacks.forEach((cb) => cb(topic, message));
    });
  }

  private subscribeToTopics() {
    if (!this.mqttClient || !this.connected) return;

    const topics = [
      MQTT_TOPIC,
      MQTT_TOPIC_LIVING,
      MQTT_TOPIC_BEDROOM,
      MQTT_TOPIC_TEMPERATURE,
      MQTT_TOPIC_AIR_QUALITY,
      MQTT_TOPIC_WATER,
      MQTT_TOPIC_CONSUMPTION,
      MQTT_TOPIC_CONSUMPTION_ESP2,
      MQTT_TOPIC_SOLAR_PANEL,
      MQTT_TOPIC_CURTAINS,
      MQTT_TOPIC_FAN,
    ];

    topics.forEach((topic) => {
      this.mqttClient?.subscribe(topic, {}, (err:any) => {
        if (err) {
          console.error(`Failed to subscribe to ${topic}:`, err);
        } else {
          console.log(`Subscribed to ${topic}`);
        }
      });
    });
  }

  public static getInstance(): MQTTClientSingleton {
    if (!this.instance) {
      this.instance = new MQTTClientSingleton();
    }
    return this.instance;
  }

  public publishMessage(topic: string, payload: string): void {
    if (this.mqttClient && this.connected) {
      this.mqttClient.publish(topic, payload);
      console.log(`Published: ${payload} to topic: ${topic}`);
    } else {
      console.warn('MQTT client not connected. Unable to publish.');
    }
  }

  public registerMessageCallback(callback: MessageCallback): void {
    this.messageCallbacks.push(callback);
    console.log('Callback registered for MQTT messages');
  }

  public isConnected(): boolean {
    return this.connected;
  }

  public disconnect(): void {
    if (this.mqttClient) {
      this.mqttClient.end();
      this.connected = false;
      console.log('MQTT Client disconnected');
    }
  }
}

export { MQTTClientSingleton };

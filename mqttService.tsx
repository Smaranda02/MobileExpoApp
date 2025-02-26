import Paho from "paho-mqtt";

const MQTT_SERVER = "ws://192.168.100.92:8080/mqtt"; // Your MQTT broker
// const MQTT_SERVER = "ws://192.168.191.78:8080/mqtt"; //smara

const MQTT_USERNAME = "admin"; // Your MQTT username
const MQTT_PASSWORD = "admin"; // Your MQTT password

// Define MQTT topics
const MQTT_TOPIC_LIVING = "esp32/living";
const MQTT_TOPIC = "esp32/relay";
const MQTT_TOPIC_BEDROOM = "esp32/bedroom";
const MQTT_TOPIC_TEMPERATURE = 'esp32/temperature';
const MQTT_TOPIC_AIR_QUALITY = 'esp32/airQuality';
const MQTT_TOPIC_WATER = 'esp32/water';


type MessageCallback = (topic: string, payload: string) => void;

class MQTTClientSingleton {
  private static instance: MQTTClientSingleton;
  private mqttClient: Paho.Client | null = null;
  private connected: boolean = false;

  private messageCallbacks: MessageCallback[] = []; // List of registered callbacks

  // Private constructor to prevent instantiation
  private constructor() {
    // Initialize the MQTT client immediately upon creation
    this.mqttClient = new Paho.Client(MQTT_SERVER, `clientId_${Math.random()}`);

    // Handle connection loss
    this.mqttClient.onConnectionLost = () => {
      console.log("Connection lost");
      this.connected = false;
      this.reconnect();
    };

    // Handle incoming messages
    this.mqttClient.onMessageArrived = this.handleIncomingMessages;

    this.connect();
  }

  private connect(){
    if (!this.mqttClient) return;
    console.log("Attempting to connect to MQTT broker...");

    this.mqttClient.connect({
      userName: MQTT_USERNAME,
      password: MQTT_PASSWORD,
      onSuccess: () => {
        console.log("Connected to MQTT Broker");
        this.connected = true;
        if (this.mqttClient) {
          this.mqttClient.subscribe(MQTT_TOPIC_LIVING);
          this.mqttClient.subscribe(MQTT_TOPIC);
          this.mqttClient.subscribe(MQTT_TOPIC_BEDROOM);
          this.mqttClient.subscribe(MQTT_TOPIC_TEMPERATURE);
          this.mqttClient.subscribe(MQTT_TOPIC_AIR_QUALITY);
          this.mqttClient.subscribe(MQTT_TOPIC_WATER);
        }
      },
      onFailure: (error) => {
        console.error("Connection failed:", error);
        this.connected = false;
        this.reconnect();
      },
    });
  }

  // Reconnect logic
  private reconnect() {
    console.log(`Reconnecting in 1 second...`);
    setTimeout(() => {
      this.connect();
    }, 1);
  }

  // Singleton instance getter
  public static getInstance(): MQTTClientSingleton {
    if (!this.instance) {
      this.instance = new MQTTClientSingleton(); // Client is initialized here
    }
    return this.instance;
  }

  // Publish a message to the MQTT broker
  public publishMessage(topic: string, payload: string): void {
    if (this.mqttClient && this.connected) {
      const message = new Paho.Message(payload);
      message.destinationName = topic;
      this.mqttClient.send(message);
      console.log(`Published: ${payload} to topic: ${topic}`);
    } else {
      console.warn("MQTT client not connected. Unable to publish.");
    }
  }

  private handleIncomingMessages = (message: Paho.Message) => {
    const topic = message.destinationName;
    const payload = message.payloadString;

    // console.log(`Received message on topic '${topic}': ${payload}`);

    // Notify all registered callbacks
    this.messageCallbacks.forEach((callback) => callback(topic, payload));
  };


  public registerMessageCallback(callback: MessageCallback): void {
    this.messageCallbacks.push(callback);
    console.log("Callback registered for MQTT messages");
  }


  // Check if the client is connected
  public isConnected(): boolean {
    return this.connected;
  }

  // Disconnect the client
  public disconnect(): void {
    if (this.mqttClient && this.connected) {
      this.mqttClient.disconnect();
      console.log("MQTT Client disconnected");
      this.connected = false;
    }
  }
}

export { MQTTClientSingleton };



// import Paho from "paho-mqtt";
// import { useEffect, useState } from "react";

// // const MQTT_SERVER = 'ws://broker.hivemq.com:8000/mqtt'; // WebSocket URL
// // const MQTT_SERVER = 'ws://broker.emqx.io:8083/mqtt'; // WebSocket URL
// const MQTT_TOPIC_LIVING = "esp32/living"; // The topic you want to publish to
// const MQTT_TOPIC = "esp32/relay"; // The topic you want to publish to
// const MQTT_TOPIC_BEDROOM = "esp32/bedroom"; // The topic you want to publish to
// const MQTT_TOPIC_TEMPERATURE = 'esp32/temperature'; // The topic you want to publish to

// // const MQTT_SERVER = 'ws://192.168.2.100:8080/mqtt'
// const MQTT_SERVER = "ws://192.168.100.92:8080/mqtt";
// const MQTT_USERNAME = "admin"; // MQTT username
// const MQTT_PASSWORD = "admin"; // MQTT password

// let mqttClient : Paho.Client | null = null; // Global MQTT client instance to avoid duplication

// // Shared MQTT Client Hook
// export const useMQTTClient = () => {
//     const [connected, setConnected] = useState(false);
//     const [currentTemperature, setCurrentTemperature] = useState(21.0); // Temperature from sensor
//     const [lastMessage, setLastMessage] = useState(null);

//     useEffect(() => {

//         if (!mqttClient) {
//          mqttClient = new Paho.Client(MQTT_SERVER, `clientId_${Math.random()}`);
//         }

//       // Handle Connection Loss
//       mqttClient.onConnectionLost = () => {
//         console.log("Connection lost");
//         setConnected(false);
//       };
  
//       // Handle Incoming Messages
//       mqttClient.onMessageArrived = (message: any) => {
//         console.log(
//           `Received message: ${message.payloadString} on topic ${message.destinationName}`
//         );

//         // setLastMessage({
//         //     topic: message.destinationName,
//         //     payload: message.payloadString,
//         //   });
  
//         if (message.destinationName === MQTT_TOPIC_TEMPERATURE) {
//           // Parse temperature message
//           const tempearture = parseFloat(message.payloadString);
//           console.log("Received temperature:", tempearture);
//           setCurrentTemperature(tempearture);
//         }
//       };
  
//       // Connect to the MQTT server
//       mqttClient.connect({
//         userName: MQTT_USERNAME, // Add the username
//         password: MQTT_PASSWORD, // Add the password
//         onSuccess: () => {
//           console.log("Connected to MQTT Broker");
//           setConnected(true);
//           if(mqttClient){
//             mqttClient.subscribe(MQTT_TOPIC_LIVING); // Subscribe to temperature topic
//             mqttClient.subscribe(MQTT_TOPIC); // Subscribe to all "sensor" topics
//             mqttClient.subscribe(MQTT_TOPIC_BEDROOM); // Subscribe to all "sensor" topics
//             mqttClient.subscribe(MQTT_TOPIC_TEMPERATURE); // Subscribe to all "sensor" topics
//             }

//         },
//         onFailure: (error: any) => {
//           console.error("Connection failed:", error);
//           setConnected(false);
//         },
//       });
  
//       return () => {
//         if (mqttClient && connected) {
//           mqttClient.disconnect();
//           console.log("MQTT Client disconnected");
//           setConnected(false);
//           mqttClient = null;
//         }
//       };
//     }, []);
  
//     const publishMessage = (topic : any, payload : any) => {
//         if (mqttClient && connected) {
//           const message = new Paho.Message(payload);
//           message.destinationName = topic;
//           mqttClient.send(message);
//           console.log(`Published: ${payload} to topic: ${topic}`);
//         } else {
//           console.warn("MQTT client not connected. Unable to publish.");
//         }
//       };
    
//       return {
//         connected,         // Connection state
//         currentTemperature,       // Temperature value (example)
//         lastMessage,       // Last received message
//         publishMessage,    // Function to publish MQTT messages
//       };
//   };
  
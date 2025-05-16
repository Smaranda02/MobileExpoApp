import { MQTTClientSingleton } from "./mqttService";
import {
  MQTT_TOPIC_LIVING,
  MQTT_TOPIC_BEDROOM,
  MQTT_TOPIC_CURTAINS,
  MQTT_TOPIC_TEMPERATURE,
  MQTT_TOPIC_FAN
} from "./mqttService"; 

const mqttClient = MQTTClientSingleton.getInstance();

interface LedColorPayload {
    red: number;
    green: number;
    blue: number;
    brightness: number;
    selectedRoom: "living" | "bedroom";
    topic?: string | null;
  }


  // interface TemperaturePayload {
  //   heaterState: number;
  //   desiredTemperature: number
  // }


export const MQTTPublisher = {
    publishLedColor({
      red,
      green,
      blue,
      brightness,
      selectedRoom,
      topic = null,
    }: LedColorPayload): void {

      if (!mqttClient.isConnected()) {
        console.log("Not connected to MQTT broker");
        return;
      }
  
      const messageContent = JSON.stringify({ red, green, blue, brightness });
  
      const targetTopic =
        topic ?? (selectedRoom === "living" ? MQTT_TOPIC_LIVING : MQTT_TOPIC_BEDROOM);
  
      mqttClient.publishMessage(targetTopic, messageContent);
    //   console.log(`Message published: ${messageContent} to topic ${targetTopic}`);
    },

    publishCurtainsState(curtainsNewPosition: string) : void {
    
       if (!mqttClient.isConnected()) {
        console.log("Not connected to MQTT broker");
        return;
      }
      
      const messageContent = JSON.stringify({ curtainsPosition : curtainsNewPosition});
      mqttClient.publishMessage(MQTT_TOPIC_CURTAINS, messageContent);
    },

    publishTemperatureStateHeater(desiredTemperature: number){
      if (!mqttClient.isConnected()) {
        console.log("Not connected to MQTT broker");
        return;
      }
      
      const messageContent = JSON.stringify({ desiredTemperature: desiredTemperature});
      mqttClient.publishMessage(MQTT_TOPIC_TEMPERATURE, messageContent);
    },


    publishTemperatureStateFan(desiredTemperature: number){
      if (!mqttClient.isConnected()) {
        console.log("Not connected to MQTT broker");
        return;
      }
      
      const messageContent = JSON.stringify({ desiredTemperature: desiredTemperature});
      mqttClient.publishMessage("esp32/airQuality", messageContent);
    },

    publishHeaterState(heaterState: number){
      if (!mqttClient.isConnected()) {
        console.log("Not connected to MQTT broker");
        return;
      }
      
      const messageContent = JSON.stringify({ heaterState: heaterState});
      mqttClient.publishMessage(MQTT_TOPIC_TEMPERATURE, messageContent);
    },

    publishFanState(fanState: number){
      if (!mqttClient.isConnected()) {
        console.log("Not connected to MQTT broker");
        return;
      }
      
      const messageContent = JSON.stringify({ fanState: fanState});
      mqttClient.publishMessage(MQTT_TOPIC_FAN, messageContent);
    }
  };
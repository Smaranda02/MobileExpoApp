import { MQTT_TOPIC_LIVING, MQTT_TOPIC_BEDROOM, MQTT_TOPIC_CURTAINS, MQTT_TOPIC_TEMPERATURE, MQTT_TOPIC_FAN, MQTT_TOPIC_UPDATE_REQUEST_1, MQTT_TOPIC_UPDATE_REQUEST_2 } from "@/constants";
import { MQTTClientSingleton } from "./mqttService";

const mqttClient = MQTTClientSingleton.getInstance();

interface LedColorPayload {
    red: number;
    green: number;
    blue: number;
    brightness: number;
    selectedRoom: "bathroom" | "bedroom";
    topic?: string | null;
  }

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
        topic ?? (selectedRoom === "bathroom" ? MQTT_TOPIC_LIVING : MQTT_TOPIC_BEDROOM);
  
      mqttClient.publishMessage(targetTopic, messageContent);
      // console.log(`Message published: ${messageContent} to topic ${targetTopic}`);
    },

    publishCurtainsState(curtainsNewPosition: string) : void {
    
       if (!mqttClient.isConnected()) {
        console.log("Not connected to MQTT broker");
        return;
      }
      
      const messageContent = JSON.stringify({ curtainsState : curtainsNewPosition});
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
    },

     publishStateUpdateRequest(){
      if (!mqttClient.isConnected()) {
        console.log("Not connected to MQTT broker");
        return;
      }
      
      const messageContent = JSON.stringify({ updateRequest: true});
      mqttClient.publishMessage(MQTT_TOPIC_UPDATE_REQUEST_1, messageContent);
      mqttClient.publishMessage(MQTT_TOPIC_UPDATE_REQUEST_2, messageContent);
    }
  };
export const PRIMARY_COLOR = "#014f86";
export const LIGHTER_PRIMARY ="#61a5c2";
export const LIGHTER_PRIMARY2 = "#468faf";
export const SECONDARY_COLOR = "#89c2d9";
export const DARKER_PRIMARY = "#012a4a";
export const BACKGROUND_COLOR = "#a9d6e5"; 


export const SERVER_IP = "192.168.1.101";
// export const SERVER_IP = "192.168.27.206";
// export const SERVER_IP = "192.168.1.100"; //robotics314

export const LAT = 44.4268;  // Bucharest latitude
export const LNG = 26.1025;  // Bucharest longitude
export const TIMEZONE = 'Europe/Bucharest';

export const MAX_HEATER_TEMP = 35;
export const MIN_HEATER_TEMP = 18;
export const MIN_FAN_TEMP = 20;
export const MAX_FAN_TEMP = 20;

export const MIN_WATER_THRESHOLD  = 2.5;
export const VALUES_ERROR_MARGIN = 100;

//smoke threshold
export const GAS_THRESHOLD = 300; // Adjust based on environment


// export const MQTT_SERVER = "ws://192.168.191.78:8080/mqtt"; //smara
// export const MQTT_SERVER = "ws://192.168.1.104:8080/mqtt"; //robotics314
// export const MQTT_SERVER = "ws://172.20.10.3:8080/mqtt"; //cori
// const MQTT_SERVER = "ws://192.168.2.100:8080/mqtt" // VPN
export const MQTT_SERVER = "ws://192.168.1.110:8080/mqtt"; //  MQTT broker foisor

// const MQTT_SERVER = Platform.OS === 'web' ? "wss://192.168.1.110:8082/mqtt" : "ws://192.168.1.110:8080/mqtt"; //  MQTT broker foisor

export const MQTT_USERNAME = "admin"; // Your MQTT username
export const MQTT_PASSWORD = "admin"; // Your MQTT password

// Define MQTT topics
export const MQTT_TOPIC_LIVING = "esp32/living";
export const MQTT_TOPIC = "esp32/relay";
export const MQTT_TOPIC_BEDROOM = "esp32/bedroom";
export const MQTT_TOPIC_TEMPERATURE = 'esp32/temperature';
export const MQTT_TOPIC_AIR_QUALITY = 'esp32/airQuality';
export const MQTT_TOPIC_WATER = 'esp32/water';
export const MQTT_TOPIC_CONSUMPTION = 'esp32/consumption-esp1'
export const MQTT_TOPIC_CONSUMPTION_ESP2 = 'esp32/consumption-esp2'
export const MQTT_TOPIC_SOLAR_PANEL = 'esp32/solar-panel'
export const MQTT_TOPIC_CURTAINS = 'esp32/curtains'
export const MQTT_TOPIC_FAN = 'esp32/fan'
export const MQTT_TOPIC_UPDATE_REQUEST_1 = 'esp32/update-1'
export const MQTT_TOPIC_UPDATE_REQUEST_2 = 'esp32/update-2'
export const MQTT_TOPIC_UPDATE_RESPONSE_1 = "esp32/updateResponse-1"
export const MQTT_TOPIC_UPDATE_RESPONSE_2 = "esp32/updateResponse-2"
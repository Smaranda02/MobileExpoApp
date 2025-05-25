import { toZonedTime } from "date-fns-tz";
import { LAT, LNG, TIMEZONE } from "./constants";

import { MQTTPublisher } from "./services/mqttPublisher";
import { useLedStore } from "./stores/useLedStore";

export async function getSunriseTime(): Promise<Date> {
  const res = await fetch(`https://api.sunrise-sunset.org/json?lat=${LAT}&lng=${LNG}&formatted=0`);
  
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const formattedTomorrow = tomorrow.toLocaleDateString('ro-RO'); 
  const tomorrowRes = await fetch(`https://api.sunrise-sunset.org/json?lat=${LAT}&lng=${LNG}&formatted=0&date=${formattedTomorrow}`);

  const data = await res.json();
  const tomorrowData = await tomorrowRes.json();

  if (data.status !== "OK") throw new Error("API error");
  if (tomorrowData.status !== "OK") throw new Error("API error");


  const utcSunrise = new Date(data.results.sunrise); // ISO format
  const localSunrise = toZonedTime(utcSunrise, TIMEZONE);
  // console.log("Sunrise", localSunrise);
  
  const utcSunriseTomorrow = new Date(tomorrowData.results.sunrise); // ISO format
  const localSunriseTomorrow = toZonedTime(utcSunriseTomorrow, TIMEZONE);
  console.log("Sunrise tomorrow", localSunriseTomorrow);

  const now = new Date();
  const delay = new Date(utcSunrise).getTime() - now.getTime(); 

  if (delay <= 0) { //sunrise for today has passed 
    return new Date(utcSunriseTomorrow);
  }

  return new Date(utcSunrise);
  
  // 2025-05-17T02:44:05.000Z
  return new Date("2025-05-17T11:04:00.000Z");
}


export async function getSunrise(): Promise<Date> {
  try {
    const sunriseTime = await getSunriseTime();
    return sunriseTime;
  } catch (err) {
    console.error("Error getting sunrise:", err);
    scheduleRetry();
    return new Date(); // fallback value
  }
}


function scheduleRetry() {
  // Retry after 1 hour if API failed or sunrise passed
  console.log("🔁 Retrying in 1 hour...");
  setTimeout(() => getSunrise(), 10 * 1000);
}



export function triggerSunriseEvent(automaticControl: boolean) {
  

    if(automaticControl == true){

      console.log("🌅 Sunrise! Turning off lights...");

      MQTTPublisher.publishLedColor({
                red: 0,
                green: 0,
                blue: 0,
                brightness: 0,
                selectedRoom: 'living'
              });
              
      MQTTPublisher.publishLedColor({
                red: 0,
                green: 0,
                blue: 0,
                brightness: 0,
                selectedRoom: 'bedroom'
              });

    }
}
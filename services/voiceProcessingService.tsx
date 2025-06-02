type LightExecutor = (
  r: number,
  g: number,
  b: number,
  brightness: number
) => void; //the function type for a light executor

interface Color {
  name: string;
  r: number;
  g: number;
  b: number;
}

const colorMap: Color[] = [
  { name: "red", r: 255, g: 0, b: 0 },
  { name: "green", r: 0, g: 255, b: 0 },
  { name: "blue", r: 0, g: 0, b: 255 },
  { name: "yellow", r: 255, g: 255, b: 0 },
  { name: "cyan", r: 0, g: 255, b: 255 },
  { name: "magenta", r: 255, g: 0, b: 255 },
  { name: "orange", r: 255, g: 165, b: 0 },
  { name: "purple", r: 128, g: 0, b: 128 },
  { name: "white", r: 255, g: 255, b: 255 },
];

import { useCurtainsStore } from "@/stores/useCurtainsStore";
import { useLedStore } from "@/stores/useLedStore";
import { useTemperatureStore } from "@/stores/useTemperatureStore";

class VoiceProcessingService {
  constructor() {}

  processLights(data: any) {
    const command = data.action?.toLowerCase() ?? "";
    const color = data.color?.toLowerCase();
    const store = useLedStore.getState();
    const location = data.location?.toLowerCase();
    console.log(location);

    if (location) {
      if(location.includes("bedroom")){
        store.setRoom(location);
      }
      else if(location.includes("bathroom")){
        store.setRoom("bathroom");
      }
    }

    let r = 0,
      g = 0,
      b = 0,
      brightness = 1;

    if (
      command.includes("off") ||
      command.includes("down") ||
      command.includes("minimum")
    ) {
      brightness = 1;
    } else if (
      command.includes("on") ||
      command.includes("up") ||
      command.includes("maximum")
    ) {
      r = g = b = 255;
      brightness = 255;
    }

    store.setColor(r, g, b, brightness);

    if (color) {
      const col = colorMap.find((c) => c.name === color);
      if (col) {
        r = col.r;
        g = col.g;
        b = col.b;
        brightness = 255;
        store.setColor(r, g, b, brightness);
      }
    }
  }

  processCurtains(data: any) {
    const command = data.action?.toLowerCase() ?? "";
    const store = useCurtainsStore.getState();

    if (
      command?.includes("low") ||
      command?.includes("down") ||
      command?.includes("minimum")
    ) {
      store.setCurtainsState(0);
    } else if (
      command?.includes("raise") ||
      command?.includes("up") ||
      command?.includes("maximum")
    ) {
      store.setCurtainsState(255);
    }
  }

  processHeater(data: any) {
    console.log("HEater");
    const command = data.action?.toLowerCase();
    const value = data.value;
    const store = useTemperatureStore.getState();
    const other = data.other;

    console.log(data);

    if (
      command?.includes("off") ||
      command?.includes("down") ||
      command?.includes("minimum")
    ) {
      store.setHeater(1);
    }

    else if (
      command?.includes("on") ||
      command?.includes("up") ||
      command?.includes("maximum")
    ) {
      store.setHeater(255);
    }

    // if(other == "degrees")
    if (value) {
      store.desiredTemperatureHeater = value;
    }
  }

  processAC(data: any) {
    const command = data.action?.toLowerCase();
    const store = useTemperatureStore.getState();

    console.log(data);

    if (
      command?.includes("off") ||
      command?.includes("down") ||
      command?.includes("minimum")
    ) {
      store.setFan(1);
    }

    else if (
      command?.includes("on") ||
      command?.includes("up") ||
      command?.includes("maximum")
    ) {
      store.setFan(255);
    }
  }
  
}

export default new VoiceProcessingService();

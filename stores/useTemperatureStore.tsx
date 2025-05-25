import { MQTTPublisher } from "@/services/mqttPublisher";
import { create } from "zustand";
import { MIN_FAN_TEMP,MIN_HEATER_TEMP } from "@/constants";

type TemperatureState = {
  desiredTemperatureHeater: number;
  desiredTemperatureFan: number;
  heaterState: number;
  fanState: number;
  setHeater: (newHeaterState: number) => void;
  setDesiredTemperatureHeater: (desiredTemperature: number) => void;
  setDesiredTemperatureFan: (desiredTemperatureFan: number) => void;
  setFan: (newFanState: number) => void;
};


export const useTemperatureStore = create<TemperatureState>((set, get) => ({
    desiredTemperatureHeater: MIN_HEATER_TEMP,
    desiredTemperatureFan: MIN_FAN_TEMP,
    heaterState: 1,
    fanState: 1,

    setHeater: (newHeaterState: number) => {
        set({heaterState: newHeaterState});
        MQTTPublisher.publishHeaterState(newHeaterState);
    },

    setDesiredTemperatureHeater: (desiredTemperatureHeater: number) => {
        set({desiredTemperatureHeater: desiredTemperatureHeater});
            //i should publish after stabilizing 
        MQTTPublisher.publishTemperatureStateHeater(desiredTemperatureHeater);
    },

    setDesiredTemperatureFan: (desiredTemperatureFan: number) => {
      set({desiredTemperatureFan: desiredTemperatureFan});
      MQTTPublisher.publishTemperatureStateFan(desiredTemperatureFan);
    },

    setFan: (newFanState: number) => {
      set({fanState: newFanState});
      MQTTPublisher.publishFanState(newFanState);
    }
}));

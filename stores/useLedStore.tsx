import { create } from 'zustand';
import { MQTTPublisher} from '../services/mqttPublisher';
import { getSunrise, getSunriseTime, triggerSunriseEvent } from '@/utilsFunctions';
export type Room = 'bathroom' | 'bedroom'; 

type LedState = {
  red: number;
  green: number;
  blue: number;
  redBedroom: number;
  greenBedroom: number;
  blueBedroom: number;
  brightness: number;
  brightnessBedroom: number;
  selectedRoom: Room;
  automaticControl: boolean;
  sunriseTime: Date | null;
  lightsOffAtSunrise: boolean;
  setColor: (r: number, g: number, b: number, brightness: number) => void;
  setRoom: (room: Room) => void;
  setAutomaticControl: (isAutomated: boolean) => void;
  setLightsOffAtSunrise: (value: boolean) => void;
  fetchSunriseTime: () => Promise<void>;
  updateColorsFromMCU: (r: number, g: number, b: number, brightness: number, room: string) => void;
};


export const useLedStore = create<LedState>((set, get) => ({
  red: 0,
  green: 0,
  blue: 0,
  redBedroom: 0,
  greenBedroom: 0,
  blueBedroom: 0,
  brightness: 1,
  brightnessBedroom: 1,
  automaticControl: false,
  selectedRoom: 'bathroom',
  sunriseTime: null,
  lightsOffAtSunrise: false,

  setColor: (r, g, b, brightness) => {
    
    // console.log(get().selectedRoom);
    // console.log(r,g,b);  //why is this logged 4 thime 

    const {selectedRoom} = get();
    const { red, green, blue, brightness: oldBrightness } = get();
    const { redBedroom, greenBedroom, blueBedroom, brightnessBedroom: oldBrightnessBedroom } = get();

    if (selectedRoom == 'bathroom') {
      if(r === red && g === green && b === blue && brightness === oldBrightness) return; 
      set({ red: r, green: g, blue: b, brightness });
    }


    if (selectedRoom == 'bedroom') {
      if(r === redBedroom && g === greenBedroom && b === blueBedroom && brightness === oldBrightnessBedroom) return; 
      set({ redBedroom: r, greenBedroom: g, blueBedroom: b, brightnessBedroom: brightness });
    }


    MQTTPublisher.publishLedColor({
          red: r,
          green: g,
          blue: b,
          brightness,
          selectedRoom: get().selectedRoom
        })    
    },
  

    updateColorsFromMCU: (r, g, b, brightness, room) => {
    if (room == 'bathroom') {
      set({ red: r, green: g, blue: b, brightness });
    }

    if (room == 'bedroom') {
      set({ redBedroom: r, greenBedroom: g, blueBedroom: b, brightnessBedroom: brightness });
    }
    // console.log("Living: ", get().red,get().green,get().blue);
    // console.log("Bedroom: ", get().redBedroom,get().greenBedroom,get().blueBedroom);

  },
  
  setRoom: (room: Room) => set({ selectedRoom: room }),

  setLightsOffAtSunrise: (value: boolean) => set({ lightsOffAtSunrise: value }),


  setAutomaticControl: (isAutomated: boolean) => {
    set({ automaticControl: isAutomated });

    // Delay and trigger logic should be handled after sunriseTime is fetched
    get().fetchSunriseTime().then(() => {
      const { sunriseTime, automaticControl } = get();
      if (!sunriseTime) return;

      const now = new Date();
      let  delay = new Date(sunriseTime).getTime() - now.getTime();
      // console.log((delay / 1000) - 35900) ;
      // delay = delay - 35900000;
      // console.log(delay) ;
      // delay = 10000;

      if (automaticControl && get().lightsOffAtSunrise == false) {
        setInterval(() => 
          {
          triggerSunriseEvent(automaticControl);
          set({ red: 0, green: 0, blue: 0, brightness: 1});
          set({ redBedroom: 0, greenBedroom: 0, blueBedroom: 0, brightnessBedroom: 1 });
          set({lightsOffAtSunrise : true});
          }, delay);
      }

      // console.log("DA : ", automaticControl);
    });
  },

   fetchSunriseTime: async () => {
    try {
      const sunrise = await getSunrise();
      set({ sunriseTime: sunrise });
    } catch (error) {
      console.error("Failed to fetch sunrise time:", error);
    }
  },



}));

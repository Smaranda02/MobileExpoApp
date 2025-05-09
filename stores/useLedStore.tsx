import { create } from 'zustand';
import { MQTTPublisher} from '../services/mqttPublisher';

export type Room = 'living' | 'bedroom'; 

type LedState = {
  red: number;
  green: number;
  blue: number;
  brightness: number;
  selectedRoom: Room;
  setColor: (r: number, g: number, b: number, brightness: number) => void;
  setRoom: (room: Room) => void;
};


export const useLedStore = create<LedState>((set, get) => ({
  red: 0,
  green: 0,
  blue: 0,
  brightness: 1,
  selectedRoom: 'living',


  setColor: (r, g, b, brightness) => {

    // console.log(get().selectedRoom);
    // console.log(r,g,b);  //why is this logged 4 thime 

    const { red, green, blue, brightness: oldBrightness } = get();
    if (r === red && g === green && b === blue && brightness === oldBrightness) return; 
    
    set({ red: r, green: g, blue: b, brightness });

    MQTTPublisher.publishLedColor({
          red: r,
          green: g,
          blue: b,
          brightness,
          selectedRoom: get().selectedRoom
        })    
    },
  
  setRoom: (room: Room) => set({ selectedRoom: room }),
}));

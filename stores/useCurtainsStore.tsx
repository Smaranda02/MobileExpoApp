import { MQTTPublisher } from "@/services/mqttPublisher";
import { create } from "zustand";

// export type CurtainsPosition = 'up' | 'down'; 

type CurtainsState = {
    curtainsState : number,
    setCurtainsState : (position: number) => void;
    updateCurtainsStateFromMCU: (position: number) => void;
}

export const useCurtainsStore = create<CurtainsState>((set, get) => ({

    curtainsState : 0,
    
    setCurtainsState: (position) => {
        // const curtainsPosition = get();
        set({curtainsState: position});
        MQTTPublisher.publishCurtainsState(position ? "UP" : "DOWN");
    },

    updateCurtainsStateFromMCU: (position) => {
        set({curtainsState: position});
    }

}));

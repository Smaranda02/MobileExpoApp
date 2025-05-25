import { create } from "zustand";

type MqttState = {
    connected : boolean,
    setMqttState : (isConnected: boolean) => void;
}

export const useMqttStore = create<MqttState>((set, get) => ({

    connected : false,
    
    setMqttState: (isConnected: boolean) => {
        set({connected: isConnected});
    }

}));

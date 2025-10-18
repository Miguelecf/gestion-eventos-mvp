import { create } from "zustand";
type RootState = { ready: boolean; setReady: (v: boolean) => void };
export const useAppStore = create<RootState>((set) => ({
    ready: true, setReady: (v) => set({ ready: v }),
}));
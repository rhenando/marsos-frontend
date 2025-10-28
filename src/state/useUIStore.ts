import { create } from "zustand";

type UIState = {
  loading: boolean;
  setLoading: (v: boolean) => void;
};

export const useUIStore = create<UIState>((set) => ({
  loading: false,
  setLoading: (v) => set({ loading: v }),
}));

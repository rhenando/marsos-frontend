import { create } from "zustand";

interface OnboardingState {
  step: number; // current onboarding step (1, 2, 3, etc.)
  userType: "supplier" | "buyer" | null; // chosen path
  progress: number; // % completion
  data: Record<string, any>; // collected form data
  setStep: (step: number) => void;
  setUserType: (type: "supplier" | "buyer" | null) => void;
  setProgress: (progress: number) => void;
  updateData: (data: Record<string, any>) => void;
  resetOnboarding: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  step: 1,
  userType: null,
  progress: 0,
  data: {},

  setStep: (step) => set({ step }),
  setUserType: (type) => set({ userType: type }),
  setProgress: (progress) => set({ progress }),
  updateData: (data) => set((state) => ({ data: { ...state.data, ...data } })),
  resetOnboarding: () =>
    set({
      step: 1,
      userType: null,
      progress: 0,
      data: {},
    }),
}));

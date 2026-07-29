import { create } from 'zustand';

type OnboardingState = {
  nickname: string;
  setNickname: (nickname: string) => void;
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  nickname: '',
  setNickname: (nickname) => set({ nickname }),
}));

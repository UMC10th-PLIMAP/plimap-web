import { create } from 'zustand';

type OnboardingState = {
  nickname: string;
  setNickname: (nickname: string) => void;
  profileImageFile: File | null;
  setProfileImageFile: (profileImageFile: File) => void;
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  nickname: '',
  setNickname: (nickname) => set({ nickname }),
  profileImageFile: null,
  setProfileImageFile: (profileImageFile) => set({ profileImageFile }),
}));

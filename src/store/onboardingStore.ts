import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type OnboardingState = {
  nickname: string;
  setNickname: (nickname: string) => void;
  profileImageFile: File | null;
  profileImageUrl: string | null;
  setProfileImage: (profileImageFile: File, profileImageUrl: string) => void;
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      nickname: '',
      setNickname: (nickname) => set({ nickname }),
      profileImageFile: null,
      profileImageUrl: null,
      setProfileImage: (profileImageFile, profileImageUrl) =>
        set({ profileImageFile, profileImageUrl }),
    }),
    {
      name: 'onboarding-storage',
      // File은 직렬화가 안 되므로 닉네임과 이미지 URL만 저장
      partialize: (state) => ({
        nickname: state.nickname,
        profileImageUrl: state.profileImageUrl,
      }),
    },
  ),
);

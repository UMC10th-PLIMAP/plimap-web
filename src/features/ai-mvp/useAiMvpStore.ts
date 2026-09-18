import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { SearchTrack } from '@/features/pin/types';

type AiMvpState = {
  selectedCharacterId: string | null;
  representativeTrack: SearchTrack | null;
  setSelectedCharacterId: (selectedCharacterId: string | null) => void;
  setRepresentativeTrack: (representativeTrack: SearchTrack | null) => void;
};

export const useAiMvpStore = create<AiMvpState>()(
  persist(
    (set) => ({
      selectedCharacterId: null,
      representativeTrack: null,
      setSelectedCharacterId: (selectedCharacterId) => set({ selectedCharacterId }),
      setRepresentativeTrack: (representativeTrack) => set({ representativeTrack }),
    }),
    { name: 'plimap-ai-mvp' },
  ),
);

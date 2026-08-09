import { create } from 'zustand';

type FeedPlaceAccessState = {
  /** placeId → Place-Access-Token */
  tokens: Record<number, string>;
  activePlaceId: number | null;
  setToken: (placeId: number, placeAccessToken: string) => void;
  getToken: (placeId: number) => string | undefined;
  getActiveToken: () => string | undefined;
  clear: () => void;
};

export const useFeedPlaceAccessStore = create<FeedPlaceAccessState>((set, get) => ({
  tokens: {},
  activePlaceId: null,
  setToken: (placeId, placeAccessToken) =>
    set((state) => ({
      tokens: { ...state.tokens, [placeId]: placeAccessToken },
      activePlaceId: placeId,
    })),
  getToken: (placeId) => get().tokens[placeId],
  getActiveToken: () => {
    const { activePlaceId, tokens } = get();
    if (activePlaceId == null) return undefined;
    return tokens[activePlaceId];
  },
  clear: () => set({ tokens: {}, activePlaceId: null }),
}));

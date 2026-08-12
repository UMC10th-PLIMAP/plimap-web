import { create } from 'zustand';

import type { MapCoordinate } from '@/features/map/types';

export type PinCreationPlace = {
  placeId: number;
  placeName: string;
  address: string;
  roadAddress: string | null;
  source: 'PLACE_SEARCH' | 'ADDRESS_SEARCH' | 'MAP_SELECTION';
  coordinates: MapCoordinate;
  distanceMeters: number;
};

export type PinConfirmationOrigin = 'map' | 'search';

type PinCreationState = {
  candidateCoordinate: MapCoordinate | null;
  currentLocation: MapCoordinate | null;
  entrySearchQuery: string;
  searchKeyword: string;
  confirmationOrigin: PinConfirmationOrigin | null;
  place: PinCreationPlace | null;
  setCandidateCoordinate: (coordinate: MapCoordinate) => void;
  setCurrentLocation: (coordinate: MapCoordinate) => void;
  setEntrySearchQuery: (query: string) => void;
  setSearchKeyword: (keyword: string) => void;
  setConfirmationOrigin: (origin: PinConfirmationOrigin) => void;
  setPlace: (place: PinCreationPlace) => void;
  resetMapSelection: () => void;
  reset: () => void;
};

const initialState = {
  candidateCoordinate: null,
  currentLocation: null,
  entrySearchQuery: '',
  searchKeyword: '',
  confirmationOrigin: null,
  place: null,
};

export const usePinCreationStore = create<PinCreationState>((set) => ({
  ...initialState,
  setCandidateCoordinate: (candidateCoordinate) => set({ candidateCoordinate }),
  setCurrentLocation: (currentLocation) => set({ currentLocation }),
  setEntrySearchQuery: (entrySearchQuery) => set({ entrySearchQuery }),
  setSearchKeyword: (searchKeyword) => set({ searchKeyword }),
  setConfirmationOrigin: (confirmationOrigin) => set({ confirmationOrigin }),
  setPlace: (place) => set({ place }),
  resetMapSelection: () =>
    set((state) => ({
      candidateCoordinate: null,
      currentLocation: state.currentLocation,
      entrySearchQuery: state.entrySearchQuery,
      searchKeyword: '',
      confirmationOrigin: null,
      place: null,
    })),
  reset: () => set(initialState),
}));

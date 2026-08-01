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

type PinCreationState = {
  candidateCoordinate: MapCoordinate | null;
  currentLocation: MapCoordinate | null;
  searchKeyword: string;
  place: PinCreationPlace | null;
  setCandidateCoordinate: (coordinate: MapCoordinate) => void;
  setCurrentLocation: (coordinate: MapCoordinate) => void;
  setSearchKeyword: (keyword: string) => void;
  setPlace: (place: PinCreationPlace) => void;
  reset: () => void;
};

const initialState = {
  candidateCoordinate: null,
  currentLocation: null,
  searchKeyword: '',
  place: null,
};

export const usePinCreationStore = create<PinCreationState>((set) => ({
  ...initialState,
  setCandidateCoordinate: (candidateCoordinate) => set({ candidateCoordinate }),
  setCurrentLocation: (currentLocation) => set({ currentLocation }),
  setSearchKeyword: (searchKeyword) => set({ searchKeyword }),
  setPlace: (place) => set({ place }),
  reset: () => set(initialState),
}));

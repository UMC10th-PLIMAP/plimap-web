export type PlaceSearchSource = {
  resultType: 'PLACE' | 'ADDRESS';
  provider: string;
  providerPlaceId: string | null;
  category: string | null;
  address: string;
  roadAddress: string | null;
};

export type PlaceSearchItem = PlaceSearchSource & {
  placeName: string;
  latitude: number;
  longitude: number;
  distanceMeters: number;
  hasPin: boolean;
  firstPinCreatorNickname: string | null;
};

export type PlaceSearchResponse = {
  items: PlaceSearchItem[];
};

export type PlaceSearchHistoryItem = {
  historyId: number;
  placeId: number;
  placeName: string;
  category: string | null;
  address: string;
  roadAddress: string | null;
  latitude: number;
  longitude: number;
  distanceMeters: number;
  hasPin: boolean;
  firstPinCreatorNickname: string | null;
  selectedAt: string;
};

export type PlaceSearchHistoryResponse = {
  items: PlaceSearchHistoryItem[];
};

export type PlaceSelectionRequest = PlaceSearchSource & {
  placeName: string;
  latitude: number;
  longitude: number;
  userLatitude: number;
  userLongitude: number;
};

export type PlaceSelectionResponse = {
  placeId: number;
  placeName: string;
  address: string;
  roadAddress: string | null;
  source: 'PLACE_SEARCH' | 'ADDRESS_SEARCH' | 'MAP_SELECTION';
  distanceMeters: number;
  withinAccessRange: boolean;
  hasPin: boolean;
  firstPinCreatorNickname: string | null;
  pinCount: number;
  bookmarkedByMe: boolean;
};

export type PlaceSearchRequest = {
  keyword: string;
  latitude: number;
  longitude: number;
};

export type PlaceSearchHistoryRequest = {
  latitude: number;
  longitude: number;
};

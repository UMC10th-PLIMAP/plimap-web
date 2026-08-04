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

export type PlaceDetailResponse = {
  placeId: number;
  placeName: string;
  category: string | null;
  address: string;
  roadAddress: string | null;
  latitude: number;
  longitude: number;
  distanceMeters: number;
  withinAccessRange: boolean;
  hasPin: boolean;
  pinCount: number;
  bookmarkedByMe: boolean;
  pinnedByMe: boolean;
};

export type PlaceBookmarkResponse = {
  placeId: number;
  bookmarkedByMe: boolean;
};

export type PopularPlaceScope = 'NEARBY' | 'GLOBAL';

export type PopularPlaceItem = {
  placeId: number;
  placeName: string;
  distanceMeters: number;
  pinCount: number;
  representativeImageUrl: string | null;
};

export type PopularPlaceListResponse = {
  items: PopularPlaceItem[];
};

export type PopularPlaceListRequest = {
  scope: PopularPlaceScope;
  latitude: number;
  longitude: number;
};

export type PlaceMapSelectionRequest = {
  latitude: number;
  longitude: number;
  placeName: string | null;
  address: string;
  roadAddress: string | null;
};

export type ConfirmedMapSelection = {
  placeId: number;
  placeName: string;
  source: 'MAP_SELECTION';
  latitude: number;
  longitude: number;
};

export type RecommendedMapSelection = {
  placeId: number;
  placeName: string;
  category: string | null;
  address: string;
  roadAddress: string | null;
  source: 'PLACE_SEARCH';
  latitude: number;
  longitude: number;
  distanceMeters: number;
};

export type PlaceMapSelectionResult =
  | {
      status: 'MAP_SELECTION_CONFIRMED';
      mapSelection: ConfirmedMapSelection;
      recommendedPlace: null;
      buildingName: null;
    }
  | {
      status: 'PLACE_SEARCH_RECOMMENDED';
      mapSelection: null;
      recommendedPlace: RecommendedMapSelection;
      buildingName: null;
    }
  | {
      status: 'PLACE_SEARCH_REQUIRED';
      mapSelection: null;
      recommendedPlace: null;
      buildingName: string;
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

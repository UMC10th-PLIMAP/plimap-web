import type { ApiResponse } from '@/api/types';
import type { PinSearchPlace } from '@/features/pin/types';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

type PlaceSearchItem = {
  resultType: 'PLACE' | 'ADDRESS';
  provider: string;
  providerPlaceId: string | null;
  placeName: string;
  category: string | null;
  address: string;
  roadAddress: string | null;
  latitude: number;
  longitude: number;
  distanceMeters: number;
  hasPin: boolean;
  firstPinCreatorNickname: string | null;
};

type PlaceSearchResult = {
  items: PlaceSearchItem[];
};

type PlaceSearchHistoryItem = {
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

type PlaceSearchHistoryResult = {
  items: PlaceSearchHistoryItem[];
};

type PlaceSelectionResult = {
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

type CsrfTokenResult = {
  token: string;
};

type SearchPlacesParams = {
  keyword: string;
  latitude: number;
  longitude: number;
  signal?: AbortSignal;
};

const toPinSearchPlace = (item: PlaceSearchItem): PinSearchPlace => ({
  id: `${item.resultType}:${item.providerPlaceId ?? `${item.latitude}:${item.longitude}`}`,
  creatorName: item.hasPin ? (item.firstPinCreatorNickname ?? undefined) : undefined,
  category: item.category || '장소',
  placeName: item.placeName,
  address: item.roadAddress || item.address,
  distance: item.distanceMeters,
  coordinates: {
    lat: item.latitude,
    lng: item.longitude,
  },
  searchSource: {
    resultType: item.resultType,
    provider: item.provider,
    providerPlaceId: item.providerPlaceId,
    category: item.category,
    address: item.address,
    roadAddress: item.roadAddress,
  },
});

const toRecentPinSearchPlace = (item: PlaceSearchHistoryItem): PinSearchPlace => ({
  id: `place:${item.placeId}`,
  creatorName: item.hasPin ? (item.firstPinCreatorNickname ?? undefined) : undefined,
  category: item.category || '장소',
  placeName: item.placeName,
  address: item.roadAddress || item.address,
  distance: item.distanceMeters,
  coordinates: {
    lat: item.latitude,
    lng: item.longitude,
  },
});

export async function searchPlaces({
  keyword,
  latitude,
  longitude,
  signal,
}: SearchPlacesParams): Promise<PinSearchPlace[]> {
  const searchParams = new URLSearchParams({
    keyword,
    latitude: String(latitude),
    longitude: String(longitude),
  });
  const response = await fetch(`${API_BASE_URL}/places/search?${searchParams}`, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
    signal,
  });
  const payload = (await response
    .json()
    .catch(() => null)) as ApiResponse<PlaceSearchResult> | null;

  if (!response.ok || !payload?.isSuccess) {
    throw new Error(payload?.message || '장소를 검색하지 못했어요. 잠시 후 다시 시도해주세요.');
  }

  return payload.result.items.map(toPinSearchPlace);
}

type GetRecentSearchPlacesParams = {
  latitude: number;
  longitude: number;
  signal?: AbortSignal;
};

export async function getRecentSearchPlaces({
  latitude,
  longitude,
  signal,
}: GetRecentSearchPlacesParams): Promise<PinSearchPlace[]> {
  const searchParams = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
  });
  const response = await fetch(`${API_BASE_URL}/places/search-histories?${searchParams}`, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
    signal,
  });
  const payload = (await response
    .json()
    .catch(() => null)) as ApiResponse<PlaceSearchHistoryResult> | null;

  if (!response.ok || !payload?.isSuccess) {
    throw new Error(
      payload?.message || '최근 검색 장소를 불러오지 못했어요. 잠시 후 다시 시도해주세요.',
    );
  }

  return payload.result.items.map(toRecentPinSearchPlace);
}

const getCsrfToken = async (signal?: AbortSignal) => {
  const response = await fetch(`${API_BASE_URL}/auth/csrf`, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
    signal,
  });
  const payload = (await response.json().catch(() => null)) as ApiResponse<CsrfTokenResult> | null;

  if (!response.ok || !payload?.isSuccess) {
    throw new Error(payload?.message || '요청을 인증하지 못했어요. 다시 로그인해주세요.');
  }

  return payload.result.token;
};

type SelectSearchPlaceParams = {
  place: PinSearchPlace;
  userLatitude: number;
  userLongitude: number;
  signal?: AbortSignal;
};

export async function selectSearchPlace({
  place,
  userLatitude,
  userLongitude,
  signal,
}: SelectSearchPlaceParams): Promise<PinSearchPlace> {
  if (!place.searchSource) return place;

  const csrfToken = await getCsrfToken(signal);
  const response = await fetch(`${API_BASE_URL}/places/selections`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-XSRF-TOKEN': csrfToken,
    },
    body: JSON.stringify({
      ...place.searchSource,
      placeName: place.placeName,
      latitude: place.coordinates.lat,
      longitude: place.coordinates.lng,
      userLatitude,
      userLongitude,
    }),
    signal,
  });
  const payload = (await response
    .json()
    .catch(() => null)) as ApiResponse<PlaceSelectionResult> | null;

  if (!response.ok || !payload?.isSuccess) {
    throw new Error(payload?.message || '장소를 선택하지 못했어요. 잠시 후 다시 시도해주세요.');
  }

  const selection = payload.result;
  return {
    ...place,
    id: `place:${selection.placeId}`,
    creatorName: selection.hasPin ? (selection.firstPinCreatorNickname ?? undefined) : undefined,
    placeName: selection.placeName,
    address: selection.roadAddress || selection.address,
    distance: selection.distanceMeters,
  };
}

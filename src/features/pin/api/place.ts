import type { PinSearchPlace } from '@/features/pin/types';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

type ApiResponse<T> = {
  isSuccess: boolean;
  code: string;
  message: string;
  result: T;
};

type PlaceSearchItem = {
  provider: string;
  providerPlaceId: string;
  placeName: string;
  category: string;
  address: string;
  roadAddress: string;
  latitude: number;
  longitude: number;
  distanceMeters: number;
  hasPin: boolean;
  firstPinCreatorNickname: string | null;
};

type PlaceSearchResult = {
  items: PlaceSearchItem[];
};

type SearchPlacesParams = {
  keyword: string;
  latitude: number;
  longitude: number;
  signal?: AbortSignal;
};

const toPinSearchPlace = (item: PlaceSearchItem): PinSearchPlace => ({
  id: `${item.provider}:${item.providerPlaceId}`,
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
  const response = await fetch(`${API_BASE_URL}/api/v1/places/search?${searchParams}`, {
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

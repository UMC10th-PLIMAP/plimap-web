import { apiClient } from '@/api/client';
import type { ApiResponse } from '@/api/types';
import type { PinSearchPlace } from '@/features/pin/types';
import type {
  PlaceSearchHistoryItem,
  PlaceSearchHistoryRequest,
  PlaceSearchHistoryResponse,
  PlaceSearchItem,
  PlaceSearchRequest,
  PlaceSearchResponse,
  PlaceSelectionRequest,
  PlaceSelectionResponse,
} from '@/types/place.type';

const ENDPOINT = '/api/v1/places';

type RequestOptions = {
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
  searchHistoryId: item.historyId,
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

/** GET /api/v1/places/search 장소 검색 */
export async function searchPlaces({
  keyword,
  latitude,
  longitude,
  signal,
}: PlaceSearchRequest & RequestOptions): Promise<PinSearchPlace[]> {
  const { data } = await apiClient.get<ApiResponse<PlaceSearchResponse>>(`${ENDPOINT}/search`, {
    params: { keyword, latitude, longitude },
    signal,
  });

  return data.result.items.map(toPinSearchPlace);
}

/** GET /api/v1/places/search-histories 최근 검색 장소 조회 */
export async function getRecentSearchPlaces({
  latitude,
  longitude,
  signal,
}: PlaceSearchHistoryRequest & RequestOptions): Promise<PinSearchPlace[]> {
  const { data } = await apiClient.get<ApiResponse<PlaceSearchHistoryResponse>>(
    `${ENDPOINT}/search-histories`,
    {
      params: { latitude, longitude },
      signal,
    },
  );

  return data.result.items.map(toRecentPinSearchPlace);
}

/** DELETE /api/v1/places/search-histories/{historyId} 최근 검색 장소 삭제 */
export async function deleteRecentSearchPlace(historyId: number): Promise<void> {
  await apiClient.delete<ApiResponse<null>>(`${ENDPOINT}/search-histories/${historyId}`);
}

type SelectSearchPlaceParams = {
  place: PinSearchPlace;
  userLatitude: number;
  userLongitude: number;
  signal?: AbortSignal;
};

/** POST /api/v1/places/selections 장소 선택 및 최근 검색 저장 */
export async function selectSearchPlace({
  place,
  userLatitude,
  userLongitude,
  signal,
}: SelectSearchPlaceParams): Promise<PinSearchPlace> {
  if (!place.searchSource) return place;

  const request: PlaceSelectionRequest = {
    ...place.searchSource,
    placeName: place.placeName,
    latitude: place.coordinates.lat,
    longitude: place.coordinates.lng,
    userLatitude,
    userLongitude,
  };
  const { data } = await apiClient.post<ApiResponse<PlaceSelectionResponse>>(
    `${ENDPOINT}/selections`,
    request,
    { signal },
  );

  const selection = data.result;
  return {
    ...place,
    id: `place:${selection.placeId}`,
    creatorName: selection.hasPin ? (selection.firstPinCreatorNickname ?? undefined) : undefined,
    placeName: selection.placeName,
    address: selection.roadAddress || selection.address,
    distance: selection.distanceMeters,
  };
}

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
  PlaceMapSelectionRequest,
  PlaceMapSelectionResult,
  PlaceSelectionRequest,
  PlaceSelectionResponse,
  PlaceDetailResponse,
  PlaceBookmarkResponse,
  PlaceBookmarkListRequest,
  PlaceBookmarkListResponse,
} from '@/types/place.type';

const ENDPOINT = '/api/v1/places';

type RequestOptions = {
  signal?: AbortSignal;
};

type GetPlaceDetailRequest = {
  placeId: number;
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
  placeId: item.placeId,
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

/** GET /api/v1/places/{placeId} 장소 상세 및 북마크 상태 조회 */
export async function getPlaceDetail({
  placeId,
  latitude,
  longitude,
  signal,
}: GetPlaceDetailRequest): Promise<PlaceDetailResponse> {
  const { data } = await apiClient.get<ApiResponse<PlaceDetailResponse>>(`${ENDPOINT}/${placeId}`, {
    params: { latitude, longitude },
    signal,
  });
  return data.result;
}

/** PUT /api/v1/places/{placeId}/bookmarks 장소 북마크 등록 */
export async function bookmarkPlace(placeId: number): Promise<PlaceBookmarkResponse> {
  const { data } = await apiClient.put<ApiResponse<PlaceBookmarkResponse>>(
    `${ENDPOINT}/${placeId}/bookmarks`,
  );
  return data.result;
}

/** DELETE /api/v1/places/{placeId}/bookmarks 장소 북마크 삭제 */
export async function deletePlaceBookmark(placeId: number): Promise<PlaceBookmarkResponse> {
  const { data } = await apiClient.delete<ApiResponse<PlaceBookmarkResponse>>(
    `${ENDPOINT}/${placeId}/bookmarks`,
  );
  return data.result;
}

/** GET /api/v1/places/bookmarks 저장한 장소 목록 조회 (500m 이내, 거리순 최대 9개) */
export async function getPlaceBookmarks({
  latitude,
  longitude,
  signal,
}: PlaceBookmarkListRequest & RequestOptions): Promise<PlaceBookmarkListResponse> {
  const { data } = await apiClient.get<ApiResponse<PlaceBookmarkListResponse>>(
    `${ENDPOINT}/bookmarks`,
    {
      params: { latitude, longitude },
      signal,
    },
  );
  return data.result;
}

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
    placeId: selection.placeId,
    source: selection.source,
    withinAccessRange: selection.withinAccessRange,
    id: `place:${selection.placeId}`,
    creatorName: selection.hasPin ? (selection.firstPinCreatorNickname ?? undefined) : undefined,
    placeName: selection.placeName,
    address: selection.roadAddress || selection.address,
    distance: selection.distanceMeters,
    bookmarkedByMe: selection.bookmarkedByMe,
  };
}

/** POST /api/v1/places/map-selections 지도 선택 장소 판정 */
export async function confirmMapSelection(
  request: PlaceMapSelectionRequest,
  options?: RequestOptions,
): Promise<PlaceMapSelectionResult> {
  const { data } = await apiClient.post<ApiResponse<PlaceMapSelectionResult>>(
    `${ENDPOINT}/map-selections`,
    request,
    { signal: options?.signal },
  );

  return data.result;
}

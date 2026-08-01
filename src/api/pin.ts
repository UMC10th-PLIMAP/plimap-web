import { apiClient } from '@/api/client';
import type { ApiResponse } from '@/api/types';
import type {
  MemberMeRequest,
  MemberMeResponse,
  GetPlaceTrackPinsResponse,
  PinSort,
} from '@/features/pin/types';
import type { MapBounds, MapCluster, MapPin } from '@/features/map/types';

export type PinAvailabilityRequest = {
  latitude: number;
  longitude: number;
  userLatitude: number;
  userLongitude: number;
};

export type PinAvailabilityResponse = {
  status: 'CREATABLE_NEW_PLACE' | 'OUT_OF_RANGE' | 'TOO_CLOSE_TO_PIN';
  registrable: boolean;
  distanceFromUserMeters: number;
  nearestPinDistanceMeters: number | null;
};

export type MapPinsRequest = {
  southWestLat: number;
  southWestLng: number;
  northEastLat: number;
  northEastLng: number;
  zoomLevel: number;
};

type MapPinPreviewResponse = {
  placeId: number;
  latitude: number;
  longitude: number;
  writerNickname: string;
  writerProfileImage: string | null;
  introduction: string;
  albumImageUrl: string | null;
  youtubeVideoId: string;
  clipStartMs: number;
};

type MapClusterResponse = {
  clusterLevel: string;
  regionName: string;
  latitude: number;
  longitude: number;
  pinCount: number;
  bounds: {
    southWestLat: number;
    southWestLng: number;
    northEastLat: number;
    northEastLng: number;
  };
};

export type MapPinsResponse = {
  zoomLevel: number;
  pins: MapPin[];
  clusters: MapCluster[];
};

type MapPinsApiResponse = {
  zoomLevel: number;
  pins: MapPinPreviewResponse[] | null;
  clusters: MapClusterResponse[] | null;
};

const toMapBounds = (bounds: MapClusterResponse['bounds']): MapBounds => ({
  southWest: { lat: bounds.southWestLat, lng: bounds.southWestLng },
  northEast: { lat: bounds.northEastLat, lng: bounds.northEastLng },
});

// 8) GET /api/v1/place-tracks/{placeTrackId}/pins - 특정 장소 노래의 PIN 목록 조회
export async function getPlaceTrackPins(
  placeTrackId: string,
  pageSize: number,
  cursor?: string,
  pinSortType: PinSort = 'LATEST',
): Promise<GetPlaceTrackPinsResponse> {
  const { data } = await apiClient.get<ApiResponse<GetPlaceTrackPinsResponse>>(
    `/api/v1/place-tracks/${placeTrackId}/pins`,
    {
      params: { pageSize, cursor, pinSortType },
    },
  );
  return data.result;
}

// 11) GET /api/v1/feed/members/me - 내 피드 목록 조회

export async function getMemberMe({ pageSize, cursor }: MemberMeRequest) {
  const { data } = await apiClient.get<ApiResponse<MemberMeResponse>>(`/api/v1/feed/members/me`, {
    params: { pageSize, cursor },
  });
  return data.result;
}

/** POST /api/v1/pins/availability 지도 선택 위치의 PIN 등록 가능 여부 검증 */
export async function validatePinAvailability(
  request: PinAvailabilityRequest,
): Promise<PinAvailabilityResponse> {
  const { data } = await apiClient.post<ApiResponse<PinAvailabilityResponse>>(
    '/api/v1/pins/availability',
    request,
  );
  return data.result;
}

/** GET /api/v1/pins/map viewport 기반 PIN/클러스터 조회 */
export async function getMapPins(request: MapPinsRequest): Promise<MapPinsResponse> {
  const { data } = await apiClient.get<ApiResponse<MapPinsApiResponse>>('/api/v1/pins/map', {
    params: request,
  });

  return {
    zoomLevel: data.result.zoomLevel,
    pins: (data.result.pins ?? []).map((pin) => ({
      id: `place:${pin.placeId}`,
      placeId: pin.placeId,
      lat: pin.latitude,
      lng: pin.longitude,
      coverUrl: pin.albumImageUrl ?? undefined,
    })),
    clusters: (data.result.clusters ?? []).map((cluster) => ({
      id: `${cluster.clusterLevel}:${cluster.regionName}`,
      count: cluster.pinCount,
      lat: cluster.latitude,
      lng: cluster.longitude,
      regionName: cluster.regionName,
      bounds: toMapBounds(cluster.bounds),
    })),
  };
}

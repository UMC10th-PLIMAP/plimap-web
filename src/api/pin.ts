import { apiClient } from '@/api/client';
import type { ApiResponse } from '@/api/types';
import type {
  MemberMeRequest,
  MemberMeResponse,
  GetPlaceTrackPinsResponse,
  PinSort,
} from '@/features/pin/types';
import type { MapPin } from '@/features/map/types';

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

export type MapPinsResponse = {
  pins: MapPin[];
};

type MapPinsApiResponse = {
  pins: MapPinPreviewResponse[] | null;
};

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
  options?: { signal?: AbortSignal },
): Promise<PinAvailabilityResponse> {
  const { data } = await apiClient.post<ApiResponse<PinAvailabilityResponse>>(
    '/api/v1/pins/availability',
    request,
    { signal: options?.signal },
  );
  return data.result;
}

/** GET /api/v1/pins/map 핀 등록 위치 선택기의 viewport 기반 기존 PIN 조회 */
export async function getMapPins(request: MapPinsRequest): Promise<MapPinsResponse> {
  const { data } = await apiClient.get<ApiResponse<MapPinsApiResponse>>('/api/v1/pins/map', {
    params: request,
  });

  return {
    pins: (data.result.pins ?? []).map((pin) => ({
      id: `place:${pin.placeId}`,
      placeId: pin.placeId,
      lat: pin.latitude,
      lng: pin.longitude,
      coverUrl: pin.albumImageUrl ?? undefined,
    })),
  };
}

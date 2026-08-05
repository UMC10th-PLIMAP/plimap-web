import { apiClient } from '@/api/client';
import type { ApiResponse } from '@/api/types';
import type {
  MemberMeRequest,
  MemberMeResponse,
  GetPlaceTrackPinsResponse,
  LikeCountResponse,
  GetMyPinsResponse,
  PinDetailResponse,
  PatchPinRequest,
  PatchPinResponse,
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

export type CreatePinRequest = {
  userLatitude: number;
  userLongitude: number;
  placeId: number;
  itunesTrackId: number;
  clipStartMs: number;
  introduction: string;
  tags: string[];
  feedOpen: boolean;
};

export type CreatePinResponse = {
  pinId: number;
  placeId: number;
  writerNickname: string;
  writerProfileImage: string | null;
  introduction: string;
  youtubeVideoId: string;
  clipStartMs: number;
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

// 1) PUT /api/v1/pins/{pinId}/likes - PIN 좋아요 등록
export async function putPinLike(pinId: string): Promise<LikeCountResponse> {
  const { data } = await apiClient.put<ApiResponse<LikeCountResponse>>(
    `/api/v1/pins/${pinId}/likes`,
  );
  return data.result;
}

// 2) DELETE /api/v1/pins/{pinId}/likes - PIN 좋아요 취소
export async function deletePinLike(pinId: string): Promise<LikeCountResponse> {
  const { data } = await apiClient.delete<ApiResponse<LikeCountResponse>>(
    `/api/v1/pins/${pinId}/likes`,
  );
  return data.result;
}

// 5) GET /api/v1/pins/{pinId} - PIN 상세 보기
export async function getPinDetail(pinId: string): Promise<PinDetailResponse> {
  const { data } = await apiClient.get<ApiResponse<PinDetailResponse>>(`/api/v1/pins/${pinId}`);
  return data.result;
}

// 6) DELETE /api/v1/pins/{pinId} - PIN 삭제
export async function deletePin(pinId: string): Promise<void> {
  const { data } = await apiClient.delete<ApiResponse<void>>(`/api/v1/pins/${pinId}`);
  return data.result;
}

// 7) PATCH /api/v1/pins/{pinId} - PIN 수정
export async function patchPin(pinId: string, request: PatchPinRequest): Promise<PatchPinResponse> {
  const { data } = await apiClient.patch<ApiResponse<PatchPinResponse>>(
    `/api/v1/pins/${pinId}`,
    request,
  );
  return data.result;
}

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

// 9) GET /api/v1/pins/members/me - 내가 작성한 PIN 목록 조회
export async function getMyPins(pageSize: number, cursor?: string): Promise<GetMyPinsResponse> {
  const { data } = await apiClient.get<ApiResponse<GetMyPinsResponse>>(`/api/v1/pins/members/me`, {
    params: { pageSize, cursor },
  });
  return data.result;
}

// 10) GET /api/v1/feed/members/{memberId} - 타인 피드 목록 조회
export async function getOtherMemberFeed(
  memberId: number,
  pageSize?: number,
  cursor?: string,
): Promise<MemberMeResponse> {
  const { data } = await apiClient.get<ApiResponse<MemberMeResponse>>(
    `/api/v1/feed/members/${memberId}`,
    {
      params: { pageSize, cursor },
    },
  );
  return data.result;
}

// 11) GET /api/v1/feed/members/me - 내 피드 목록 조회
export async function getMemberMe({
  pageSize,
  cursor,
  userLatitude,
  userLongitude,
}: MemberMeRequest): Promise<MemberMeResponse> {
  const { data } = await apiClient.get<ApiResponse<MemberMeResponse>>(`/api/v1/feed/members/me`, {
    params: { pageSize, cursor, userLatitude, userLongitude },
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

/** POST /api/v1/pins PIN 최종 생성 */
export async function createPin(request: CreatePinRequest): Promise<CreatePinResponse> {
  const { data } = await apiClient.post<ApiResponse<CreatePinResponse>>('/api/v1/pins', request);
  return data.result;
}

/** GET /api/v1/pins/map 핀 등록 위치 선택기의 viewport 기반 기존 PIN 조회 */
export async function getMapPins(
  request: MapPinsRequest,
  options?: { signal?: AbortSignal },
): Promise<MapPinsResponse> {
  const { data } = await apiClient.get<ApiResponse<MapPinsApiResponse>>('/api/v1/pins/map', {
    params: request,
    signal: options?.signal,
  });

  return {
    pins: (data.result.pins ?? []).map((pin) => ({
      id: `place:${pin.placeId}`,
      placeId: pin.placeId,
      lat: pin.latitude,
      lng: pin.longitude,
      coverUrl: pin.albumImageUrl ?? undefined,
      nickname: pin.writerNickname,
      avatarUrl: pin.writerProfileImage ?? undefined,
      introduction: pin.introduction,
    })),
  };
}

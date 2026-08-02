import { apiClient } from '@/api/client';
import type { ApiResponse } from '@/api/types';
import type {
  MemberMeRequest,
  MemberMeResponse,
  GetPlaceTrackPinsResponse,
  LikeCountResponse,
  GetMyPinsResponse,
  PinSort,
} from '@/features/pin/types';

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

// 11) GET /api/v1/feed/members/me - 내 피드 목록 조회

export async function getMemberMe({ pageSize, cursor }: MemberMeRequest) {
  const { data } = await apiClient.get<ApiResponse<MemberMeResponse>>(`/api/v1/feed/members/me`, {
    params: { pageSize, cursor },
  });
  return data.result;
}

import { apiClient } from '@/api/client';
import type { ApiResponse } from '@/api/types';
import type {
  MemberMeRequest,
  MemberMeResponse,
  GetPlaceTrackPinsResponse,
  PinSort,
} from '@/features/pin/types';

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

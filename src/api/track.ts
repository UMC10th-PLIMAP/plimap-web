import { apiClient } from '@/api/client';
import type { ApiResponse } from '@/api/types';
import type {
  searchTracksResponse,
  GetLikedTracksResponse,
  GetPlaceTracksResponse,
  PutLikedTracksResponse,
  GetPlaceTrackDetailResponse,
  GetPlaybackPreparationsResponse,
} from '@/features/pin/types';

// 1) PUT /api/v1/place-tracks/{placeTrackId}/likes - 장소별 곡 좋아요 등록
export async function putLikedTracks(placeTrackId: string): Promise<PutLikedTracksResponse> {
  const { data } = await apiClient.put<ApiResponse<PutLikedTracksResponse>>(
    `/api/v1/place-tracks/${placeTrackId}/likes`,
  );
  return data.result;
}

// 2) DELETE /api/v1/place-tracks/{placeTrackId}/likes - 장소별 곡 좋아요 삭제
export async function deleteLikedTracks(placeTrackId: string): Promise<PutLikedTracksResponse> {
  const { data } = await apiClient.delete<ApiResponse<PutLikedTracksResponse>>(
    `/api/v1/place-tracks/${placeTrackId}/likes`,
  );
  return data.result;
}

// 3) POST /api/v1/tracks/playback-preparations - 구간 재생 준비
export async function getPlaybackPreparations(
  itunesTrackId: string,
): Promise<GetPlaybackPreparationsResponse> {
  const { data } = await apiClient.post<ApiResponse<GetPlaybackPreparationsResponse>>(
    `/api/v1/tracks/playback-preparations`,
    { itunesTrackId: Number(itunesTrackId) },
  );
  return data.result;
}
// 4) GET /api/v1/tracks/search -  음악 검색
export async function searchTracks(
  keyword: string,
  limit: number = 20,
): Promise<searchTracksResponse> {
  const { data } = await apiClient.get<ApiResponse<searchTracksResponse>>('/api/v1/tracks/search', {
    params: { keyword, limit },
  });
  return data.result;
}

// 5) GET /api/v1/places/{placeId}/tracks - 장소별 곡 목록 조회 (placeId: 2, latitude: 37.5665, longitude: 126.978로 하드코드 상태 추후에 수정 필요)

export async function getPlaceTracks(
  page: string,
  size: number,
  latitude: number,
  longitude: number,
  sort: string,
): Promise<GetPlaceTracksResponse> {
  const { data } = await apiClient.get<ApiResponse<GetPlaceTracksResponse>>(
    `/api/v1/places/2/tracks`,
    {
      params: { page, size, latitude, longitude, sort },
    },
  );
  return data.result;
}

// 6) GET /api/v1/place-tracks/{placeTrackId} - 장소 노래 상세 조회
export async function getPlaceTrackDetail(
  placeTrackId: string,
): Promise<GetPlaceTrackDetailResponse> {
  const { data } = await apiClient.get<ApiResponse<GetPlaceTrackDetailResponse>>(
    `/api/v1/place-tracks/${placeTrackId}`,
  );
  return data.result;
}

// 7) GET /api/v1/place-tracks/likes - 좋아요한 장소별 곡 목록 조회
export async function getLikedTracks(
  page: string,
  size: number = 20,
): Promise<GetLikedTracksResponse> {
  const { data } = await apiClient.get<ApiResponse<GetLikedTracksResponse>>(
    '/api/v1/place-tracks/likes',
    {
      params: { page, size },
    },
  );
  return data.result;
}

import { apiClient } from '@/api/client';
import type { ApiResponse } from '@/api/types';
import type { searchTracksResponse, GetLikedTracksResponse } from '@/features/pin/types';

/** GET /api/v1/tracks/search 음악 검색 */
export async function searchTracks(
  keyword: string,
  limit: number = 20,
): Promise<searchTracksResponse> {
  const { data } = await apiClient.get<ApiResponse<searchTracksResponse>>('/api/v1/tracks/search', {
    params: { keyword, limit },
  });
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

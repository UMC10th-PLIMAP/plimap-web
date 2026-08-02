import { apiClient } from '@/api/client';
import type { ApiResponse } from '@/api/types';
import type { searchTracksResponse } from '@/features/pin/types';

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

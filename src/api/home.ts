import { apiClient } from '@/api/client';
import type { ApiResponse } from '@/api/types';

export type HomeContextRequest = {
  latitude: number;
  longitude: number;
};

export type HomeCurrentRegion = {
  sido: string | null;
  sigungu: string | null;
  eupMyeonDong: string | null;
  displayName: string | null;
};

export type HomeContextResponse = {
  nickname: string | null;
  currentRegion: HomeCurrentRegion;
};

export async function getHomeContext(params: HomeContextRequest) {
  const { data } = await apiClient.get<ApiResponse<HomeContextResponse>>('/api/v1/home/context', {
    params,
  });
  return data.result;
}

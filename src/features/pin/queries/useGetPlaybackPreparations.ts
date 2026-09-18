import { useQuery, type QueryClient } from '@tanstack/react-query';

import { getPlaybackPreparations } from '@/api/track';
import type { GetPlaybackPreparationsResponse } from '@/features/pin/types';

type UseGetPlaybackPreparationsParams = {
  itunesTrackId?: string;
  enabled?: boolean;
  initialData?: GetPlaybackPreparationsResponse;
};

export function playbackPreparationsQueryKey(itunesTrackId: string | number) {
  return ['pin', 'playbackPreparations', String(itunesTrackId)] as const;
}

/** 검색 목록에서 곡 선택 시 재생 준비를 미리 호출해 캐시에 담는다. */
export function fetchPlaybackPreparations(queryClient: QueryClient, itunesTrackId: number) {
  return queryClient.fetchQuery({
    queryKey: playbackPreparationsQueryKey(itunesTrackId),
    queryFn: () => getPlaybackPreparations(itunesTrackId),
  });
}

export function useGetPlaybackPreparations({
  itunesTrackId,
  enabled = true,
  initialData,
}: UseGetPlaybackPreparationsParams = {}) {
  return useQuery({
    queryKey: playbackPreparationsQueryKey(itunesTrackId ?? ''),
    queryFn: () => getPlaybackPreparations(Number(itunesTrackId)),
    enabled: enabled && Boolean(itunesTrackId) && !isNaN(Number(itunesTrackId)),
    initialData,
  });
}

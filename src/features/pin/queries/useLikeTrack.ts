import { useInfiniteQuery } from '@tanstack/react-query';
import { getLikedTracks } from '@/api/track';

type UseLikeTrackParams = {
  size?: number;
  enabled?: boolean;
};

export function useLikeTrack({ size = 20, enabled = true }: UseLikeTrackParams = {}) {
  return useInfiniteQuery({
    queryKey: ['pin', 'likeTrack', 'infinite', { size }],
    queryFn: ({ pageParam }) => getLikedTracks(String(pageParam), size),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.page + 1 : undefined),
    enabled,
  });
}

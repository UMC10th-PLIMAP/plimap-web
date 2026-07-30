import { useQuery } from '@tanstack/react-query';
import { getLikedTracks } from '@/api/track';

type UseLikeTrackParams = {
  page?: string;
  size?: number;
  enabled?: boolean;
};

export function useLikeTrack({ page = '0', size = 20, enabled = true }: UseLikeTrackParams = {}) {
  return useQuery({
    queryKey: ['pin', 'likeTrack', { page, size }],
    queryFn: () => getLikedTracks(page, size),
    enabled,
  });
}

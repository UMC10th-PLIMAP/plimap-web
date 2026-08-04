import { useQuery } from '@tanstack/react-query';
import { getPlaybackPreparations } from '@/api/track';

type UseGetPlaybackPreparationsParams = {
  itunesTrackId?: string;
  enabled?: boolean;
};

export function useGetPlaybackPreparations({
  itunesTrackId,
  enabled = true,
}: UseGetPlaybackPreparationsParams = {}) {
  return useQuery({
    queryKey: ['pin', 'playbackPreparations', itunesTrackId],
    queryFn: () => getPlaybackPreparations(Number(itunesTrackId)),
    enabled: enabled && Boolean(itunesTrackId) && !isNaN(Number(itunesTrackId)),
  });
}

import { useQuery } from '@tanstack/react-query';
import { getPlaceTrackDetail } from '@/api/track';

type UsePlaceTrackDetailParams = {
  placeTrackId?: string;
  enabled?: boolean;
};

export function usePlaceTrackDetail({
  placeTrackId,
  enabled = true,
}: UsePlaceTrackDetailParams = {}) {
  return useQuery({
    queryKey: ['pin', 'placeTrackDetail', placeTrackId],
    queryFn: () => getPlaceTrackDetail(placeTrackId!),
    enabled: enabled && Boolean(placeTrackId),
  });
}

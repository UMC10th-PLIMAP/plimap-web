import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getPlaceTracks } from '@/api/track';
import type { PinSort } from '@/features/pin/types';

type UsePlaceTrackParams = {
  placeId?: string;
  page?: string;
  size?: number;
  latitude?: number;
  longitude?: number;
  sort?: PinSort;
  enabled?: boolean;
};

export function usePlaceTrack({
  placeId,
  page = '0',
  size = 20,
  latitude,
  longitude,
  sort = 'POPULAR',
  enabled = true,
}: UsePlaceTrackParams = {}) {
  const canFetch =
    enabled && Boolean(placeId) && typeof latitude === 'number' && typeof longitude === 'number';

  return useQuery({
    queryKey: ['pin', 'placeTrack', placeId, { page, size, latitude, longitude, sort }],
    queryFn: () => getPlaceTracks(placeId!, page, size, latitude!, longitude!, sort),
    enabled: canFetch,
    placeholderData: keepPreviousData,
  });
}

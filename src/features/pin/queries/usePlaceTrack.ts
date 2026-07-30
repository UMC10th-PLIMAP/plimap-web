import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getPlaceTracks } from '@/api/track';
import type { PinSort } from '@/features/pin/types';

type UsePlaceTrackParams = {
  page?: string;
  size?: number;
  latitude?: number;
  longitude?: number;
  sort?: PinSort;
  enabled?: boolean;
};

export function usePlaceTrack({
  page = '0',
  size = 20,
  latitude = 37.5665,
  longitude = 126.978,
  sort = 'POPULAR',
  enabled = true,
}: UsePlaceTrackParams = {}) {
  return useQuery({
    queryKey: ['pin', 'placeTrack', { page, size, latitude, longitude, sort }],
    queryFn: () => getPlaceTracks(page, size, latitude, longitude, sort),
    enabled,
    placeholderData: keepPreviousData,
  });
}

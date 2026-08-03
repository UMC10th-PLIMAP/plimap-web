import { useInfiniteQuery } from '@tanstack/react-query';
import { getPlaceTrackPins } from '@/api/pin';
import type { PinSort } from '@/features/pin/types';

type UsePlaceTrackPinsParams = {
  placeTrackId?: string;
  pageSize?: number;
  pinSortType?: PinSort;
  enabled?: boolean;
};

export function usePlaceTrackPins({
  placeTrackId,
  pageSize = 10,
  pinSortType = 'LATEST',
  enabled = true,
}: UsePlaceTrackPinsParams = {}) {
  return useInfiniteQuery({
    queryKey: ['pin', 'placeTrackPins', placeTrackId, { pageSize, pinSortType }],
    queryFn: ({ pageParam }) => getPlaceTrackPins(placeTrackId!, pageSize, pageParam, pinSortType),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.nextCursor : undefined),
    enabled: enabled && Boolean(placeTrackId),
  });
}

import { useInfiniteQuery } from '@tanstack/react-query';
import { getPlaceTrackPins } from '@/api/pin';
import type { PinSort } from '@/features/pin/types';

type UsePlaceTrackPinsParams = {
  placeTrackId?: string;
  pageSize?: number;
  pinSortType?: PinSort;
  userLatitude?: number;
  userLongitude?: number;
  placeAccessToken?: string;
  enabled?: boolean;
};

export function usePlaceTrackPins({
  placeTrackId,
  pageSize = 10,
  pinSortType = 'LATEST',
  userLatitude,
  userLongitude,
  placeAccessToken,
  enabled = true,
}: UsePlaceTrackPinsParams = {}) {
  const hasLocation =
    userLatitude !== undefined &&
    userLongitude !== undefined &&
    Number.isFinite(userLatitude) &&
    Number.isFinite(userLongitude);

  return useInfiniteQuery({
    queryKey: [
      'pin',
      'placeTrackPins',
      placeTrackId,
      {
        pageSize,
        pinSortType,
        userLatitude,
        userLongitude,
        hasPlaceAccessToken: Boolean(placeAccessToken),
      },
    ],
    queryFn: ({ pageParam }) =>
      getPlaceTrackPins({
        placeTrackId: placeTrackId!,
        pageSize,
        cursor: pageParam,
        pinSortType,
        userLatitude: userLatitude!,
        userLongitude: userLongitude!,
        placeAccessToken,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.nextCursor : undefined),
    enabled: enabled && Boolean(placeTrackId) && hasLocation,
  });
}

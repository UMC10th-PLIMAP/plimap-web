import { useQuery } from '@tanstack/react-query';
import { getPlaceTrackDetail } from '@/api/track';

type UsePlaceTrackDetailParams = {
  placeTrackId?: string;
  userLatitude?: number;
  userLongitude?: number;
  placeAccessToken?: string;
  enabled?: boolean;
};

export function usePlaceTrackDetail({
  placeTrackId,
  userLatitude,
  userLongitude,
  placeAccessToken,
  enabled = true,
}: UsePlaceTrackDetailParams = {}) {
  const hasLocation =
    userLatitude !== undefined &&
    userLongitude !== undefined &&
    Number.isFinite(userLatitude) &&
    Number.isFinite(userLongitude);

  return useQuery({
    queryKey: [
      'pin',
      'placeTrackDetail',
      placeTrackId,
      { userLatitude, userLongitude, placeAccessToken },
    ],
    queryFn: () =>
      getPlaceTrackDetail({
        placeTrackId: placeTrackId!,
        userLatitude: userLatitude!,
        userLongitude: userLongitude!,
        placeAccessToken,
      }),
    enabled: enabled && Boolean(placeTrackId) && hasLocation,
  });
}

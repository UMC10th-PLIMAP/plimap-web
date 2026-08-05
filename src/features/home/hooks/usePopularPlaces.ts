import { useQuery } from '@tanstack/react-query';

import { getPopularPlaces } from '@/api/place';
import type { PopularPlaceScope } from '@/types/place.type';

type UsePopularPlacesParams = {
  scope: PopularPlaceScope;
  latitude: number | null;
  longitude: number | null;
  enabled?: boolean;
};

/** NEARBY(500m 이내 거리순) 또는 GLOBAL(전체 PIN 수 순) 인기 장소, 최대 6개 */
export function usePopularPlaces({
  scope,
  latitude,
  longitude,
  enabled = true,
}: UsePopularPlacesParams) {
  return useQuery({
    queryKey: ['home', 'places', 'popular', scope, { latitude, longitude }],
    queryFn: ({ signal }) => {
      if (latitude === null || longitude === null) {
        throw new Error('현재 위치 정보가 필요해요.');
      }
      return getPopularPlaces({ scope, latitude, longitude, signal });
    },
    enabled: enabled && latitude !== null && longitude !== null,
    staleTime: 60_000,
  });
}

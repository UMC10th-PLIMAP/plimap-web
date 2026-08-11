import { useQuery } from '@tanstack/react-query';

import { getHomeContext } from '@/api/home';
import { homeQueryKeys } from '@/features/home/queries/homeQueryKeys';

type UseHomeContextParams = {
  latitude: number | null;
  longitude: number | null;
};

export function useHomeContext({ latitude, longitude }: UseHomeContextParams) {
  return useQuery({
    queryKey: homeQueryKeys.context(latitude, longitude),
    queryFn: () => {
      if (latitude === null || longitude === null) {
        throw new Error('현재 위치 정보가 필요해요.');
      }
      return getHomeContext({ latitude, longitude });
    },
    enabled: latitude !== null && longitude !== null,
    staleTime: 5 * 60_000,
    retry: false,
  });
}

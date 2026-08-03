import { useQuery } from '@tanstack/react-query';

import { getCurrentPosition } from '@/utils/geolocation';

const CURRENT_POSITION_STALE_TIME_MS = 10_000;

type UseCurrentPositionParams = {
  options?: PositionOptions;
  staleTime?: number;
  enabled?: boolean;
};

export function useCurrentPosition({
  options,
  staleTime = CURRENT_POSITION_STALE_TIME_MS,
  enabled = true,
}: UseCurrentPositionParams = {}) {
  const resolvedOptions: PositionOptions = {
    enableHighAccuracy: options?.enableHighAccuracy ?? true,
    maximumAge: options?.maximumAge ?? 0,
    timeout: options?.timeout ?? 5_000,
  };

  return useQuery({
    queryKey: ['geolocation', 'current-position', resolvedOptions],
    queryFn: async () => {
      const result = await getCurrentPosition(resolvedOptions);
      if (!result.ok) throw new Error(result.reason);

      return {
        latitude: result.coordinate.lat,
        longitude: result.coordinate.lng,
      };
    },
    enabled,
    staleTime,
    retry: false,
  });
}

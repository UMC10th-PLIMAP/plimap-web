import { useQuery } from '@tanstack/react-query';

import { loadGoogleMapsScript } from '@/features/map/utils';
import { reverseGeocode } from '@/features/map/utils/reverseGeocode';

type UseCurrentAddressParams = {
  latitude: number | null;
  longitude: number | null;
};

function formatCurrentAddress(address: string) {
  return address.replace(/^(대한민국|South Korea)[,\s]*/, '');
}

export function useCurrentAddress({ latitude, longitude }: UseCurrentAddressParams) {
  return useQuery({
    queryKey: ['geolocation', 'current-address', { latitude, longitude }],
    queryFn: async ({ signal }) => {
      if (latitude === null || longitude === null) {
        throw new Error('현재 위치 정보가 필요해요.');
      }

      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      if (!apiKey) throw new Error('지도 API 키가 설정되지 않았어요.');

      await loadGoogleMapsScript(apiKey);
      signal.throwIfAborted();

      const address = await reverseGeocode({ lat: latitude, lng: longitude }, { signal });
      return formatCurrentAddress(address);
    },
    enabled: latitude !== null && longitude !== null,
    staleTime: 5 * 60_000,
    retry: false,
  });
}

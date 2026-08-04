import { useQuery } from '@tanstack/react-query';

import { getPinDetail } from '@/api/pin';

type UsePinDetailParams = {
  pinId?: string;
  enabled?: boolean;
};

export function usePinDetail({ pinId, enabled = true }: UsePinDetailParams = {}) {
  return useQuery({
    queryKey: ['pin', 'detail', pinId],
    queryFn: () => getPinDetail(pinId!),
    enabled: enabled && Boolean(pinId),
  });
}

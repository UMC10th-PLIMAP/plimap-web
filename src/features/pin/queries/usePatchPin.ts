import { useMutation, useQueryClient } from '@tanstack/react-query';

import { patchPin } from '@/api/pin';
import type { PatchPinRequest } from '@/features/pin/types';

type PatchPinVariables = PatchPinRequest & {
  pinId: string;
};

export function usePatchPin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ pinId, ...request }: PatchPinVariables) => patchPin(pinId, request),
    onSuccess: (_data, { pinId }) => {
      void queryClient.invalidateQueries({ queryKey: ['pin', 'detail', pinId] });
      void queryClient.invalidateQueries({ queryKey: ['pin', 'placeTrack'] });
      void queryClient.invalidateQueries({ queryKey: ['pin', 'memberMe'] });
      void queryClient.invalidateQueries({ queryKey: ['pins'] });
    },
  });
}

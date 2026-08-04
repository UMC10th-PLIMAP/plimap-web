import { useMutation, useQueryClient } from '@tanstack/react-query';
import { putPinLike } from '@/api/pin';
import {
  preparePinLikeMutation,
  rollbackPinLikeMutation,
  setPinLiked,
} from '@/features/pin/queries/pinLikeCache';

export function usePutPinLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pinId: string) => putPinLike(pinId),
    onMutate: async (pinId) => {
      const context = await preparePinLikeMutation(queryClient);
      setPinLiked(queryClient, pinId, true);
      return context;
    },
    onError: (_error, _pinId, context) => {
      rollbackPinLikeMutation(queryClient, context);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['pin', 'placeTrackPins'] });
    },
  });
}

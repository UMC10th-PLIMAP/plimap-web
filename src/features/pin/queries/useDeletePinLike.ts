import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deletePinLike } from '@/api/pin';
import {
  preparePinLikeMutation,
  rollbackPinLikeMutation,
  setPinLiked,
} from '@/features/pin/queries/pinLikeCache';

export function useDeletePinLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pinId: string) => deletePinLike(pinId),
    onMutate: async (pinId) => {
      const context = await preparePinLikeMutation(queryClient);
      setPinLiked(queryClient, pinId, false);
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

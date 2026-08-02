import { useMutation, useQueryClient } from '@tanstack/react-query';
import { putLikedTracks } from '@/api/track';
import {
  prepareLikedTrackMutation,
  rollbackLikedTrackMutation,
  setPlaceTrackLiked,
} from '@/features/pin/queries/likedTrackCache';

export function usePutLikedTrack() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (placeTrackId: string) => putLikedTracks(placeTrackId),
    onMutate: async (placeTrackId) => {
      const context = await prepareLikedTrackMutation(queryClient);
      setPlaceTrackLiked(queryClient, placeTrackId, true);
      return context;
    },
    onError: (_error, _placeTrackId, context) => {
      rollbackLikedTrackMutation(queryClient, context);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['pin', 'likeTrack'] });
      void queryClient.invalidateQueries({ queryKey: ['pin', 'placeTrack'] });
      void queryClient.invalidateQueries({ queryKey: ['pin', 'placeTrackDetail'] });
    },
  });
}

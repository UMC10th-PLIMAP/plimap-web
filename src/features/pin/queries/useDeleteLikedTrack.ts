import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteLikedTracks } from '@/api/track';
import {
  prepareLikedTrackMutation,
  removeLikedTrackFromList,
  rollbackLikedTrackMutation,
  setPlaceTrackLiked,
} from '@/features/pin/queries/likedTrackCache';

export function useDeleteLikedTrack() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (placeTrackId: string) => deleteLikedTracks(placeTrackId),
    onMutate: async (placeTrackId) => {
      const context = await prepareLikedTrackMutation(queryClient);
      setPlaceTrackLiked(queryClient, placeTrackId, false);
      removeLikedTrackFromList(queryClient, placeTrackId);
      return context;
    },
    onError: (_error, _placeTrackId, context) => {
      rollbackLikedTrackMutation(queryClient, context);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['pin', 'likeTrack'] });
      void queryClient.invalidateQueries({ queryKey: ['pin', 'placeTrack'] });
    },
  });
}

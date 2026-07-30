import { useMutation, useQueryClient } from '@tanstack/react-query';
import { putLikedTracks } from '@/api/track';

export function usePutLikedTrack() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (placeTrackId: string) => putLikedTracks(placeTrackId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['pin', 'likeTrack'] });
      void queryClient.invalidateQueries({ queryKey: ['pin', 'placeTrack'] });
    },
  });
}

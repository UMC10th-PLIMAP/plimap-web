import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deletePin } from '@/api/pin';

export function useDeletePin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pinId: string) => deletePin(pinId),
    onSuccess: (_data, pinId) => {
      void queryClient.invalidateQueries({ queryKey: ['pin', 'detail', pinId] });
      void queryClient.invalidateQueries({ queryKey: ['pin', 'placeTrack'] });
      void queryClient.invalidateQueries({ queryKey: ['pin', 'placeTrackPins'] });
      void queryClient.invalidateQueries({ queryKey: ['pin', 'memberMe'] });
      void queryClient.invalidateQueries({ queryKey: ['pin', 'myPins'] });
      void queryClient.invalidateQueries({ queryKey: ['pins'] });
    },
  });
}

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createPin } from '@/api/pin';

export function useCreatePin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPin,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['pins'] });
      void queryClient.invalidateQueries({ queryKey: ['pin', 'memberMe'] });
      void queryClient.invalidateQueries({ queryKey: ['pin', 'placeTrack'] });
      void queryClient.invalidateQueries({ queryKey: ['pin', 'places'] });
    },
  });
}

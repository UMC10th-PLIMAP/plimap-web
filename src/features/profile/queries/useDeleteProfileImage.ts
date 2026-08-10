import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteProfileImage } from '@/api/member';
import { memberQueryKeys } from '@/features/profile/queries/memberQueryKeys';
import type { MyProfileResponse } from '@/types/member.type';

export function useDeleteProfileImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProfileImage,
    onSuccess: () => {
      queryClient.setQueryData<MyProfileResponse>(
        memberQueryKeys.me(),
        (old) => old && { ...old, profileImageUrl: null },
      );
    },
  });
}

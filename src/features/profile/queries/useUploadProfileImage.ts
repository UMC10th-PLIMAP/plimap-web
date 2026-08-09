import { useMutation, useQueryClient } from '@tanstack/react-query';

import { uploadProfileImage } from '@/api/member';
import { memberQueryKeys } from '@/features/profile/queries/memberQueryKeys';
import type { MyProfileResponse } from '@/types/member.type';

export function useUploadProfileImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadProfileImage,
    onSuccess: ({ imageUrl }) => {
      queryClient.setQueryData<MyProfileResponse>(
        memberQueryKeys.me(),
        (old) => old && { ...old, profileImageUrl: imageUrl },
      );
    },
  });
}

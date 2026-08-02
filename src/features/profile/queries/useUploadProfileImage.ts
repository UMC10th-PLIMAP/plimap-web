import { useMutation, useQueryClient } from '@tanstack/react-query';

import { uploadProfileImage } from '@/api/member';
import type { MyProfileResponse } from '@/types/member.type';

export function useUploadProfileImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadProfileImage,
    onSuccess: (data) => {
      queryClient.setQueryData<MyProfileResponse>(
        ['me'],
        (old) => old && { ...old, profileImageObjectKey: data.objectKey },
      );
    },
  });
}

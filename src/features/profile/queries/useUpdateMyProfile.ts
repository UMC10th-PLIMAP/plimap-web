import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateMyProfile } from '@/api/member';
import type { MyProfileResponse } from '@/types/member.type';

export function useUpdateMyProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMyProfile,
    onSuccess: (data) => {
      queryClient.setQueryData<MyProfileResponse>(
        ['me'],
        (old) =>
          old && {
            ...old,
            nickname: data.nickname,
            name: data.name,
            introduction: data.introduction,
          },
      );
    },
  });
}

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateMyProfile } from '@/api/member';
import { memberQueryKeys } from '@/features/profile/queries/memberQueryKeys';
import type { MyProfileResponse } from '@/types/member.type';

export function useUpdateMyProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMyProfile,
    onSuccess: (data) => {
      queryClient.setQueryData<MyProfileResponse>(
        memberQueryKeys.me(),
        (old) =>
          old && {
            ...old,
            nickname: data.nickname,
            name: data.name,
            introduction: data.introduction,
            profileImageUrl: data.profileImageUrl,
          },
      );
    },
  });
}

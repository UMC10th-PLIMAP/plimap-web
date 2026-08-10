import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { HomeContextResponse } from '@/api/home';
import { updateMyProfile } from '@/api/member';
import { homeQueryKeys } from '@/features/home/queries/homeQueryKeys';
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
      queryClient.setQueriesData<HomeContextResponse>(
        { queryKey: homeQueryKeys.contexts() },
        (old) => old && { ...old, nickname: data.nickname },
      );
    },
  });
}

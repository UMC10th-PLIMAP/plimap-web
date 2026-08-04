import { useMutation, useQueryClient } from '@tanstack/react-query';

import { followMember } from '@/api/member';
import type { MemberProfileResponse } from '@/types/member.type';

export function useFollowMember(memberId: number) {
  const queryClient = useQueryClient();
  const queryKey = ['members', String(memberId)] as const;

  return useMutation({
    mutationFn: () => followMember(memberId),
    onSuccess: () => {
      queryClient.setQueryData<MemberProfileResponse>(queryKey, (profile) =>
        profile
          ? {
              ...profile,
              isFollowing: true,
              followerCount: profile.followerCount + 1,
            }
          : profile,
      );
      void queryClient.invalidateQueries({ queryKey });
    },
  });
}

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { followMember, unfollowMember } from '@/api/member';
import type { MemberProfileResponse } from '@/types/member.type';

export function useFollowMember(memberId: number) {
  const queryClient = useQueryClient();
  const queryKey = ['members', memberId] as const;

  return useMutation({
    mutationFn: (isFollowing: boolean) =>
      isFollowing ? unfollowMember(memberId) : followMember(memberId),
    onSuccess: (_data, isFollowing) => {
      queryClient.setQueryData<MemberProfileResponse>(queryKey, (profile) =>
        profile
          ? {
              ...profile,
              isFollowing: !isFollowing,
              followerCount: Math.max(0, profile.followerCount + (isFollowing ? -1 : 1)),
            }
          : profile,
      );
      void queryClient.invalidateQueries({ queryKey });
    },
  });
}

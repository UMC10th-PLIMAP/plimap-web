import { useMutation, useQueryClient } from '@tanstack/react-query';

import { followMember, unfollowMember } from '@/api/member';
import { memberQueryKeys } from '@/features/profile/queries/memberQueryKeys';
import { updateFollowCaches } from '@/features/profile/queries/updateFollowCaches';

type ToggleFollowParams = {
  memberId: number;
  isFollowing: boolean;
};

export function useToggleFollow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ memberId, isFollowing }: ToggleFollowParams) =>
      isFollowing ? unfollowMember(memberId) : followMember(memberId),
    onSuccess: (_data, { memberId, isFollowing }) => {
      updateFollowCaches(queryClient, { memberId, wasFollowing: isFollowing });
      void queryClient.invalidateQueries({ queryKey: memberQueryKeys.profile(memberId) });
    },
  });
}

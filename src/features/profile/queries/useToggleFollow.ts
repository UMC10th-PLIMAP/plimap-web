import { useMutation, useQueryClient, type InfiniteData } from '@tanstack/react-query';

import { followMember, unfollowMember } from '@/api/member';
import type { FollowListResponse, MyProfileResponse } from '@/types/member.type';

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
      queryClient.setQueriesData<InfiniteData<FollowListResponse>>(
        {
          predicate: ({ queryKey }) => queryKey[0] === 'member' && queryKey[2] === 'follow-list',
        },
        (old) =>
          old && {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((item) =>
                item.id === memberId ? { ...item, isFollowing: !isFollowing } : item,
              ),
            })),
          },
      );

      queryClient.setQueryData<MyProfileResponse>(['me'], (profile) =>
        profile
          ? {
              ...profile,
              followingCount: Math.max(0, profile.followingCount + (isFollowing ? -1 : 1)),
            }
          : profile,
      );
    },
  });
}

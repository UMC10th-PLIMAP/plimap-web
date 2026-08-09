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
        { queryKey: ['member'] },
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

      // 내 프로필의 팔로잉 수도 캐시에 반영
      queryClient.setQueryData<MyProfileResponse>(
        ['me'],
        (old) =>
          old && {
            ...old,
            followingCount: old.followingCount + (isFollowing ? -1 : 1),
          },
      );
    },
  });
}

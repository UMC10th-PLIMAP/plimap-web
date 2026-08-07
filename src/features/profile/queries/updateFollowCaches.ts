import { type InfiniteData, type QueryClient } from '@tanstack/react-query';

import { memberQueryKeys } from '@/features/profile/queries/memberQueryKeys';
import type {
  FollowListResponse,
  MemberProfileResponse,
  MemberSearchResponse,
  MyProfileResponse,
} from '@/types/member.type';

type UpdateFollowCachesParams = {
  memberId: number;
  wasFollowing: boolean;
};

export function updateFollowCaches(
  queryClient: QueryClient,
  { memberId, wasFollowing }: UpdateFollowCachesParams,
) {
  const isFollowing = !wasFollowing;
  const countDelta = wasFollowing ? -1 : 1;

  queryClient.setQueryData<MyProfileResponse>(memberQueryKeys.me(), (profile) =>
    profile
      ? {
          ...profile,
          followingCount: Math.max(0, profile.followingCount + countDelta),
        }
      : profile,
  );

  queryClient.setQueryData<MemberProfileResponse>(memberQueryKeys.profile(memberId), (profile) =>
    profile
      ? {
          ...profile,
          isFollowing,
          followerCount: Math.max(0, profile.followerCount + countDelta),
        }
      : profile,
  );

  queryClient.setQueriesData<InfiniteData<FollowListResponse>>(
    { queryKey: memberQueryKeys.followLists() },
    (current) =>
      current && {
        ...current,
        pages: current.pages.map((page) => ({
          ...page,
          data: page.data.map((member) =>
            member.id === memberId ? { ...member, isFollowing } : member,
          ),
        })),
      },
  );

  queryClient.setQueriesData<InfiniteData<MemberSearchResponse>>(
    { queryKey: memberQueryKeys.searches() },
    (current) =>
      current && {
        ...current,
        pages: current.pages.map((page) => ({
          ...page,
          data: page.data.map((member) =>
            member.id === memberId ? { ...member, isFollowing } : member,
          ),
        })),
      },
  );
}

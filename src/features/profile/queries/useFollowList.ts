import { useInfiniteQuery } from '@tanstack/react-query';

import { getFollowerList, getFollowingList } from '@/api/member';
import { memberQueryKeys } from '@/features/profile/queries/memberQueryKeys';
import type { FollowTab } from '@/features/profile/types';

const FETCHER_BY_TAB = {
  following: getFollowingList,
  follower: getFollowerList,
} satisfies Record<FollowTab, typeof getFollowingList>;

type UseInfiniteFollowListParams = {
  memberId: number | undefined;
  tab: FollowTab;
  pageSize?: number;
};

export function useInfiniteFollowList({
  memberId,
  tab,
  pageSize = 10,
}: UseInfiniteFollowListParams) {
  return useInfiniteQuery({
    queryKey: memberQueryKeys.followList(memberId, tab, pageSize),
    queryFn: ({ pageParam }) =>
      FETCHER_BY_TAB[tab]({ memberId: memberId as number, pageSize, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.nextCursor : undefined),
    enabled: memberId !== undefined,
  });
}

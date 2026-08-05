import { useInfiniteQuery } from '@tanstack/react-query';

import { getOtherMemberFeed } from '@/api/pin';

type UseInfiniteOtherMemberFeedParams = {
  memberId?: number;
  pageSize?: number;
};

export function useInfiniteOtherMemberFeed({
  memberId,
  pageSize = 10,
}: UseInfiniteOtherMemberFeedParams) {
  return useInfiniteQuery({
    queryKey: ['pin', 'otherMemberFeed', 'infinite', memberId, { pageSize }],
    queryFn: ({ pageParam }) => getOtherMemberFeed(memberId!, pageSize, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.nextCursor : undefined),
    enabled: Number.isFinite(memberId) && (memberId ?? 0) > 0,
  });
}

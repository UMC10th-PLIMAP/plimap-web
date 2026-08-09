import { useInfiniteQuery } from '@tanstack/react-query';

import { getOtherMemberFeed } from '@/api/pin';
import { useCurrentPosition } from '@/hooks/useCurrentPosition';

type UseInfiniteOtherMemberFeedParams = {
  memberId?: number;
  pageSize?: number;
};

export function useInfiniteOtherMemberFeed({
  memberId,
  pageSize = 10,
}: UseInfiniteOtherMemberFeedParams) {
  const isValidMemberId = Number.isInteger(memberId) && (memberId ?? 0) > 0;
  const {
    data: currentPosition,
    isFetched: isPositionFetched,
    isError: isPositionError,
  } = useCurrentPosition({ enabled: isValidMemberId });

  return useInfiniteQuery({
    queryKey: [
      'pin',
      'otherMemberFeed',
      'infinite',
      memberId,
      {
        pageSize,
        userLatitude: currentPosition?.latitude,
        userLongitude: currentPosition?.longitude,
      },
    ],
    queryFn: ({ pageParam }) =>
      getOtherMemberFeed({
        memberId: memberId!,
        pageSize,
        cursor: pageParam,
        userLatitude: currentPosition?.latitude,
        userLongitude: currentPosition?.longitude,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.nextCursor : undefined),
    enabled: isValidMemberId && (isPositionFetched || isPositionError),
  });
}

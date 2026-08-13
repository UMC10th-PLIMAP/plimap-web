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
  const currentPositionQuery = useCurrentPosition({ enabled: isValidMemberId });
  const { data: currentPosition, isError: isPositionError } = currentPositionQuery;

  const feedQuery = useInfiniteQuery({
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
    queryFn: ({ pageParam }) => {
      if (!currentPosition) throw new Error('Current position is required to load the feed.');

      return getOtherMemberFeed({
        memberId: memberId!,
        pageSize,
        cursor: pageParam,
        userLatitude: currentPosition.latitude,
        userLongitude: currentPosition.longitude,
      });
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.nextCursor : undefined),
    enabled: isValidMemberId && Boolean(currentPosition),
  });

  return {
    ...feedQuery,
    error: currentPositionQuery.error ?? feedQuery.error,
    isError: isPositionError || feedQuery.isError,
    isPending:
      isValidMemberId &&
      !isPositionError &&
      (currentPositionQuery.isPending || feedQuery.isPending),
    refetch: isPositionError ? currentPositionQuery.refetch : feedQuery.refetch,
  };
}

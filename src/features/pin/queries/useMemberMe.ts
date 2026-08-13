import { useInfiniteQuery } from '@tanstack/react-query';

import { getMemberMe } from '@/api/pin';
import { useCurrentPosition } from '@/hooks/useCurrentPosition';

type UseInfiniteMemberMeParams = {
  pageSize?: number;
  enabled?: boolean;
};

export function useInfiniteMemberMe({
  pageSize = 10,
  enabled = true,
}: UseInfiniteMemberMeParams = {}) {
  const currentPositionQuery = useCurrentPosition({ enabled });
  const { data: currentPosition, isError: isPositionError } = currentPositionQuery;

  const feedQuery = useInfiniteQuery({
    queryKey: [
      'pin',
      'memberMe',
      'infinite',
      {
        pageSize,
        userLatitude: currentPosition?.latitude,
        userLongitude: currentPosition?.longitude,
      },
    ],
    queryFn: ({ pageParam }) => {
      if (!currentPosition) throw new Error('Current position is required to load the feed.');

      return getMemberMe({
        pageSize,
        cursor: pageParam,
        userLatitude: currentPosition.latitude,
        userLongitude: currentPosition.longitude,
      });
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.nextCursor : undefined),
    enabled: enabled && Boolean(currentPosition),
  });

  return {
    ...feedQuery,
    error: currentPositionQuery.error ?? feedQuery.error,
    isError: isPositionError || feedQuery.isError,
    isPending:
      enabled && !isPositionError && (currentPositionQuery.isPending || feedQuery.isPending),
    refetch: isPositionError ? currentPositionQuery.refetch : feedQuery.refetch,
  };
}

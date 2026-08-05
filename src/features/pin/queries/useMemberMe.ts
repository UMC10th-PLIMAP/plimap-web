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
  const {
    data: currentPosition,
    isFetched: isPositionFetched,
    isError: isPositionError,
  } = useCurrentPosition({ enabled });

  return useInfiniteQuery({
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
    queryFn: ({ pageParam }) =>
      getMemberMe({
        pageSize,
        cursor: pageParam,
        userLatitude: currentPosition?.latitude,
        userLongitude: currentPosition?.longitude,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.nextCursor : undefined),
    // 위치 조회가 끝나거나 실패해도 피드는 조회한다 (위치 실패 ≠ 빈 피드)
    enabled: enabled && (isPositionFetched || isPositionError),
  });
}

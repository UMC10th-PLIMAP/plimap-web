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
  const { data: currentPosition } = useCurrentPosition({ enabled });

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
        userLatitude: currentPosition!.latitude,
        userLongitude: currentPosition!.longitude,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.nextCursor : undefined),
    enabled: enabled && Boolean(currentPosition),
  });
}

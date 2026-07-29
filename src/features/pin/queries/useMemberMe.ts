import { useInfiniteQuery } from '@tanstack/react-query';

import { getMemberMe } from '@/features/pin/api/pin';

const DEFAULT_PAGE_SIZE = 10;

type UseInfiniteMemberMeParams = {
  pageSize?: number;
};

export function useInfiniteMemberMe({
  pageSize = DEFAULT_PAGE_SIZE,
}: UseInfiniteMemberMeParams = {}) {
  return useInfiniteQuery({
    queryKey: ['pin', 'memberMe', 'infinite', { pageSize }],
    queryFn: ({ pageParam }) => getMemberMe({ pageSize, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.nextCursor : undefined),
  });
}

import { useInfiniteQuery } from '@tanstack/react-query';
import { getMemberMe } from '@/api/pin';

type UseInfiniteMemberMeParams = {
  pageSize?: number;
};

export function useInfiniteMemberMe({ pageSize = 10 }: UseInfiniteMemberMeParams = {}) {
  return useInfiniteQuery({
    queryKey: ['pin', 'memberMe', 'infinite', { pageSize }],
    queryFn: ({ pageParam }) => getMemberMe({ pageSize, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.nextCursor : undefined),
  });
}

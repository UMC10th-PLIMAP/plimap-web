import { useInfiniteQuery } from '@tanstack/react-query';
import { getMyPins } from '@/api/pin';

type UseInfiniteMyPinsParams = {
  pageSize?: number;
};

export function useInfiniteMyPins({ pageSize = 10 }: UseInfiniteMyPinsParams = {}) {
  return useInfiniteQuery({
    queryKey: ['pin', 'myPins', 'infinite', { pageSize }],
    queryFn: ({ pageParam }) => getMyPins(pageSize, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.nextCursor : undefined),
  });
}

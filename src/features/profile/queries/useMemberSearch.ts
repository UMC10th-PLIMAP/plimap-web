import { useInfiniteQuery } from '@tanstack/react-query';

import { searchMembersByNickname } from '@/api/member';
import { memberQueryKeys } from '@/features/profile/queries/memberQueryKeys';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

type UseMemberSearchParams = {
  keyword: string;
  pageSize?: number;
  debounceMs?: number;
};

export function useMemberSearch({
  keyword,
  pageSize = 10,
  debounceMs = 300,
}: UseMemberSearchParams) {
  const debouncedKeyword = useDebouncedValue(keyword.trim(), debounceMs);
  const query = useInfiniteQuery({
    queryKey: memberQueryKeys.search(debouncedKeyword, pageSize),
    queryFn: ({ pageParam }) =>
      searchMembersByNickname({ keyword: debouncedKeyword, pageSize, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? (lastPage.nextCursor ?? undefined) : undefined,
    enabled: debouncedKeyword.length > 0,
    staleTime: 30_000,
  });

  return { ...query, debouncedKeyword };
}

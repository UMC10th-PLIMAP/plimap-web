import { useQuery } from '@tanstack/react-query';

import { searchTracks } from '@/api/track';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

type UseSearchTracksParams = {
  keyword: string;
  limit?: number;
  debounceMs?: number;
};

export function useSearchTracks({ keyword, limit, debounceMs = 300 }: UseSearchTracksParams) {
  const normalizedKeyword = keyword.trim();
  const debouncedKeyword = useDebouncedValue(normalizedKeyword, debounceMs);
  const enabled = debouncedKeyword.length > 0;

  const searchQuery = useQuery({
    queryKey: ['pin', 'tracks', 'search', { keyword: debouncedKeyword, limit }],
    queryFn: () => searchTracks(debouncedKeyword, limit),
    enabled,
    staleTime: 60_000,
  });

  return {
    ...searchQuery,
    isDebouncing: normalizedKeyword.length > 0 && normalizedKeyword !== debouncedKeyword,
  };
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  deleteRecentSearchPlace,
  getRecentSearchPlaces,
  searchPlaces,
  selectSearchPlace,
} from '@/api/place';
import type { PinSearchPlace } from '@/features/pin/types';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import type { PlaceSearchHistoryRequest } from '@/types/place.type';

const placeQueryKeys = {
  all: ['pin', 'places'] as const,
  searches: () => [...placeQueryKeys.all, 'search'] as const,
  search: (keyword: string, location: PlaceSearchHistoryRequest | null) =>
    [...placeQueryKeys.searches(), { keyword, ...location }] as const,
  histories: () => [...placeQueryKeys.all, 'histories'] as const,
  history: (location: PlaceSearchHistoryRequest | null) =>
    [...placeQueryKeys.histories(), location] as const,
};

const getSearchKeywordFromQueryKey = (queryKey: readonly unknown[]) => {
  const searchParams = queryKey.at(-1);
  if (typeof searchParams !== 'object' || searchParams === null || !('keyword' in searchParams)) {
    return null;
  }

  return typeof searchParams.keyword === 'string' ? searchParams.keyword : null;
};

type UsePlaceSearchParams = {
  keyword: string;
  location: PlaceSearchHistoryRequest | null;
  enabled?: boolean;
  debounceMs?: number;
};

export function usePlaceSearch({
  keyword,
  location,
  enabled = true,
  debounceMs = 300,
}: UsePlaceSearchParams) {
  const normalizedKeyword = keyword.trim();
  const debouncedKeyword = useDebouncedValue(normalizedKeyword, debounceMs);
  const isDebounced = normalizedKeyword === debouncedKeyword;

  const query = useQuery({
    queryKey: placeQueryKeys.search(debouncedKeyword, location),
    queryFn: ({ signal }) => {
      if (!location) throw new Error('장소 검색에 현재 위치가 필요해요.');

      return searchPlaces({
        keyword: debouncedKeyword,
        latitude: location.latitude,
        longitude: location.longitude,
        signal,
      });
    },
    enabled: enabled && Boolean(location) && debouncedKeyword.length > 0 && isDebounced,
    // Keep the list stable for location-only key changes; a new keyword still starts empty.
    placeholderData: (previousData, previousQuery) =>
      getSearchKeywordFromQueryKey(previousQuery?.queryKey ?? []) === debouncedKeyword
        ? previousData
        : undefined,
    staleTime: 60_000,
  });

  return { ...query, debouncedKeyword, isDebounced };
}

export function useRecentSearchPlaces(location: PlaceSearchHistoryRequest | null, enabled = true) {
  return useQuery({
    queryKey: placeQueryKeys.history(location),
    queryFn: ({ signal }) => {
      if (!location) throw new Error('최근 검색 조회에 현재 위치가 필요해요.');

      return getRecentSearchPlaces({ ...location, signal });
    },
    enabled: enabled && Boolean(location),
    staleTime: 60_000,
  });
}

export function useDeleteRecentSearchPlace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteRecentSearchPlace,
    onSuccess: (_, historyId) => {
      queryClient.setQueriesData<PinSearchPlace[]>(
        { queryKey: placeQueryKeys.histories() },
        (places) => places?.filter((place) => place.searchHistoryId !== historyId),
      );
    },
  });
}

export function useSelectSearchPlace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: selectSearchPlace,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: placeQueryKeys.histories(),
      });
    },
  });
}

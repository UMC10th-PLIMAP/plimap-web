import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { bookmarkPlace, deletePlaceBookmark, getPlaceBookmarks, getPlaceDetail } from '@/api/place';
import type { PlaceDetailResponse } from '@/types/place.type';

const placeDetailQueryKey = (placeId: number) => ['pin', 'places', 'detail', placeId] as const;
const placeBookmarkListQueryKey = ['pin', 'places', 'bookmarks'] as const;

type UsePlaceBookmarksParams = {
  latitude: number | null;
  longitude: number | null;
  enabled?: boolean;
};

/** 현재 위치 500m 이내 저장 장소 목록 (거리순 최대 9개) */
export function usePlaceBookmarks({
  latitude,
  longitude,
  enabled = true,
}: UsePlaceBookmarksParams) {
  return useQuery({
    queryKey: [...placeBookmarkListQueryKey, { latitude, longitude }],
    queryFn: ({ signal }) => {
      if (latitude === null || longitude === null) {
        throw new Error('현재 위치 정보가 필요해요.');
      }
      return getPlaceBookmarks({ latitude, longitude, signal });
    },
    enabled: enabled && latitude !== null && longitude !== null,
    staleTime: 60_000,
  });
}

type UsePlaceDetailParams = {
  placeId: number | null;
  latitude: number;
  longitude: number;
  enabled?: boolean;
};

export function usePlaceDetail({
  placeId,
  latitude,
  longitude,
  enabled = true,
}: UsePlaceDetailParams) {
  return useQuery({
    queryKey: [...placeDetailQueryKey(placeId ?? 0), { latitude, longitude }],
    queryFn: ({ signal }) => {
      if (placeId === null) throw new Error('장소 정보가 필요해요.');
      return getPlaceDetail({ placeId, latitude, longitude, signal });
    },
    enabled: enabled && placeId !== null,
    staleTime: 60_000,
  });
}

type TogglePlaceBookmarkRequest = {
  placeId: number;
  bookmarked: boolean;
};

type TogglePlaceBookmarkContext = {
  snapshots: [readonly unknown[], PlaceDetailResponse | undefined][];
};

export function useTogglePlaceBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ placeId, bookmarked }: TogglePlaceBookmarkRequest) =>
      bookmarked ? bookmarkPlace(placeId) : deletePlaceBookmark(placeId),
    onMutate: async ({ placeId, bookmarked }): Promise<TogglePlaceBookmarkContext> => {
      const queryKey = placeDetailQueryKey(placeId);
      await queryClient.cancelQueries({ queryKey });
      const snapshots = queryClient.getQueriesData<PlaceDetailResponse>({ queryKey });

      queryClient.setQueriesData<PlaceDetailResponse>({ queryKey }, (detail) =>
        detail ? { ...detail, bookmarkedByMe: bookmarked } : detail,
      );

      return { snapshots };
    },
    onError: (_error, _request, context) => {
      context?.snapshots.forEach(([queryKey, detail]) => {
        queryClient.setQueryData(queryKey, detail);
      });
    },
    onSuccess: (result) => {
      queryClient.setQueriesData<PlaceDetailResponse>(
        { queryKey: placeDetailQueryKey(result.placeId) },
        (detail) => (detail ? { ...detail, bookmarkedByMe: result.bookmarkedByMe } : detail),
      );
    },
    onSettled: (_result, _error, request) => {
      void queryClient.invalidateQueries({ queryKey: placeDetailQueryKey(request.placeId) });
      void queryClient.invalidateQueries({ queryKey: placeBookmarkListQueryKey });
    },
  });
}

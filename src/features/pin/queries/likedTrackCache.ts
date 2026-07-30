import type { QueryClient } from '@tanstack/react-query';
import type { GetLikedTracksResponse, GetPlaceTracksResponse } from '@/features/pin/types';

type PlaceTrackQueriesSnapshot = [readonly unknown[], GetPlaceTracksResponse | undefined][];

type LikedTrackQueriesSnapshot = [readonly unknown[], GetLikedTracksResponse | undefined][];

export type LikedTrackMutationContext = {
  placeTrackQueries: PlaceTrackQueriesSnapshot;
  likedTrackQueries: LikedTrackQueriesSnapshot;
};

export async function prepareLikedTrackMutation(
  queryClient: QueryClient,
): Promise<LikedTrackMutationContext> {
  await Promise.all([
    queryClient.cancelQueries({ queryKey: ['pin', 'placeTrack'] }),
    queryClient.cancelQueries({ queryKey: ['pin', 'likeTrack'] }),
  ]);

  return {
    placeTrackQueries: queryClient.getQueriesData<GetPlaceTracksResponse>({
      queryKey: ['pin', 'placeTrack'],
    }),
    likedTrackQueries: queryClient.getQueriesData<GetLikedTracksResponse>({
      queryKey: ['pin', 'likeTrack'],
    }),
  };
}

export function rollbackLikedTrackMutation(
  queryClient: QueryClient,
  context?: LikedTrackMutationContext,
) {
  context?.placeTrackQueries.forEach(([queryKey, data]) => {
    queryClient.setQueryData(queryKey, data);
  });
  context?.likedTrackQueries.forEach(([queryKey, data]) => {
    queryClient.setQueryData(queryKey, data);
  });
}

export function setPlaceTrackLiked(queryClient: QueryClient, placeTrackId: string, liked: boolean) {
  queryClient.setQueriesData<GetPlaceTracksResponse>({ queryKey: ['pin', 'placeTrack'] }, (old) => {
    if (!old) return old;

    return {
      ...old,
      tracks: old.tracks.map((track) => {
        if (String(track.placeTrackId) !== placeTrackId) return track;
        if (track.isLiked === liked) return track;

        return {
          ...track,
          isLiked: liked,
          likeCount: liked ? track.likeCount + 1 : Math.max(0, track.likeCount - 1),
        };
      }),
    };
  });
}

export function removeLikedTrackFromList(queryClient: QueryClient, placeTrackId: string) {
  queryClient.setQueriesData<GetLikedTracksResponse>({ queryKey: ['pin', 'likeTrack'] }, (old) => {
    if (!old) return old;

    return {
      ...old,
      tracks: old.tracks.filter((track) => String(track.placeTrackId) !== placeTrackId),
    };
  });
}

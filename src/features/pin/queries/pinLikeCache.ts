import type { InfiniteData, QueryClient } from '@tanstack/react-query';
import type { GetPlaceTrackPinsResponse } from '@/features/pin/types';

type PlaceTrackPinsSnapshot = [
  readonly unknown[],
  InfiniteData<GetPlaceTrackPinsResponse> | undefined,
][];

export type PinLikeMutationContext = {
  placeTrackPinsQueries: PlaceTrackPinsSnapshot;
};

export async function preparePinLikeMutation(
  queryClient: QueryClient,
): Promise<PinLikeMutationContext> {
  await queryClient.cancelQueries({ queryKey: ['pin', 'placeTrackPins'] });

  return {
    placeTrackPinsQueries: queryClient.getQueriesData<InfiniteData<GetPlaceTrackPinsResponse>>({
      queryKey: ['pin', 'placeTrackPins'],
    }),
  };
}

export function rollbackPinLikeMutation(
  queryClient: QueryClient,
  context?: PinLikeMutationContext,
) {
  context?.placeTrackPinsQueries.forEach(([queryKey, data]) => {
    queryClient.setQueryData(queryKey, data);
  });
}

export function setPinLiked(queryClient: QueryClient, pinId: string, liked: boolean) {
  queryClient.setQueriesData<InfiniteData<GetPlaceTrackPinsResponse>>(
    { queryKey: ['pin', 'placeTrackPins'] },
    (old) => {
      if (!old) return old;

      return {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          data: page.data.map((pin) => {
            if (String(pin.pinId) !== pinId) return pin;
            if (pin.userLike === liked) return pin;

            return {
              ...pin,
              userLike: liked,
              likeCount: liked ? pin.likeCount + 1 : Math.max(0, pin.likeCount - 1),
            };
          }),
        })),
      };
    },
  );
}

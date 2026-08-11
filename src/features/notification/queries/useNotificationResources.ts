import { useQueries } from '@tanstack/react-query';

import { getOtherMemberProfile } from '@/api/member';
import { getPinDetail } from '@/api/pin';
import type { Notification } from '@/features/notification/types';
import { memberQueryKeys } from '@/features/profile/queries/memberQueryKeys';

const MEMBER_PROFILE_STALE_TIME = 60_000;

export function useNotificationResources(notifications: Notification[]) {
  const likedPinIds = [
    ...new Set(
      notifications.flatMap((notification) =>
        notification.type === 'PIN_LIKED' && notification.pinId !== null
          ? [notification.pinId]
          : [],
      ),
    ),
  ];
  const followActorIds = [
    ...new Set(
      notifications.flatMap((notification) =>
        notification.type === 'FOLLOW' ? [notification.actorId] : [],
      ),
    ),
  ];

  const pinDetailQueries = useQueries({
    queries: likedPinIds.map((pinId) => ({
      queryKey: ['pin', 'detail', String(pinId)],
      queryFn: () => getPinDetail(String(pinId)),
    })),
  });
  const actorProfileQueries = useQueries({
    queries: followActorIds.map((actorId) => ({
      queryKey: memberQueryKeys.profile(actorId),
      queryFn: () => getOtherMemberProfile(actorId),
      staleTime: MEMBER_PROFILE_STALE_TIME,
    })),
  });

  return {
    pinAlbumImageById: new Map(
      likedPinIds.map((pinId, index) => [
        pinId,
        pinDetailQueries[index]?.data?.albumImageUrl ?? null,
      ]),
    ),
    followRelationByActorId: new Map(
      followActorIds.map((actorId, index) => {
        const query = actorProfileQueries[index];

        return [
          actorId,
          {
            relation: query?.data
              ? {
                  isFollowing: query.data.isFollowing,
                  isFollowingViewer: query.data.isFollowingViewer,
                }
              : undefined,
            isPending: !query?.data && (query?.isPending || query?.isFetching),
            isError: query?.isError ?? false,
            retry: () => void query?.refetch(),
          },
        ];
      }),
    ),
  };
}

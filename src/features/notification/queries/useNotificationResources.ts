import { useQueries } from '@tanstack/react-query';

import { getOtherMemberProfile } from '@/api/member';
import { getPinDetail } from '@/api/pin';
import type { Notification } from '@/features/notification/types';
import { memberQueryKeys } from '@/features/profile/queries/memberQueryKeys';

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
    })),
  });

  return {
    pinAlbumImageById: new Map(
      likedPinIds.map((pinId, index) => [
        pinId,
        pinDetailQueries[index]?.data?.albumImageUrl ?? null,
      ]),
    ),
    isFollowingByActorId: new Map(
      followActorIds.flatMap((actorId, index) => {
        const isFollowing = actorProfileQueries[index]?.data?.isFollowing;
        return isFollowing === undefined ? [] : [[actorId, isFollowing]];
      }),
    ),
  };
}

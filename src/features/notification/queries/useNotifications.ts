import { useEffect } from 'react';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getOtherMemberProfile, followMember } from '@/api/member';
import { getNotifications, subscribeToNotifications } from '@/api/notification';
import type { MemberProfileResponse } from '@/types/member.type';

const NOTIFICATIONS_QUERY_KEY = ['notification', 'infinite'] as const;

type UseInfiniteNotificationsParams = {
  pageSize?: number;
};

export function useInfiniteNotifications({ pageSize = 10 }: UseInfiniteNotificationsParams = {}) {
  return useInfiniteQuery({
    queryKey: [...NOTIFICATIONS_QUERY_KEY, { pageSize }],
    queryFn: ({ pageParam }) => getNotifications({ cursor: pageParam, pageSize }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? (lastPage.nextCursor ?? undefined) : undefined,
  });
}

export function useNotificationSubscription() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const eventSource = subscribeToNotifications(() => {
      void queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
    });

    return () => eventSource.close();
  }, [queryClient]);
}

export function useActorProfile(actorId: number, enabled: boolean) {
  return useQuery({
    queryKey: ['member', 'profile', actorId],
    queryFn: () => getOtherMemberProfile(actorId),
    enabled,
    staleTime: 60_000,
  });
}

export function useFollowBackNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: followMember,
    onSuccess: (_, actorId) => {
      queryClient.setQueryData<MemberProfileResponse>(['member', 'profile', actorId], (profile) =>
        profile ? { ...profile, isFollowing: true } : profile,
      );
      void queryClient.invalidateQueries({ queryKey: ['member', 'profile', actorId] });
    },
  });
}

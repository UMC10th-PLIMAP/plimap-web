import { useEffect, useState } from 'react';
import {
  useInfiniteQuery,
  useQueryClient,
  type InfiniteData,
  type QueryClient,
} from '@tanstack/react-query';

import { getNotifications, subscribeToNotifications } from '@/api/notification';
import type { NotificationPage } from '@/features/notification/types';

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
  const [isDisconnected, setIsDisconnected] = useState(false);

  useEffect(() => {
    const eventSource = subscribeToNotifications({
      onNotification: () => {
        void queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      },
      onOpen: () => setIsDisconnected(false),
      onTerminalError: () => {
        setIsDisconnected(true);
        void queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      },
    });

    return () => eventSource.close();
  }, [queryClient]);

  return isDisconnected;
}

export function updateNotificationFollowState(
  queryClient: QueryClient,
  actorId: number,
  isFollowing: boolean,
) {
  queryClient.setQueriesData<InfiniteData<NotificationPage>>(
    { queryKey: NOTIFICATIONS_QUERY_KEY },
    (current) => {
      if (!current) return current;

      return {
        ...current,
        pages: current.pages.map((page) => ({
          ...page,
          data: page.data.map((notification) =>
            notification.actorId === actorId ? { ...notification, isFollowing } : notification,
          ),
        })),
      };
    },
  );
}

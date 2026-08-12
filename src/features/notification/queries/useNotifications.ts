import { useEffect, useState } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';

import { getNotifications, subscribeToNotifications } from '@/api/notification';

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

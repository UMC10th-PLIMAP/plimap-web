import {
  type InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import { MOCK_FOLLOW_NOTIFICATIONS } from '@/features/notification/constants/mockNotifications';
import type { FollowNotificationsPage } from '@/features/notification/types';

const FOLLOW_NOTIFICATIONS_QUERY_KEY = ['notification', 'follow', 'infinite'] as const;

type GetFollowNotificationsParams = {
  cursor?: string;
  pageSize: number;
};

function getFollowNotifications({ cursor, pageSize }: GetFollowNotificationsParams) {
  const startIndex = cursor ? Number(cursor) : 0;
  const data = MOCK_FOLLOW_NOTIFICATIONS.slice(startIndex, startIndex + pageSize).map(
    (notification) => ({ ...notification }),
  );
  const nextIndex = startIndex + data.length;
  const hasNext = nextIndex < MOCK_FOLLOW_NOTIFICATIONS.length;

  return Promise.resolve({
    data,
    nextCursor: hasNext ? String(nextIndex) : undefined,
    hasNext,
    pageSize,
  } satisfies FollowNotificationsPage);
}

function followBack(notificationId: string) {
  return Promise.resolve(notificationId);
}

type UseInfiniteFollowNotificationsParams = {
  pageSize?: number;
};

export function useInfiniteFollowNotifications({
  pageSize = 10,
}: UseInfiniteFollowNotificationsParams = {}) {
  return useInfiniteQuery({
    queryKey: [...FOLLOW_NOTIFICATIONS_QUERY_KEY, { pageSize }],
    queryFn: ({ pageParam }) => getFollowNotifications({ cursor: pageParam, pageSize }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.nextCursor : undefined),
  });
}

export function useFollowBackNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: followBack,
    onSuccess: (notificationId) => {
      queryClient.setQueriesData<InfiniteData<FollowNotificationsPage>>(
        { queryKey: FOLLOW_NOTIFICATIONS_QUERY_KEY },
        (notifications) =>
          notifications
            ? {
                ...notifications,
                pages: notifications.pages.map((page) => ({
                  ...page,
                  data: page.data.map((notification) =>
                    notification.id === notificationId
                      ? { ...notification, relation: 'following' }
                      : notification,
                  ),
                })),
              }
            : notifications,
      );
    },
  });
}

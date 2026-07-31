import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { TopBar } from '@/components/ui/TopBar';
import { FollowNotificationRow } from '@/features/notification/components/FollowNotificationRow';
import {
  useFollowBackNotification,
  useInfiniteFollowNotifications,
} from '@/features/notification/queries/useFollowNotifications';

export default function MyNotificationsPage() {
  const navigate = useNavigate();
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteFollowNotifications();
  const followBackMutation = useFollowBackNotification();
  const notifications = data?.pages.flatMap((page) => page.data) ?? [];

  useEffect(() => {
    const loadMoreElement = loadMoreRef.current;
    if (!loadMoreElement || !hasNextPage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { rootMargin: '120px' },
    );

    observer.observe(loadMoreElement);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <div className="flex min-h-full flex-col">
      <TopBar onBack={() => navigate(-1)} title="내 소식" titleWeight="medium" />

      <main className="px-4 pt-4">
        <ul className="flex flex-col gap-7">
          {notifications.map((notification) => (
            <FollowNotificationRow
              key={notification.id}
              notification={notification}
              onFollowBack={(notificationId) => followBackMutation.mutate(notificationId)}
            />
          ))}
        </ul>
        <div ref={loadMoreRef} className="h-px" aria-hidden />
      </main>
    </div>
  );
}

import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { TopBar } from '@/components/ui/TopBar';
import { NotificationRow } from '@/features/notification/components/NotificationRow';
import {
  useFollowBackNotification,
  useInfiniteNotifications,
  useNotificationSubscription,
} from '@/features/notification/queries/useNotifications';

export default function MyNotificationsPage() {
  const navigate = useNavigate();
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending, isError, refetch } =
    useInfiniteNotifications();
  const followBackMutation = useFollowBackNotification();
  const notifications = data?.pages.flatMap((page) => page.data) ?? [];

  useNotificationSubscription();

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
        {isPending && <p className="body-15-r text-center text-grayscale-500">불러오는 중...</p>}

        {isError && (
          <div className="flex flex-col items-center gap-3 py-10">
            <p className="body-15-r text-grayscale-500">내 소식을 불러오지 못했어요.</p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="body-15-m cursor-pointer text-neon-2"
            >
              다시 시도
            </button>
          </div>
        )}

        {!isPending && !isError && notifications.length === 0 && (
          <p className="body-15-r py-10 text-center text-grayscale-500">
            아직 새로운 소식이 없어요.
          </p>
        )}

        <ul className="flex flex-col gap-7">
          {notifications.map((notification) => (
            <NotificationRow
              key={notification.notificationId}
              notification={notification}
              isFollowPending={
                followBackMutation.isPending &&
                followBackMutation.variables === notification.actorId
              }
              onFollowBack={(actorId) => followBackMutation.mutate(actorId)}
              onOpenPin={(pinId) => navigate(`/app/pins/${pinId}`)}
            />
          ))}
        </ul>
        <div ref={loadMoreRef} className="h-px" aria-hidden />
        {isFetchingNextPage && (
          <p className="body-15-r py-4 text-center text-grayscale-500">불러오는 중...</p>
        )}
      </main>
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ApiError } from '@/api/client';
import { RequestErrorScreen } from '@/components/ui/RequestErrorScreen';
import { TopBar } from '@/components/ui/TopBar';
import { NotificationRow } from '@/features/notification/components/NotificationRow';
import { NotificationRowSkeleton } from '@/features/notification/components/NotificationRowSkeleton';
import {
  useInfiniteNotifications,
  useNotificationSubscription,
} from '@/features/notification/queries/useNotifications';
import { useOpenPinPlaceOnMap } from '@/features/pin/hooks/useOpenPinPlaceOnMap';
import { useToggleFollow } from '@/features/profile/queries/useToggleFollow';
import { useToast } from '@/hooks/useToast';

const INITIAL_SKELETON_COUNT = 3;
const FOLLOW_BACK_FAILED_MESSAGE = '맞팔로우하지 못했어요. 다시 시도해주세요.';

export default function MyNotificationsPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { openPinPlaceOnMap } = useOpenPinPlaceOnMap();
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [pendingMemberIds, setPendingMemberIds] = useState<Set<number>>(new Set());
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
    isPending,
    isError,
    refetch,
  } = useInfiniteNotifications();
  const followBackMutation = useToggleFollow();
  const notifications = data?.pages.flatMap((page) => page.data) ?? [];

  const isNotificationStreamDisconnected = useNotificationSubscription();

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

  const requestError = !data && isError ? error : null;

  const handleFollowBack = async (actorId: number) => {
    setPendingMemberIds((current) => new Set(current).add(actorId));

    try {
      await followBackMutation.mutateAsync({ memberId: actorId, isFollowing: false });
      void refetch();
    } catch (mutationError) {
      toast.error(
        mutationError instanceof ApiError ? mutationError.message : FOLLOW_BACK_FAILED_MESSAGE,
      );
    } finally {
      setPendingMemberIds((current) => {
        const next = new Set(current);
        next.delete(actorId);
        return next;
      });
    }
  };

  if (requestError) {
    return <RequestErrorScreen error={requestError} onRetry={() => void refetch()} />;
  }

  return (
    <div className="flex min-h-full flex-col pt-[env(safe-area-inset-top)]">
      <TopBar onBack={() => navigate(-1)} title="내 소식" titleWeight="medium" />

      <main className="flex flex-1 flex-col px-4 pt-4">
        {isNotificationStreamDisconnected && (
          <div className="mb-4 rounded-xl bg-pli-black-75 px-4 py-3" role="status">
            <p className="body-15-r text-grayscale-300">
              실시간 알림 연결이 끊어졌어요. 새로고침하면 최신 소식을 확인할 수 있어요.
            </p>
          </div>
        )}

        {isPending && (
          <span className="sr-only" role="status">
            내 소식을 불러오는 중
          </span>
        )}

        {!isPending && !isError && notifications.length === 0 && (
          <div className="flex flex-1 items-center justify-center text-center">
            <div className="flex flex-col items-center gap-0.5">
              <p className="body-17-m text-grayscale-300">아직 새로운 소식이 없어요.</p>
              <p className="body-15-m text-grayscale-700">새로운 알림이 오면 여기에 표시돼요.</p>
            </div>
          </div>
        )}

        <ul className="flex flex-col gap-7" aria-busy={isPending || isFetchingNextPage}>
          {isPending &&
            Array.from({ length: INITIAL_SKELETON_COUNT }, (_, index) => (
              <NotificationRowSkeleton key={index} />
            ))}

          {notifications.map((notification) => (
            <NotificationRow
              key={notification.notificationId}
              notification={notification}
              isFollowPending={pendingMemberIds.has(notification.actorId)}
              onFollowBack={(actorId) => void handleFollowBack(actorId)}
              onOpenProfile={(actorId) => navigate(`/app/users/${actorId}`)}
              onOpenPin={(pinId) => {
                void openPinPlaceOnMap({
                  pinId,
                  isMine: notification.type === 'PIN_LIKED',
                  requestFeedPlaceAccess: notification.type === 'PIN_CREATED',
                });
              }}
            />
          ))}

          {isFetchingNextPage && <NotificationRowSkeleton />}
        </ul>
        <div ref={loadMoreRef} className="h-px" aria-hidden />
        {isFetchingNextPage && (
          <span className="sr-only" role="status">
            추가 소식을 불러오는 중
          </span>
        )}
        {isFetchNextPageError && (
          <button
            type="button"
            onClick={() => void fetchNextPage()}
            className="py-4 body-15-m cursor-pointer text-grayscale-300 underline"
          >
            더 불러오기 다시 시도
          </button>
        )}
      </main>
    </div>
  );
}

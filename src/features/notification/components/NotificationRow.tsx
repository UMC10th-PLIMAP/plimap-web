import UserPlaceholderIcon from '@/assets/icons/user-placeholder.svg?react';
import type { Notification } from '@/features/notification/types';
import { getFollowActionLabel } from '@/features/profile/utils/getFollowActionLabel';
import { cn } from '@/lib/utils';

const NOTIFICATION_MESSAGE: Record<Notification['type'], string> = {
  FOLLOW: '님이 나를 팔로우하기 시작했어요.',
  PIN_CREATED: '님이 새로운 핀을 등록했어요.',
  PIN_LIKED: '님이 나의 핀에 좋아요를 눌렀어요.',
};

type NotificationRowProps = {
  notification: Notification;
  pinAlbumImageUrl: string | null;
  isFollowing?: boolean;
  isFollowPending: boolean;
  onFollowBack: (actorId: number) => void;
  onOpenPin: (pinId: number) => void;
};

function formatCreatedAt(createdAt: string) {
  const createdAtTimestamp = Date.parse(createdAt);
  if (Number.isNaN(createdAtTimestamp)) return null;

  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - createdAtTimestamp) / 1_000));

  if (elapsedSeconds < 60) return '방금';
  if (elapsedSeconds < 3_600) return `${Math.floor(elapsedSeconds / 60)}분전`;
  if (elapsedSeconds < 86_400) return `${Math.floor(elapsedSeconds / 3_600)}시간전`;
  if (elapsedSeconds < 604_800) return `${Math.floor(elapsedSeconds / 86_400)}일전`;
  if (elapsedSeconds < 1_209_600) return '일주일전';

  return new Intl.DateTimeFormat('ko-KR', { month: 'numeric', day: 'numeric' }).format(
    new Date(createdAtTimestamp),
  );
}

function ProfileImage({ notification }: { notification: Notification }) {
  if (!notification.actorProfileImageUrl) {
    return (
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-pli-black-50 text-grayscale-600">
        <UserPlaceholderIcon className="size-7" aria-hidden />
      </span>
    );
  }

  return (
    <img
      src={notification.actorProfileImageUrl}
      alt={`${notification.actorNickname} 프로필`}
      className="size-10 shrink-0 rounded-full object-cover"
    />
  );
}

function NotificationMessage({ notification }: { notification: Notification }) {
  return (
    <>
      <span className="font-semibold text-grayscale-100">{notification.actorNickname}</span>
      {NOTIFICATION_MESSAGE[notification.type]}
    </>
  );
}

function PinThumbnail({ imageUrl }: { imageUrl: string | null }) {
  return imageUrl ? (
    <img src={imageUrl} alt="" className="size-[59px] shrink-0 rounded-lg object-cover" />
  ) : (
    <span aria-hidden className="size-[59px] shrink-0 rounded-lg bg-pli-black-75" />
  );
}

export function NotificationRow({
  notification,
  pinAlbumImageUrl,
  isFollowing,
  isFollowPending,
  onFollowBack,
  onOpenPin,
}: NotificationRowProps) {
  const isFollowNotification = notification.type === 'FOLLOW';
  const canOpenPin = notification.pinId !== null && !isFollowNotification;
  const createdAtLabel = formatCreatedAt(notification.createdAt);
  const notificationContent = (
    <>
      <NotificationMessage notification={notification} />{' '}
      {createdAtLabel && <span className="etc-12-r text-grayscale-600">{createdAtLabel}</span>}
    </>
  );

  return (
    <li className="flex items-center gap-2.5">
      <ProfileImage notification={notification} />

      {canOpenPin ? (
        <button
          type="button"
          onClick={() => notification.pinId !== null && onOpenPin(notification.pinId)}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 text-left"
        >
          <span className="body-15-r min-w-0 flex-1 break-words text-grayscale-200">
            {notificationContent}
          </span>
          <PinThumbnail imageUrl={pinAlbumImageUrl} />
        </button>
      ) : (
        <div className="body-15-r min-w-0 flex-1 break-words text-left text-grayscale-200">
          {notificationContent}
        </div>
      )}

      {isFollowNotification && (
        <button
          type="button"
          disabled={isFollowing === undefined || isFollowing || isFollowPending}
          onClick={() => onFollowBack(notification.actorId)}
          className={cn(
            'etc-13-sb flex h-8 w-[102px] shrink-0 items-center justify-center rounded-lg transition-colors',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neon-2',
            isFollowing
              ? 'cursor-default bg-pli-black-50 text-grayscale-100'
              : 'cursor-pointer bg-neon-2 text-grayscale-1200 hover:bg-neon',
            (isFollowing === undefined || isFollowPending) && 'cursor-wait opacity-60',
          )}
        >
          {getFollowActionLabel({
            isFollowing: isFollowing ?? false,
            isFollowingViewer: true,
          })}
        </button>
      )}
    </li>
  );
}

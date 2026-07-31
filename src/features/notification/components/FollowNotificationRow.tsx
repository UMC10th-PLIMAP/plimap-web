import { cn } from '@/lib/utils';
import type { FollowNotification } from '@/features/notification/types';

type FollowNotificationRowProps = {
  notification: FollowNotification;
  onFollowBack: (notificationId: string) => void;
};

export function FollowNotificationRow({ notification, onFollowBack }: FollowNotificationRowProps) {
  const isFollowing = notification.relation === 'following';

  return (
    <li className="flex items-center gap-2.5">
      <img
        src={notification.actorProfileImageUrl}
        alt={`${notification.actorNickname} 프로필`}
        className="size-10 shrink-0 rounded-full object-cover"
      />

      <p className="body-15-r min-w-0 flex-1 text-grayscale-200">
        <span className="font-semibold text-grayscale-100">{notification.actorNickname}</span>
        님이 나를 팔로우하기 시작했어요.{' '}
        <span className="etc-12-r text-grayscale-600">{notification.createdAtLabel}</span>
      </p>

      <button
        type="button"
        disabled={isFollowing}
        onClick={() => onFollowBack(notification.id)}
        className={cn(
          'etc-13-sb flex h-8 w-[102px] shrink-0 items-center justify-center rounded-lg transition-colors',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neon-2',
          isFollowing
            ? 'cursor-default bg-pli-black-50 text-grayscale-100'
            : 'cursor-pointer bg-neon-2 text-grayscale-1200 hover:bg-neon',
        )}
      >
        {isFollowing ? '팔로잉' : '맞팔로우'}
      </button>
    </li>
  );
}

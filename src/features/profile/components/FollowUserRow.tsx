import UserPlaceholderIcon from '@/assets/icons/user-placeholder.svg?react';
import type { FollowListItem } from '@/types/member.type';

type FollowUserRowProps = {
  user: FollowListItem;
  onActionClick?: (user: FollowListItem) => void;
};

export function FollowUserRow({ user, onActionClick }: FollowUserRowProps) {
  return (
    <li className="flex items-center gap-[14px] ">
      <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-pli-black-75">
        <UserPlaceholderIcon className="size-6 text-pli-black-50" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate body-15-m text-grayscale-100">{user.nickname}</p>
        <p className="truncate body-15-r text-grayscale-500">{user.name}</p>
      </div>

      <button
        type="button"
        onClick={() => onActionClick?.(user)}
        className={`flex h-8 min-w-[102px] items-center justify-center rounded-lg etc-13-sb cursor-pointer ${
          user.isFollowing ? 'bg-pli-black-50 text-grayscale-100' : 'bg-neon-2 text-grayscale-1200'
        }`}
      >
        {user.isFollowing ? '팔로잉' : '맞팔로우'}
      </button>
    </li>
  );
}

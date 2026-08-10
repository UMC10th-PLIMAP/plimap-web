import UserPlaceholderIcon from '@/assets/icons/user-placeholder.svg?react';
import { getFollowActionLabel } from '@/features/profile/utils/getFollowActionLabel';
import type { FollowListItem } from '@/types/member.type';

type FollowUserRowProps = {
  user: FollowListItem;
  onClick?: (user: FollowListItem) => void;
  onActionClick?: (user: FollowListItem) => void;
  disabled?: boolean;
};

export function FollowUserRow({ user, onClick, onActionClick, disabled }: FollowUserRowProps) {
  return (
    <li className="flex items-center gap-[14px]">
      <button
        type="button"
        onClick={() => onClick?.(user)}
        className="flex min-w-0 flex-1 items-center gap-[14px] text-left cursor-pointer"
      >
        <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-pli-black-75">
          {user.profileImageUrl ? (
            <img
              src={user.profileImageUrl}
              alt="프로필 이미지"
              className="size-full object-cover"
            />
          ) : (
            <UserPlaceholderIcon className="size-6 text-pli-black-50" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate body-15-m text-grayscale-100">{user.nickname}</p>
          <p className="truncate body-15-r text-grayscale-500">{user.name}</p>
        </div>
      </button>

      <button
        type="button"
        onClick={() => onActionClick?.(user)}
        disabled={disabled}
        className={`flex h-8 min-w-[102px] shrink-0 items-center justify-center rounded-lg etc-13-sb cursor-pointer disabled:opacity-50 ${
          user.isFollowing ? 'bg-pli-black-50 text-grayscale-100' : 'bg-neon-2 text-grayscale-1200'
        }`}
      >
        {getFollowActionLabel(user)}
      </button>
    </li>
  );
}

import type { FollowTab, FollowUser } from '@/features/profile/types';

type FollowUserRowProps = {
  user: FollowUser;
  onActionClick?: (user: FollowUser) => void;
};

const RELATION_LABEL: Record<FollowTab, string> = {
  following: '팔로잉',
  follower: '팔로워',
  friend: '친구',
};

export function FollowUserRow({ user, onActionClick }: FollowUserRowProps) {
  return (
    <li className="flex items-center gap-[14px] ">
      <img src={user.avatarUrl} alt={user.name} className="size-12 rounded-full object-cover" />

      <div className="min-w-0 flex-1">
        <p className="truncate body-15-m text-grayscale-100">{user.nickname}</p>
        <p className="truncate body-15-r text-grayscale-500">{user.name}</p>
      </div>

      <button
        type="button"
        onClick={() => onActionClick?.(user)}
        className="flex h-8 min-w-[102px] items-center justify-center rounded-lg etc-13-sb cursor-pointer bg-pli-black-50 text-grayscale-100"
      >
        {RELATION_LABEL[user.relation]}
      </button>
    </li>
  );
}

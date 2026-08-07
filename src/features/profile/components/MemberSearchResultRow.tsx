import UserPlaceholderIcon from '@/assets/icons/user-placeholder.svg?react';
import type { MemberSearchItem } from '@/types/member.type';

type MemberSearchResultRowProps = {
  member: MemberSearchItem;
  onOpenProfile: (member: MemberSearchItem) => void;
  onToggleFollow: (member: MemberSearchItem) => void;
  isFollowPending?: boolean;
};

export function MemberSearchResultRow({
  member,
  onOpenProfile,
  onToggleFollow,
  isFollowPending = false,
}: MemberSearchResultRowProps) {
  return (
    <li className="flex min-w-0 items-center justify-between gap-4">
      <button
        type="button"
        onClick={() => onOpenProfile(member)}
        className="flex min-w-0 flex-1 items-center gap-[14px] text-left cursor-pointer"
      >
        <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-pli-black-75">
          {member.profileImageUrl ? (
            <img src={member.profileImageUrl} alt="" className="size-full object-cover" />
          ) : (
            <UserPlaceholderIcon aria-hidden className="size-6 text-pli-black-50" />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate body-15-m text-grayscale-100">{member.nickname}</span>
          {member.name ? (
            <span className="mt-1 block truncate etc-13-r text-grayscale-500">{member.name}</span>
          ) : null}
        </span>
      </button>

      <button
        type="button"
        onClick={() => onToggleFollow(member)}
        disabled={isFollowPending}
        aria-label={`${member.nickname} ${member.isFollowing ? '팔로우 취소' : '팔로우'}`}
        className={`flex h-8 min-w-[102px] shrink-0 items-center justify-center rounded-lg etc-13-sb cursor-pointer disabled:opacity-50 ${
          member.isFollowing
            ? 'bg-pli-black-50 text-grayscale-100'
            : 'bg-neon-2 text-grayscale-1200'
        }`}
      >
        {member.isFollowing ? '팔로잉' : '팔로우'}
      </button>
    </li>
  );
}

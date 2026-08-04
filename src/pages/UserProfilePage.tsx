import { useNavigate, useParams } from 'react-router-dom';

import BackIcon from '@/assets/icons/back.svg?react';
import MoreIcon from '@/assets/icons/more.svg?react';

import { ProfileActions } from '@/features/profile/components/ProfileActions';
import { ProfileInfo } from '@/features/profile/components/ProfileInfo';
import { ProfilePinGrid } from '@/features/profile/components/ProfilePinGrid';
import { useFollowMember } from '@/hooks/useFollowMember';
import { useOtherMemberProfile } from '@/hooks/useOtherMemberProfile';

export default function UserProfilePage() {
  const navigate = useNavigate();
  const { memberId } = useParams<{ memberId: string }>();
  const id = Number(memberId);

  const { data: member } = useOtherMemberProfile(memberId);
  const followMutation = useFollowMember(id);

  const profile = member
    ? {
        nickname: member.nickname,
        name: member.name ?? undefined,
        bio: member.introduction ?? undefined,
        avatarUrl: member.profileImageObjectKey ?? '',
        followingCount: member.followingCount,
        followerCount: member.followerCount,
        postCount: 0,
      }
    : null;

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: profile?.nickname, url });
      return;
    }
    await navigator.clipboard.writeText(url);
  };

  return (
    <div className="flex flex-col pb-[env(safe-area-inset-bottom)]">
      <header className="grid h-[60px] grid-cols-[24px_1fr_24px] items-center px-4">
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={() => navigate(-1)}
          className="flex size-6 items-center text-grayscale-100 cursor-pointer"
        >
          <BackIcon className="size-6" />
        </button>
        <h1 className="text-center head-24-sb text-grayscale-100 truncate">
          {profile?.nickname ?? ''}
        </h1>
        <button
          type="button"
          aria-label="더보기"
          className="flex size-6 items-center justify-end text-grayscale-100 cursor-pointer"
        >
          <MoreIcon className="size-6" />
        </button>
      </header>

      {profile && (
        <div className="mt-[3px] flex flex-col">
          <ProfileInfo profile={profile} />
          <ProfileActions
            actions={[
              {
                label: member?.isFollowing ? '팔로잉' : '팔로우',
                onClick: () => {
                  if (member?.isFollowing || followMutation.isPending) return;
                  followMutation.mutate();
                },
                className: member?.isFollowing
                  ? undefined
                  : 'bg-neon-2 text-grayscale-1200 body-15-m',
              },
              {
                label: '프로필 공유',
                onClick: () => {
                  void handleShare();
                },
              },
            ]}
          />
        </div>
      )}

      <div className="mt-4 mb-4 h-[1px] bg-pli-black-50" />
      <ProfilePinGrid pins={[]} />
    </div>
  );
}

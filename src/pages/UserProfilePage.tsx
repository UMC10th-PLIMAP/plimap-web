import { useNavigate, useParams } from 'react-router-dom';

import BackIcon from '@/assets/icons/back.svg?react';
import MoreIcon from '@/assets/icons/more.svg?react';

import { ProfileActions } from '@/features/profile/components/ProfileActions';
import { ProfileInfo } from '@/features/profile/components/ProfileInfo';
import { ProfilePinGrid } from '@/features/profile/components/ProfilePinGrid';
import { useInfiniteOtherMemberFeed } from '@/features/pin/queries/useOtherMemberFeed';
import { useFollowMember } from '@/hooks/useFollowMember';
import { useOtherMemberProfile } from '@/hooks/useOtherMemberProfile';

export default function UserProfilePage() {
  const navigate = useNavigate();
  const { memberId } = useParams<{ memberId: string }>();
  const id = Number(memberId);

  const { data: member } = useOtherMemberProfile(memberId);
  const { data: feedPages } = useInfiniteOtherMemberFeed({
    memberId: Number.isFinite(id) && id > 0 ? id : undefined,
  });
  const followMutation = useFollowMember(id);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: member?.nickname, url });
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
          {member?.nickname ?? ''}
        </h1>
        <button
          type="button"
          aria-label="더보기"
          className="flex size-6 items-center justify-end text-grayscale-100 cursor-pointer"
        >
          <MoreIcon className="size-6" />
        </button>
      </header>

      {member && (
        <div className="mt-[3px] flex flex-col">
          <ProfileInfo
            profile={{
              name: member.name,
              introduction: member.introduction,
              profileImageUrl: member.profileImageUrl,
              followerCount: member.followerCount,
              followingCount: member.followingCount,
            }}
          />
          <ProfileActions
            actions={[
              {
                label: member.isFollowing ? '팔로잉' : '팔로우',
                onClick: () => {
                  if (member.isFollowing || followMutation.isPending) return;
                  followMutation.mutate();
                },
                className: member.isFollowing
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
      <ProfilePinGrid pins={feedPages?.pages.flatMap((page) => page.data) ?? []} />
    </div>
  );
}

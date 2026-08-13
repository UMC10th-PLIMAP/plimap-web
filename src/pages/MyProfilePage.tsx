import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SettingsIcon from '@/assets/icons/settings.svg?react';
import ShareIcon from '@/assets/icons/share.svg?react';

import { ProfileSkeleton } from '@/components/skeletons/ProfileSkeleton';
import { useToast } from '@/hooks/useToast';
import { ProfileActions } from '@/features/profile/components/ProfileActions';
import { ProfileInfo } from '@/features/profile/components/ProfileInfo';
import { ProfilePinGrid } from '@/features/profile/components/ProfilePinGrid';
import { ProfileShareDialog } from '@/features/profile/components/ProfileShareDialog';

import { useOpenPinPlaceOnMap } from '@/features/pin/hooks/useOpenPinPlaceOnMap';
import { useInfiniteMemberMe } from '@/features/pin/queries/useMemberMe';
import { useMyProfile } from '@/hooks/useMyProfile';
import { cn } from '@/lib/utils';

const MY_PROFILE_STALE_TIME = 60 * 1000;

export default function MyProfilePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { data: myProfile } = useMyProfile({ staleTime: MY_PROFILE_STALE_TIME });
  const { openPinPlaceOnMap } = useOpenPinPlaceOnMap({
    errorToastPlacement: 'above-navigation',
  });
  const {
    data: memberMePages,
    isPending: isMemberMePending,
    isError: isMemberMeError,
    refetch: refetchMemberMe,
  } = useInfiniteMemberMe();
  const [isShareOpen, setIsShareOpen] = useState(false);

  // 실제로는 AuthGuard에서 캐시가 저장되기 때문에 myProfile이 undefined인 경우가 거의 없음
  // 하지만 혹시 모르니 skeleton을 띄워줌
  if (!myProfile) return <ProfileSkeleton />;

  const nickname = myProfile.nickname?.trim() ?? '';
  const canShareProfile = nickname.length > 0;

  return (
    <>
      <div className="relative flex flex-col pt-[env(safe-area-inset-top)] pb-[calc(env(safe-area-inset-bottom)+108px)]">
        <header className="grid h-[60px] grid-cols-[24px_1fr_24px] items-center px-4">
          <div />
          <h1 className="text-center head-24-sb text-grayscale-100">{myProfile.nickname}</h1>
          <button
            type="button"
            aria-label="설정"
            onClick={() => navigate('/app/settings')}
            className="flex size-6 items-center text-grayscale-100 cursor-pointer"
          >
            <SettingsIcon className="size-6" />
          </button>
        </header>

        <div className="mt-[3px] flex flex-col ">
          <ProfileInfo
            profile={myProfile}
            onFollowingClick={() => navigate('/app/my/following')}
            onFollowerClick={() => navigate('/app/my/followers')}
          />
          <ProfileActions
            actions={[
              {
                label: '프로필 편집',
                onClick: () => navigate('/app/my/edit'),
              },
              {
                label: '내 PLIMAP',
                onClick: () => navigate('/app/my/plimap'),
              },
              {
                label: <ShareIcon />,
                onClick: () => {
                  if (!canShareProfile) return;
                  setIsShareOpen(true);
                },
                'aria-label': '프로필 공유',
                className: cn(
                  'max-w-9 max-h-9 shrink-0',
                  !canShareProfile && 'cursor-not-allowed opacity-40',
                ),
              },
            ]}
          />
        </div>
        <div className="mt-4 mb-4 h-[1px] bg-pli-black-50" />
        <ProfilePinGrid
          pins={memberMePages?.pages.flatMap((page) => page.data) ?? []}
          isPending={isMemberMePending}
          isError={isMemberMeError}
          onRetry={() => {
            void refetchMemberMe();
          }}
          onPinClick={(pin) => {
            void openPinPlaceOnMap({
              pinId: pin.pinId,
              placeTrackId: pin.placeTrackId,
              fallbackPlaceName: pin.placeName,
              isMine: true,
              showMyRegisteredTrackCta: true,
              showMapBackButton: true,
            });
          }}
          onRegisterPin={() => navigate('/app')}
        />

        {canShareProfile ? (
          <ProfileShareDialog
            open={isShareOpen}
            onClose={() => setIsShareOpen(false)}
            onCopied={() => {
              toast.success('닉네임이 복사되었어요!', { placement: 'above-navigation' });
            }}
            nickname={nickname}
            name={myProfile.name}
            profileImageUrl={myProfile.profileImageUrl}
          />
        ) : null}
      </div>
    </>
  );
}

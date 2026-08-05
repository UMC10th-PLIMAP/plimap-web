import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SettingsIcon from '@/assets/icons/settings.svg?react';
import ShareIcon from '@/assets/icons/share.svg?react';

import { Toast, ToastProvider, ToastViewport } from '@/components/ui/Toast';
import { ProfileActions } from '@/features/profile/components/ProfileActions';
import { ProfileInfo } from '@/features/profile/components/ProfileInfo';
import { ProfilePinGrid } from '@/features/profile/components/ProfilePinGrid';
import { ProfileShareDialog } from '@/features/profile/components/ProfileShareDialog';

import { useOpenPinPlaceOnMap } from '@/features/pin/hooks/useOpenPinPlaceOnMap';
import { useInfiniteMemberMe } from '@/features/pin/queries/useMemberMe';
import { useMyProfile } from '@/features/home/hooks/useMyProfile';
import { cn } from '@/lib/utils';

const SHARE_TOAST_DURATION_MS = 2_000;

type ShareToast = {
  attempt: number;
};

export default function MyProfilePage() {
  const navigate = useNavigate();
  const { data: myProfile } = useMyProfile();
  const { openPinPlaceOnMap } = useOpenPinPlaceOnMap();
  const {
    data: memberMePages,
    isPending: isMemberMePending,
    isError: isMemberMeError,
    refetch: refetchMemberMe,
  } = useInfiniteMemberMe();
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareToast, setShareToast] = useState<ShareToast | null>(null);

  if (!myProfile) return null;

  const nickname = myProfile.nickname?.trim() ?? '';
  const canShareProfile = nickname.length > 0;

  return (
    <ToastProvider duration={SHARE_TOAST_DURATION_MS}>
      <div className="relative flex flex-col pb-[calc(env(safe-area-inset-bottom)+108px)]">
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
          <ProfileInfo myProfile={myProfile} />
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
                  'max-w-9 max-h-9',
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
              fallbackPlaceName: pin.placeName,
              isMine: true,
              showMyRegisteredTrackCta: true,
            });
          }}
          onRegisterPin={() => navigate('/app')}
        />

        {canShareProfile ? (
          <ProfileShareDialog
            open={isShareOpen}
            onClose={() => setIsShareOpen(false)}
            onCopied={() => {
              setShareToast((current) => ({ attempt: (current?.attempt ?? 0) + 1 }));
            }}
            nickname={nickname}
            name={myProfile.name}
            profileImageUrl={myProfile.profileImageUrl}
          />
        ) : null}

        <div className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+108px)] z-50 flex justify-center">
          {shareToast ? (
            <Toast key={shareToast.attempt} defaultOpen>
              닉네임이 복사되었어요!
            </Toast>
          ) : null}
          <ToastViewport />
        </div>
      </div>
    </ToastProvider>
  );
}

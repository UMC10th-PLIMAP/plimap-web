import { useNavigate } from 'react-router-dom';
import SettingsIcon from '@/assets/icons/settings.svg?react';
import ShareIcon from '@/assets/icons/share.svg?react';

import { ProfileActions } from '@/features/profile/components/ProfileActions';
import { ProfileInfo } from '@/features/profile/components/ProfileInfo';
import { ProfilePinGrid } from '@/features/profile/components/ProfilePinGrid';

import { useInfiniteMemberMe } from '@/features/pin/queries/useMemberMe';
import { useMyProfile } from '@/features/home/hooks/useMyProfile';

export default function MyProfilePage() {
  const navigate = useNavigate();
  const { data: myProfile } = useMyProfile();
  const { data: memberMePages } = useInfiniteMemberMe();

  if (!myProfile) return null;

  return (
    <div className="flex flex-col pb-[calc(env(safe-area-inset-bottom)+108px)]">
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
              onClick: () => {
                // TODO: 프로필 편집 화면 연결
              },
            },
            {
              label: '내 PLIMAP',
              onClick: () => navigate('/app/my/plimap'),
            },
            {
              label: <ShareIcon />,
              onClick: () => {
                // TODO: 프로필 공유 연동
              },
              'aria-label': '프로필 공유',
              className: 'max-w-9 max-h-9 shrink-0',
            },
          ]}
        />
      </div>
      <div className="mt-4 mb-4 h-[1px] bg-pli-black-50" />
      <ProfilePinGrid
        pins={memberMePages?.pages.flatMap((page) => page.data) ?? []}
        onRegisterPin={() => navigate('/app')}
      />
    </div>
  );
}

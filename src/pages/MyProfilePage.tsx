import { useNavigate } from 'react-router-dom';
import MenuIcon from '@/assets/icons/menu.svg?react';

import { BottomNav } from '@/components/BottomNav';
import { ProfileActions } from '@/features/profile/components/ProfileActions';
import { ProfileInfo } from '@/features/profile/components/ProfileInfo';
import { ProfilePinGrid } from '@/features/profile/components/ProfilePinGrid';

import { MOCK_MY_PROFILE } from '@/features/profile/constants/mockMyProfile';

export default function MyProfilePage() {
  const navigate = useNavigate();
  const profile = MOCK_MY_PROFILE;

  return (
    // 완료
    <div className="flex flex-col">
      <header className="grid h-[60px] grid-cols-[24px_1fr_24px] items-center px-4">
        <div />
        <h1 className="text-center head-24-sb text-grayscale-100">{profile.nickname}</h1>
        <button
          type="button"
          aria-label="메뉴"
          className="flex size-6 items-center text-grayscale-100 cursor-pointer"
        >
          <MenuIcon className="size-6" />
        </button>
      </header>

      <div className="mt-[3px] flex flex-col ">
        <ProfileInfo profile={profile} />
        <ProfileActions
          onEditProfile={() => {
            // TODO: 프로필 편집 화면 연결
          }}
          onMyPlimap={() => navigate('/app')}
          onShare={() => {
            // TODO: 프로필 공유 연동
          }}
        />
      </div>
      <div className="mt-4 mb-4 h-[1px] bg-pli-black-50" />
      <ProfilePinGrid pins={profile.pins} onRegisterPin={() => navigate('/app')} />
      <BottomNav activeId="my" onTabChange={() => {}} />
    </div>
  );
}

import { useNavigate, useLocation } from 'react-router-dom';

import { TopBar } from '@/components/ui/TopBar';
import { FollowUserRow } from '@/features/profile/components/FollowUserRow';
import { SearchInput } from '@/components/ui/SearchInput';

import { MOCK_FOLLOWING_USERS } from '@/features/profile/constants/mockFollowUsers';
import { MOCK_MY_PROFILE } from '@/features/profile/constants/mockMyProfile';
import type { FollowTab, FollowUser } from '@/features/profile/types';

const USERS_BY_TAB: Record<FollowTab, FollowUser[]> = {
  following: MOCK_FOLLOWING_USERS,
  follower: MOCK_FOLLOWING_USERS,
};

const OPTIONS: { value: FollowTab; label: string; path: string }[] = [
  { value: 'following', label: '팔로잉', path: '/app/my/following' },
  { value: 'follower', label: '팔로워', path: '/app/my/followers' },
];

function getTabFromPath(pathname: string): FollowTab {
  return pathname.endsWith('/followers') ? 'follower' : 'following';
}

export default function FollowListPage() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const tab = getTabFromPath(pathname);

  return (
    <div className="flex flex-col">
      <TopBar
        title={MOCK_MY_PROFILE.nickname}
        titleWeight="medium"
        onBack={() => navigate('/app/my')}
      />

      <div
        role="tablist"
        aria-label="팔로우 목록"
        className="flex w-full border-b border-pli-black-75"
      >
        {OPTIONS.map((option) => {
          const selected = tab === option.value;

          return (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => navigate(option.path)}
              className={`relative flex h-[45px] flex-1 items-center justify-center body-15-r cursor-pointer ${selected ? 'text-grayscale-300' : 'text-grayscale-800'}`}
            >
              {option.label}
              {selected ? (
                <span
                  className="absolute inset-x-0 bottom-0 h-[1px] bg-grayscale-300"
                  aria-hidden
                />
              ) : null}
            </button>
          );
        })}
      </div>
      <div className="px-[15px] pt-3">
        <SearchInput placeholder="사용자의 닉네임을 검색하세요" variant="song" />
      </div>
      <ul className="flex flex-col gap-5 px-4 pt-5">
        {USERS_BY_TAB[tab].map((user) => (
          <FollowUserRow key={user.id} user={user} />
        ))}
      </ul>
    </div>
  );
}

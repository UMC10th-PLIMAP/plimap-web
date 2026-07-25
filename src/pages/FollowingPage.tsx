import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { TopBar } from '@/components/ui/TopBar';
import { FollowTabs } from '@/features/profile/components/FollowTabs';
import { FollowUserRow } from '@/features/profile/components/FollowUserRow';

import { MOCK_FOLLOWING_USERS } from '@/features/profile/constants/mockFollowUsers';
import { MOCK_MY_PROFILE } from '@/features/profile/constants/mockMyProfile';
import type { FollowTab, FollowUser } from '@/features/profile/types';

const USERS_BY_TAB: Record<FollowTab, FollowUser[]> = {
  following: MOCK_FOLLOWING_USERS,
  follower: [],
  friend: [],
};

export default function FollowingPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<FollowTab>('following');

  return (
    <div className="flex flex-col">
      <TopBar
        title={MOCK_MY_PROFILE.nickname}
        titleWeight="medium"
        onBack={() => navigate('/app/my')}
      />
      <FollowTabs value={tab} onChange={setTab} />
      <ul className="flex flex-col px-4 pt-5 gap-5 cursor-pointer">
        {USERS_BY_TAB[tab].map((user) => (
          <FollowUserRow key={user.id} user={user} />
        ))}
      </ul>
    </div>
  );
}

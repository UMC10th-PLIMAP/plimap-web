import profileAvatarUrl from '@/assets/profile.png';
import type { MyProfile } from '../types';

export const MOCK_MY_PROFILE: MyProfile = {
  nickname: '1mhyori',
  avatarUrl: profileAvatarUrl,
  name: '임효리',
  bio: 'R&B 음악을 좋아해요 ♡',
  followingCount: 200,
  followerCount: 244,
  postCount: 30,
};

export const MOCK_MY_PROFILE_EMPTY: MyProfile = {
  ...MOCK_MY_PROFILE,
  postCount: 0,
};

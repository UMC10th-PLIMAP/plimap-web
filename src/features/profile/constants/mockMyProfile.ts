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

  pins: [
    { id: '1', imageUrl: 'https://picsum.photos/seed/plimap1/400' },
    { id: '2', imageUrl: 'https://picsum.photos/seed/plimap2/400' },
    { id: '3', imageUrl: 'https://picsum.photos/seed/plimap3/400' },
    { id: '4', imageUrl: 'https://picsum.photos/seed/plimap4/400' },
    { id: '5', imageUrl: 'https://picsum.photos/seed/plimap5/400' },
    { id: '6', imageUrl: 'https://picsum.photos/seed/plimap6/400' },
    { id: '7', imageUrl: 'https://picsum.photos/seed/plimap7/400' },
    { id: '8', imageUrl: 'https://picsum.photos/seed/plimap8/400' },
    { id: '9', imageUrl: 'https://picsum.photos/seed/plimap9/400' },
  ],
};

export const MOCK_MY_PROFILE_EMPTY: MyProfile = {
  ...MOCK_MY_PROFILE,
  postCount: 0,
  pins: [],
};

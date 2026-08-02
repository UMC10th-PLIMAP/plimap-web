import profileAvatarUrl from '@/assets/profile.png';
import type { FollowUser } from '../types';

export const MOCK_FOLLOWING_USERS: FollowUser[] = [
  {
    id: '1',
    nickname: '링딩동홍길동등장',
    name: '이하정',
    avatarUrl: profileAvatarUrl,
    relation: 'following',
  },
  {
    id: '2',
    nickname: 'tpdusdl',
    name: '이하정',
    avatarUrl: profileAvatarUrl,
    relation: 'following',
  },
  {
    id: '3',
    nickname: '나는홍대멋쟁이될테야',
    name: '이하정',
    avatarUrl: profileAvatarUrl,
    relation: 'following',
  },
  {
    id: '4',
    nickname: 'plimap_lover',
    name: '김태우',
    avatarUrl: profileAvatarUrl,
    relation: 'following',
  },
  {
    id: '5',
    nickname: 'musicwalk',
    name: '박서연',
    avatarUrl: profileAvatarUrl,
    relation: 'following',
  },
  {
    id: '6',
    nickname: 'night_drive',
    name: '최유진',
    avatarUrl: profileAvatarUrl,
    relation: 'following',
  },
];

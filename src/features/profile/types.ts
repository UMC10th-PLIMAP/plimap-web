export type ProfilePin = {
  id: string;
  imageUrl: string;
};

export type MyProfile = {
  nickname: string;
  name?: string;
  bio?: string;
  avatarUrl: string;
  followingCount: number;
  followerCount: number;
  postCount: number;
  pins: ProfilePin[];
};

export type FollowTab = 'following' | 'follower' | 'friend';

export type FollowUser = {
  id: string;
  nickname: string;
  name: string;
  avatarUrl: string;
  relation: FollowTab;
};

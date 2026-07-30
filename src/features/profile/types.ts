export type ProfilePin = {
  id: string;
  imageUrl: string;
};

export type MyPlimapTab = 'liked' | 'all';

export type MyAllPin = {
  id: string;
  placeName: string;
  albumImageUrl: string;
  trackName: string;
  artistName: string;
  content: string;
  tags: string[];
  createdAtLabel: string;
};

export type MyProfile = {
  nickname: string;
  name?: string;
  bio?: string;
  avatarUrl: string;
  followingCount: number;
  followerCount: number;
  postCount: number;
};
export type FollowTab = 'following' | 'follower';

export type FollowUser = {
  id: string;
  nickname: string;
  name: string;
  avatarUrl: string;
  relation: FollowTab;
};

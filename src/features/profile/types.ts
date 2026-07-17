export type ProfilePin = {
  id: string;
  imageUrl: string;
};

export type MyProfile = {
  nickname: string;
  name: string;
  bio: string;
  avatarUrl: string;
  followingCount: number;
  followerCount: number;
  postCount: number;
  pins: ProfilePin[];
};

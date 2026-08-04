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

export type FollowTab = 'following' | 'follower';

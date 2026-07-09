export type PinSort = 'popular' | 'latest';

export type PlaceInfo = {
  id: string;
  name: string;
  creatorName: string;
  distance: number;
};

export type PinSong = {
  id: string;
  title: string;
  artist: string;
  pinCount: number;
  likeCount?: number;
  liked?: boolean;
  thumbnailUrl?: string;
};

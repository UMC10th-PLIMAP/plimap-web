export type PinSort = 'popular' | 'latest';

export type PlaceInfo = {
  id: string;
  name: string;
  creatorName: string;
  distance: number;
  address?: string;
  isMine?: boolean;
};

export type Pin = {
  id: string;
  pinId?: string;
  title: string;
  artist: string;
  pinCount: number;
  likeCount?: number;
  liked?: boolean;
};

export type Song = {
  id: string;
  title: string;
  artist: string;
  coverUrl?: string;
};

// 곡 상세 댓글 정보 타입
export type PinFeedEntry = {
  id: string;
  nickname: string;
  avatarUrl?: string;
  createdAtLabel: string;
  content: string;
  tags: string[];
  likeCount: number;
  liked?: boolean;
};

export type PinDetail = Pin & {
  likeCount: number;
  liked?: boolean;
  registerCount: number;
  coverUrl?: string;
  feeds: PinFeedEntry[];
};

export type SongDetail = Song & {
  waveformPeaks: readonly number[];
};

export type PlaceResult = {
  id: string;
  creatorName?: string;
  category: string;
  placeName: string;
  address: string;
  distance: number;
};

export type PinSearchPlace = PlaceResult & {
  coordinates: {
    lat: number;
    lng: number;
  };
};

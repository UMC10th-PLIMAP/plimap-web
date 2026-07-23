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
  previewUrl?: string;
  duration?: number;
  waveformPeaks?: number[];
  albumImageUrl?: string;
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

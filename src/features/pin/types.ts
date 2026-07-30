// --------------------------------------------------
export type searchTracksResponse = {
  tracks: {
    itunesTrackId: number;
    trackName: string;
    artistName: string;
    albumName: string;
    artworkUrl: string;
    previewUrl: string;
    durationMs: number;
  }[];
};

export type SearchTrack = searchTracksResponse['tracks'][number];

// --------------------------------------------------
export type PinSort = 'popular' | 'latest';

export type PlaceInfo = {
  id: string;
  name: string;
  creatorName?: string;
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
  artistImage: string;
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

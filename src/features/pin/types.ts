// --------------------------------------------------

type TrackBase = {
  trackName: string;
  artistName: string;
  artworkUrl: string;
};

export type searchTracksResponse = {
  tracks: (TrackBase & {
    itunesTrackId: number;
    albumName: string;
    previewUrl: string;
    durationMs: number;
  })[];
};

export type GetLikedTracksResponse = {
  tracks: (TrackBase & {
    placeTrackId: number;
    likeCount: number;
  })[];
  page: number;
  size: number;
  hasNext: boolean;
};

export type SearchTrack = searchTracksResponse['tracks'][number];
export type LikedTrack = GetLikedTracksResponse['tracks'][number];

export type MemberMeRequest = {
  pageSize: number;
  cursor?: string;
};

export type MemberMeResponse = {
  data: {
    pinId: number;
    albumImageUrl: string;
    latitude: number;
    longitude: number;
    createdAt: string;
  }[];
  nextCursor: string;
  hasNext: boolean;
};

export type GetPlaceTracksResponse = {
  placeId: string;
  distance: number;
  isWithinRadius: boolean;
  tracks: (TrackBase & {
    placeTrackId: number;
    pinCount: number;
    likeCount: number;
    isLiked: boolean;
  })[];
  page: number;
  size: number;
  hasNext: boolean;
};

export type PlaceTrack = GetPlaceTracksResponse['tracks'][number];

export type PutLikedTracksResponse = {
  placeTrackId: number;
  isLiked: boolean;
  likeCount: number;
};

export type GetPlaceTrackDetailResponse = {
  placeTrackId: number;
  trackId: number;
  youtubeVideoId: string;
  title: string;
  artist: string;
  albumImageUrl: string;
  likeCount: number;
  userLike: boolean;
};

export type GetPlaybackPreparationsResponse = {
  itunesTrackId: number;
  youtubeVideoId: string;
  title: string;
  artistName: string;
  albumTitle: string;
  albumImageUrl: string;
  previewUrl: string;
  durationMs: number;
};

export type GetPlaceTrackPinsResponse = {
  data: {
    pinId: number;
    writerNickname: string;
    writerProfileImage: string;
    introduction: string;
    tags: string[];
    clipStartMs: number;
    likeCount: number;
    userLike: boolean;
    staticCreatedAt: string;
    createdAt: string;
  }[];
  nextCursor: string;
  hasNext: boolean;
  pageSize: number;
};

// --------------------------------------------------
export type PinSort = 'POPULAR' | 'LATEST';

export type PlaceInfo = {
  id: string;
  name: string;
  creatorName?: string;
  distance: number;
  address?: string;
  isMine?: boolean;
};

/** PinCard — 찜한 곡 API와 동일 shape (+ UI 전용 옵션) */
export type Pin = LikedTrack & {
  pinCount?: number;
  liked?: boolean;
  pinId?: string;
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
  isMine?: boolean;
};

export type PinDetail = {
  id: string;
  title: string;
  artist: string;
  coverUrl?: string;
  likeCount: number;
  liked?: boolean;
  registerCount: number;
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

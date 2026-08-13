import type { PlaceSearchHistoryRequest, PlaceSearchSource } from '@/types/place.type';

// --------------------------------------------------

type TrackBase = {
  trackName: string | null;
  artistName: string | null;
  artworkUrl: string | null;
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
  pageSize?: number;
  cursor?: string;
  userLatitude?: number;
  userLongitude?: number;
};

export type MemberMeFeedItem = {
  pinId: number;
  /** 서버 피드 응답에 포함되면 추가 조회 없이 곡 상세 CTA를 연결한다. */
  placeTrackId?: number;
  albumImageUrl: string;
  latitude: number;
  longitude: number;
  placeName: string;
  distanceFromUser: number;
  pinCount: number;
  createdAt: string;
};

export type MemberMeResponse = {
  data: MemberMeFeedItem[];
  nextCursor: string;
  hasNext: boolean;
};

export type GetPlaceTracksResponse = {
  placeId: number;
  distance: number;
  isWithinRadius: boolean;
  isTrackDetailAccessible: boolean;
  tracks: (TrackBase & {
    placeTrackId: number;
    pinCount: number;
    likeCount?: number;
    isLiked: boolean;
    /** 내가 이 장소·곡에 핀을 등록했는지 */
    pinByMe?: boolean;
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

export type PostPlaybackFailuresRequest = {
  itunesTrackId: number;
  youtubeVideoId: string;
  errorCode: number;
};

export type GetPlaceTrackPinsResponse = {
  data: {
    memberId: number;
    pinId: number;
    writerNickname: string;
    writerProfileImage: string | null;
    introduction: string;
    tags: string[];
    clipStartMs: number;
    likeCount: number;
    userLike: boolean;
    staticCreatedAt: string;
    createdAt: string;
    pinByMe: boolean;
  }[];
  nextCursor: string;
  hasNext: boolean;
  pageSize: number;
};

export type LikeCountResponse = {
  pinCount: number;
};

export type GetMyPinsResponse = {
  data: {
    pinId: number;
    /** 서버 목록 응답에 포함되면 추가 조회 없이 곡 상세 CTA를 연결한다. */
    placeTrackId?: number;
    albumImageUrl: string;
    trackTitle: string;
    artist: string;
    placeName: string;
    introduction: string;
    tags: string[];
    staticCreatedAt: string;
    createdAt: string;
  }[];
  nextCursor: string;
  hasNext: boolean;
  pageSize: number;
};

export type PinDetailResponse = {
  writerId: number;
  placeId: number;
  latitude: number;
  longitude: number;
  writerNickname: string;
  writerProfileImage: string | null;
  introduction: string;
  albumImageUrl: string;
  youtubeVideoId: string;
  clipStartMs: number;
  tags: string[];
  feedOpen: boolean;
};

export type PatchPinRequest = {
  introduction: string;
  tags: string[];
  feedOpen: boolean;
  clipStartMs?: number;
};

export type PatchPinResponse = {
  introduction: string;
  tags: string[];
  feedOpen: boolean;
  clipStartMs?: number;
};

export type postFeedPlaceAccessResponse = {
  placeAccessToken: string;
  placeId: number;
};

// --------------------------------------------------
export type PinSort = 'POPULAR' | 'LATEST';

export type PlaceInfo = {
  id: string;
  placeId?: number;
  name: string;
  creatorName?: string;
  distance: number;
  address?: string;
  isMine?: boolean;
  latitude: number;
  longitude: number;
  bookmarkedByMe?: boolean;
};

/** PinCard — 찜한 곡 API와 동일 shape (+ UI 전용 옵션) */
export type Pin = Omit<LikedTrack, 'likeCount'> & {
  likeCount?: number;
  pinCount?: number;
  liked?: boolean;
  /** 내가 이 장소·곡에 핀을 등록했는지 */
  pinByMe?: boolean;
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
  memberId: number;
  nickname: string;
  avatarUrl?: string;
  createdAtLabel: string;
  content: string;
  tags: string[];
  likeCount: number;
  liked?: boolean;
  isMine?: boolean;
  clipStartMs: number;
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

export type FocusedFeedPin = {
  pinId: number;
  placeTrackId?: number;
  nickname: string;
  avatarUrl?: string;
  albumImageUrl: string;
  introduction: string;
  /** 말풍선 미리듣기 재생용 */
  youtubeVideoId?: string;
  clipStartMs?: number;
};

export type PinSearchPlace = PlaceResult & {
  placeId?: number;
  bookmarkedByMe?: boolean;
  isMine?: boolean;
  /** 등록 곡 상세 보기 CTA (내 등록 곡이 있을 때만) */
  focusedFeedPin?: FocusedFeedPin;
  /** 지도 핀 말풍선용 (CTA와 별개로 인기 PIN 등을 표시할 때) */
  mapFocusPin?: FocusedFeedPin;
  /**
   * 내/친구 피드 → 지도 진입 시에만 true.
   * false/미설정이어도 내 장소이거나 현재 위치 500m 이내이면 곡 상세 열람이 허용된다.
   */
  allowTrackDetailAccess?: boolean;
  /** 친구 피드 진입 시 발급받은 장소 접근 토큰 (해당 장소 곡 상세에만 사용) */
  placeAccessToken?: string;
  source?: 'PLACE_SEARCH' | 'ADDRESS_SEARCH' | 'MAP_SELECTION';
  withinAccessRange?: boolean;
  /**
   * 실제 GPS로 얻은 사용자 위치 (500m 접근 판정용).
   * 위치 조회 실패 시 넣지 않는다 — 장소 좌표로 대체하면 안 된다.
   */
  selectionLocation?: PlaceSearchHistoryRequest;
  /**
   * 장소 상세·곡 목록 API 조회용 좌표.
   * GPS가 있으면 GPS, 없으면 장소 좌표로 채운다 (목록은 위치 없이도 볼 수 있어야 함).
   */
  queryLocation?: PlaceSearchHistoryRequest;
  coordinates: {
    lat: number;
    lng: number;
  };
  searchHistoryId?: number;
  searchSource?: PlaceSearchSource;
  /** 선택 당시 입력창에 있던 검색어. 지도 검색 화면 재진입 시 그대로 복원한다. */
  searchQuery?: string;
  /**
   * 핀 카드/알림 등에서 지도로 진입했을 때
   * 상단 검색창 대신 ‘뒤로가기’를 표시한다.
   */
  showMapBackButton?: boolean;
  /**
   * 이 장소에 등록된 핀이 있는지. creatorName이 없는 경로(예: 인기 장소 카드)에서도
   * 마커를 신규 미등록 장소용 기본 아이콘으로 잘못 그리지 않기 위해 별도로 둔다.
   */
  hasPin?: boolean;
};

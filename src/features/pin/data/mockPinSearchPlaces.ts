import type { Pin, PinSearchPlace, PinDetail } from '@/features/pin/types';
import loveAttackCoverUrl from '@/assets/images/Hype-Boy.png';

const HAN_RIVER: PinSearchPlace = {
  id: 'han-river',
  creatorName: '홍길동',
  category: '한강',
  placeName: '한강',
  address: '서울특별시 영등포구 여의동로 330',
  distance: 470,
  coordinates: { lat: 37.527105, lng: 126.932631 },
};

const HAIDILAO_MYEONGDONG: PinSearchPlace = {
  id: 'haidilao-myeongdong',
  category: '식당',
  placeName: '하이디라오 명동점',
  address: '서울특별시 중구 명동7길 13',
  distance: 470,
  coordinates: { lat: 37.563638, lng: 126.984432 },
};

const HONGDAE_STATION: PinSearchPlace = {
  id: 'hongdae-station-line-2',
  creatorName: '김첨지',
  category: '지하철',
  placeName: '홍대입구역 2호선',
  address: '서울특별시 마포구 양화로 160',
  distance: 470,
  coordinates: { lat: 37.557192, lng: 126.925381 },
};

export const MOCK_RECENT_PIN_SEARCH_PLACES: PinSearchPlace[] = [
  HAN_RIVER,
  HAIDILAO_MYEONGDONG,
  HONGDAE_STATION,
];

export const MOCK_PIN_SEARCH_PLACES: PinSearchPlace[] = [
  ...MOCK_RECENT_PIN_SEARCH_PLACES,
  {
    id: 'jamwon-han-river-park',
    category: '시민공원',
    placeName: '잠원 한강공원',
    address: '서울특별시 서초구 잠원동 121-8',
    distance: 470,
    coordinates: { lat: 37.520881, lng: 127.012151 },
  },
  {
    id: 'yeouido-han-river-park',
    creatorName: '홍길동',
    category: '도시근린공원',
    placeName: '여의도한강공원',
    address: '서울특별시 영등포구 여의동로 330',
    distance: 470,
    coordinates: { lat: 37.528308, lng: 126.932916 },
  },
  {
    id: 'yeouido-han-river-parking-1',
    creatorName: '홍길동',
    category: '주차장',
    placeName: '여의도한강공원 1주차장',
    address: '서울특별시 영등포구 여의동로 343',
    distance: 470,
    coordinates: { lat: 37.526972, lng: 126.934803 },
  },
  {
    id: 'han-river-pub',
    category: '술집',
    placeName: '한강',
    address: '서울특별시 용산구 이촌동 301-153',
    distance: 470,
    coordinates: { lat: 37.534618, lng: 126.994443 },
  },
  {
    id: 'han-river-korean-food-1',
    creatorName: '홍길동',
    category: '한식',
    placeName: '한강',
    address: '서울특별시 용산구 이촌동 302-17',
    distance: 470,
    coordinates: { lat: 37.532497, lng: 126.990846 },
  },
  {
    id: 'han-river-korean-food-2',
    creatorName: '홍길동',
    category: '한식',
    placeName: '한강',
    address: '서울특별시 광진구 강변북로 139',
    distance: 470,
    coordinates: { lat: 37.529741, lng: 126.983084 },
  },
  {
    id: 'han-river-korean-food-3',
    creatorName: '홍길동',
    category: '한식',
    placeName: '한강',
    address: '서울특별시 마포구 마포나루길 467',
    distance: 470,
    coordinates: { lat: 37.526481, lng: 126.976522 },
  },
];

const FEED_TAGS = ['감성', '낭만', '우울', '새벽'];

/** LOVE ATTACK 곡 상세 + 등록 피드 */
export const MOCK_SONG_DETAIL_LOVE_ATTACK: PinDetail = {
  id: 'love-attack',
  pinCount: 1,
  title: 'LOVE ATTACK',
  artist: 'RESCENE',
  coverUrl: loveAttackCoverUrl,
  likeCount: 33,
  liked: false,
  registerCount: 2,
  feeds: [
    {
      id: 'feed-1',
      nickname: '일이삼사오육칠팔구십',
      createdAtLabel: '방금',
      content: '광장 야호~',
      tags: FEED_TAGS,
      likeCount: 2,
    },
    {
      id: 'feed-2',
      nickname: '일이삼사오육칠팔구십',
      createdAtLabel: '13시간 전',
      content: '광장 야호~',
      tags: FEED_TAGS,
      likeCount: 2,
    },
    {
      id: 'feed-3',
      nickname: '일이삼사오육칠팔구십',
      createdAtLabel: '16일 전',
      content: '광장 야호~',
      tags: FEED_TAGS,
      likeCount: 2,
    },
  ],
};

export const MOCK_SONG_DETAILS: Record<string, PinDetail> = {
  [MOCK_SONG_DETAIL_LOVE_ATTACK.id]: MOCK_SONG_DETAIL_LOVE_ATTACK,
};

/** PinListSheet 핀 카드 — LOVE ATTACK은 상세 더미와 같은 곡을 가리킨다 */
export const MOCK_PIN_CARD_DATA: Pin[] = [
  {
    id: 'love-attack-1',
    pinId: MOCK_SONG_DETAIL_LOVE_ATTACK.id,
    title: MOCK_SONG_DETAIL_LOVE_ATTACK.title,
    artist: MOCK_SONG_DETAIL_LOVE_ATTACK.artist,
    pinCount: 1,
    likeCount: 1,
    liked: true,
  },
  {
    id: 'toxic-till-the-end-1',
    pinId: 'toxic-till-the-end',
    title: 'Toxic Till the End',
    artist: 'ROSÉ',
    pinCount: 1,
    likeCount: 0,
    liked: false,
  },
  {
    id: 'toxic-till-the-end-2',
    pinId: 'toxic-till-the-end',
    title: 'Toxic Till the End',
    artist: 'ROSÉ',
    pinCount: 1,
    likeCount: 0,
    liked: false,
  },
  {
    id: 'toxic-till-the-end-3',
    pinId: 'toxic-till-the-end',
    title: 'Toxic Till the End',
    artist: 'ROSÉ',
    pinCount: 1,
    likeCount: 0,
    liked: false,
  },
];

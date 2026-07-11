import type { PinSearchPlace } from '@/types/place';

const HAN_RIVER: PinSearchPlace = {
  id: 'han-river',
  creatorName: '홍길동',
  category: '한강',
  placeName: '한강',
  distance: 470,
  coordinates: { lat: 37.527105, lng: 126.932631 },
};

const HAIDILAO_MYEONGDONG: PinSearchPlace = {
  id: 'haidilao-myeongdong',
  category: '식당',
  placeName: '하이디라오 명동점',
  distance: 470,
  coordinates: { lat: 37.563638, lng: 126.984432 },
};

const HONGDAE_STATION: PinSearchPlace = {
  id: 'hongdae-station-line-2',
  creatorName: '김첨지',
  category: '지하철',
  placeName: '홍대입구역 2호선',
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
    distance: 470,
    coordinates: { lat: 37.520881, lng: 127.012151 },
  },
  {
    id: 'yeouido-han-river-park',
    creatorName: '홍길동',
    category: '도시근린공원',
    placeName: '여의도한강공원',
    distance: 470,
    coordinates: { lat: 37.528308, lng: 126.932916 },
  },
  {
    id: 'yeouido-han-river-parking-1',
    creatorName: '홍길동',
    category: '주차장',
    placeName: '여의도한강공원 1주차장',
    distance: 470,
    coordinates: { lat: 37.526972, lng: 126.934803 },
  },
  {
    id: 'han-river-pub',
    category: '술집',
    placeName: '한강',
    distance: 470,
    coordinates: { lat: 37.534618, lng: 126.994443 },
  },
  {
    id: 'han-river-korean-food-1',
    creatorName: '홍길동',
    category: '한식',
    placeName: '한강',
    distance: 470,
    coordinates: { lat: 37.532497, lng: 126.990846 },
  },
  {
    id: 'han-river-korean-food-2',
    creatorName: '홍길동',
    category: '한식',
    placeName: '한강',
    distance: 470,
    coordinates: { lat: 37.529741, lng: 126.983084 },
  },
  {
    id: 'han-river-korean-food-3',
    creatorName: '홍길동',
    category: '한식',
    placeName: '한강',
    distance: 470,
    coordinates: { lat: 37.526481, lng: 126.976522 },
  },
];

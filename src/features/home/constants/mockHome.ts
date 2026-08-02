import RecommendationCardImage from '@/assets/recommendation-content-card.png';
import FriendAvatarCor from '@/assets/home/friend-avatar-cor.png';
import FriendAvatarJeong from '@/assets/home/friend-avatar-jeong.png';
import FriendAvatarNyangko from '@/assets/home/friend-avatar-nyangko.png';
import FriendPlaceStation from '@/assets/home/friend-place-station.png';
import FriendPlaceTtukseom from '@/assets/home/friend-place-ttukseom.png';
import FriendPlaceWaterStage from '@/assets/home/friend-place-water-stage.png';
import type { RecommendationPin } from '@/features/home/components/RecommendationPinCard';

export type HotPlace = {
  id: string;
  name: string;
  distance: string;
  pinCount: number;
  imageSrc: string;
};

export type SavedPlace = {
  id: string;
  name: string;
  creatorName: string;
  distance: string;
};

export const MOCK_HOME_USER = {
  nickname: '1mhyori',
  currentLocation: '경기도 성남시 분당구',
} as const;

export const MOCK_FRIEND_PINS: readonly RecommendationPin[] = [
  {
    id: 'friend-pin-1',
    place: { name: '뚝섬한강공원' },
    song: { title: 'Hype Boy', artist: 'NewJeans' },
    creator: { name: '냥코', avatarUrl: FriendAvatarNyangko },
    imageUrl: FriendPlaceTtukseom,
  },
  {
    id: 'friend-pin-2',
    place: { name: '물빛무대 앞 광장' },
    song: { title: 'Ditto', artist: 'NewJeans' },
    creator: { name: '정', avatarUrl: FriendAvatarJeong },
    imageUrl: FriendPlaceWaterStage,
  },
  {
    id: 'friend-pin-3',
    place: { name: '뚝섬역 2호선' },
    song: { title: 'Super Shy', artist: 'NewJeans' },
    creator: { name: 'COR', avatarUrl: FriendAvatarCor },
    imageUrl: FriendPlaceStation,
  },
] as const;

export const MOCK_HOT_PLACES: readonly HotPlace[] = [
  {
    id: 'hot-1',
    name: '뚝섬한강공원',
    distance: '50m',
    pinCount: 30,
    imageSrc: RecommendationCardImage,
  },
  {
    id: 'hot-2',
    name: '물빛무대 앞 광장',
    distance: '120m',
    pinCount: 30,
    imageSrc: RecommendationCardImage,
  },
  {
    id: 'hot-3',
    name: '서울숲',
    distance: '180m',
    pinCount: 24,
    imageSrc: RecommendationCardImage,
  },
  {
    id: 'hot-4',
    name: '한강서점',
    distance: '230m',
    pinCount: 12,
    imageSrc: RecommendationCardImage,
  },
  {
    id: 'hot-5',
    name: '성수연방',
    distance: '310m',
    pinCount: 18,
    imageSrc: RecommendationCardImage,
  },
  { id: 'hot-6', name: '세빛섬', distance: '350m', pinCount: 8, imageSrc: RecommendationCardImage },
] as const;

export const MOCK_SAVED_PLACES: readonly SavedPlace[] = [
  { id: 'saved-1', name: '물빛무대 앞 광장', creatorName: '홍길동', distance: '470m' },
  { id: 'saved-2', name: '뚝섬역 2호선', creatorName: '홍길동', distance: '470m' },
  { id: 'saved-3', name: '한강서점', creatorName: '홍길동', distance: '470m' },
  { id: 'saved-4', name: '서울숲 가족마당', creatorName: '지수', distance: '520m' },
  { id: 'saved-5', name: '성수연방', creatorName: '민준', distance: '610m' },
  { id: 'saved-6', name: '서울숲역 4번 출구', creatorName: '서윤', distance: '680m' },
  { id: 'saved-7', name: '언더스탠드에비뉴', creatorName: '하늘', distance: '720m' },
  { id: 'saved-8', name: '서울숲 거울연못', creatorName: '은우', distance: '790m' },
  { id: 'saved-9', name: '성수동 카페거리', creatorName: '유진', distance: '840m' },
] as const;

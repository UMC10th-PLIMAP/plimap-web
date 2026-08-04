import FriendAvatarCor from '@/assets/home/friend-avatar-cor.png';
import FriendAvatarJeong from '@/assets/home/friend-avatar-jeong.png';
import FriendAvatarNyangko from '@/assets/home/friend-avatar-nyangko.png';
import FriendPlaceStation from '@/assets/home/friend-place-station.png';
import FriendPlaceTtukseom from '@/assets/home/friend-place-ttukseom.png';
import FriendPlaceWaterStage from '@/assets/home/friend-place-water-stage.png';
import type { RecommendationPin } from '@/features/home/components/RecommendationPinCard';

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

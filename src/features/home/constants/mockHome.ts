import FriendAvatarCor from '@/assets/home/friend-avatar-cor.png';
import FriendAvatarJeong from '@/assets/home/friend-avatar-jeong.png';
import FriendAvatarNyangko from '@/assets/home/friend-avatar-nyangko.png';
import FriendPlaceStation from '@/assets/home/friend-place-station.png';
import FriendPlaceTtukseom from '@/assets/home/friend-place-ttukseom.png';
import FriendPlaceWaterStage from '@/assets/home/friend-place-water-stage.png';
import type { RecommendationPin } from '@/features/home/components/RecommendationPinCard';

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

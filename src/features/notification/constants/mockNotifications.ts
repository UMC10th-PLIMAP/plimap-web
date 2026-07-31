import ringdingdongProfileImage from '@/assets/images/notifications/ringdingdong.png';
import tpdusdlDogProfileImage from '@/assets/images/notifications/tpdusdl-dog.png';
import tpdusdlProfileImage from '@/assets/images/notifications/tpdusdl.png';
import type { FollowNotification } from '@/features/notification/types';

export const MOCK_FOLLOW_NOTIFICATIONS: FollowNotification[] = [
  {
    id: '1',
    actorNickname: 'tpdusdl',
    actorProfileImageUrl: tpdusdlProfileImage,
    createdAtLabel: '3분전',
    relation: 'follow-back',
  },
  {
    id: '2',
    actorNickname: '링딩동홍길동',
    actorProfileImageUrl: ringdingdongProfileImage,
    createdAtLabel: '3시간전',
    relation: 'following',
  },
  {
    id: '3',
    actorNickname: 'tpdusdl',
    actorProfileImageUrl: tpdusdlDogProfileImage,
    createdAtLabel: '3시간전',
    relation: 'follow-back',
  },
];

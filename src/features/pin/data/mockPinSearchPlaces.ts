import type { Pin, PinDetail } from '@/features/pin/types';
import loveAttackCoverUrl from '@/assets/images/Hype-Boy.png';

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
  registerCount: 5,
  feeds: [
    {
      id: 'feed-1',
      nickname: '일이삼사오육칠팔구십',
      createdAtLabel: '방금',
      content: '광장 야호~',
      tags: FEED_TAGS,
      likeCount: 2,
      isMine: true,
    },
    {
      id: 'feed-2',
      nickname: '일이삼사오육칠팔구십',
      createdAtLabel: '13시간 전',
      content: '광장 야호~',
      tags: FEED_TAGS,
      likeCount: 8,
    },
    {
      id: 'feed-3',
      nickname: '일이삼사오육칠팔구십',
      createdAtLabel: '16일 전',
      content: '광장 야호~',
      tags: FEED_TAGS,
      likeCount: 5,
    },
    {
      id: 'feed-4',
      nickname: '일이삼사오육칠팔구십',
      createdAtLabel: '16일 전',
      content: '광장 야호~',
      tags: FEED_TAGS,
      likeCount: 5,
    },
    {
      id: 'feed-5',
      nickname: '일이삼사오육칠팔구십',
      createdAtLabel: '16일 전',
      content: '광장 야호~',
      tags: FEED_TAGS,
      likeCount: 5,
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

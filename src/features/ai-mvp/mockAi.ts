import type { GetPlaybackPreparationsResponse, Pin, SearchTrack } from '@/features/pin/types';

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));
const fightingArtworkUrl = '/ai-mvp/fighting-cover.jpg';

export type CharacterVariant = 'music' | 'night' | 'summer';

export type MockCharacter = {
  id: string;
  variant: CharacterVariant;
  name: string;
  description: string;
  emoji: string;
  gradient: string;
  cardUrl?: string;
  markerUrl?: string;
};

const CHARACTER_VARIANTS: Omit<MockCharacter, 'id'>[] = [
  {
    variant: 'music',
    name: '뮤직 버블',
    description: '검정과 핑크로 꾸민 음악 러버',
    emoji: '🎧',
    gradient: 'from-[#ff9fca] to-[#8bc8ff]',
    cardUrl: '/characters/music-card.png',
    markerUrl: '/characters/music-marker.png',
  },
  {
    variant: 'night',
    name: '나이트 무비',
    description: '달빛 아래 영화를 즐기는 감성파',
    emoji: '🌙',
    gradient: 'from-[#ffe3a3] to-[#8195c7]',
    cardUrl: '/characters/night-card.png',
    markerUrl: '/characters/night-marker.png',
  },
  {
    variant: 'summer',
    name: '서머 플레이리스트',
    description: '햇살과 파도를 닮은 에너지',
    emoji: '🌴',
    gradient: 'from-[#86e8ff] to-[#d7ff5f]',
    cardUrl: '/characters/summer-card.png',
    markerUrl: '/characters/summer-marker.png',
  },
];

export function getUnlockedCharacters(pinCount: number): MockCharacter[] {
  const count = CHARACTER_VARIANTS.length + Math.max(0, Math.floor(pinCount / 10));
  return Array.from({ length: count }, (_, index) => {
    const variant = CHARACTER_VARIANTS[index % CHARACTER_VARIANTS.length];
    return { ...variant, id: `${variant.variant}-${index + 1}` };
  });
}

export const AI_RECOMMENDED_TRACK: SearchTrack = {
  itunesTrackId: 1668145595,
  trackName: '파이팅 해야지 (feat. 이영지)',
  artistName: '부석순 (SEVENTEEN)',
  albumName: 'SECOND WIND',
  artworkUrl: fightingArtworkUrl,
  previewUrl: '',
  durationMs: 204_467,
};

export const AI_RECOMMENDED_PLAYBACK: GetPlaybackPreparationsResponse = {
  itunesTrackId: AI_RECOMMENDED_TRACK.itunesTrackId,
  youtubeVideoId: '',
  title: AI_RECOMMENDED_TRACK.trackName ?? '파이팅 해야지',
  artistName: AI_RECOMMENDED_TRACK.artistName ?? '부석순 (SEVENTEEN)',
  albumTitle: AI_RECOMMENDED_TRACK.albumName,
  albumImageUrl: fightingArtworkUrl,
  previewUrl: '',
  durationMs: AI_RECOMMENDED_TRACK.durationMs,
};

export async function analyzePlacePhoto() {
  await wait(1_500);
  return {
    mood: '활기차고 긍정적인 분위기',
    reason: '밝은 색감과 열린 공간에 어울리는 힘찬 곡이에요.',
    track: AI_RECOMMENDED_TRACK,
  };
}

export const SEOUL_CITY_HALL_MOCK = {
  id: 'ai-mvp:seoul-city-hall',
  placeId: 990_001,
  placeName: '서울시청',
  address: '서울특별시 중구 세종대로 110',
  latitude: 37.5663,
  longitude: 126.9779,
};

export const SEOUL_CITY_HALL_TRACKS: Pin[] = [
  {
    placeTrackId: 990_101,
    trackName: '파이팅 해야지',
    artistName: '부석순 (SEVENTEEN)',
    artworkUrl: fightingArtworkUrl,
    pinCount: 5,
    likeCount: 21,
    liked: false,
  },
  {
    placeTrackId: 990_102,
    trackName: 'Hype Boy',
    artistName: 'NewJeans',
    artworkUrl: fightingArtworkUrl,
    pinCount: 3,
    likeCount: 13,
    liked: false,
  },
  {
    placeTrackId: 990_103,
    trackName: '밤편지',
    artistName: '아이유',
    artworkUrl: fightingArtworkUrl,
    pinCount: 2,
    likeCount: 8,
    liked: false,
  },
];

export async function analyzePlaceSongs() {
  await wait(900);
  return {
    representativeTrack: AI_RECOMMENDED_TRACK,
    genres: [
      { name: 'K-POP / 댄스', count: 5 },
      { name: '인디 / 어쿠스틱', count: 3 },
      { name: 'R&B', count: 2 },
    ],
    summary: '출근길에 활력을 더하는 밝고 리드미컬한 음악이 많아요.',
  };
}

export async function analyzeMusicCompatibility(memberId: number) {
  await wait(1_000);
  const scores = [82, 88, 93, 76];
  const genres = [
    ['K-POP', '댄스'],
    ['인디', '어쿠스틱'],
    ['R&B', '힙합'],
    ['록', '시티팝'],
  ];
  const index = memberId % scores.length;
  return {
    score: scores[index],
    sharedGenres: genres[index],
    differentTaste:
      index % 2 === 0
        ? '나는 발라드, 친구는 힙합을 더 즐겨요.'
        : '나는 댄스, 친구는 인디를 더 즐겨요.',
    track: AI_RECOMMENDED_TRACK,
  };
}

export type TodayMood = '신남' | '차분' | '지침' | '설렘';

const TODAY_TRACKS: Record<TodayMood, SearchTrack> = {
  신남: AI_RECOMMENDED_TRACK,
  차분: { ...AI_RECOMMENDED_TRACK, trackName: '밤편지', artistName: '아이유' },
  지침: { ...AI_RECOMMENDED_TRACK, trackName: '수고했어, 오늘도', artistName: '옥상달빛' },
  설렘: { ...AI_RECOMMENDED_TRACK, trackName: 'Hype Boy', artistName: 'NewJeans' },
};

export async function recommendTodaySong(mood: TodayMood, prompt: string) {
  await wait(1_000);
  return {
    weather: '맑음 · 22°C',
    message: prompt.trim()
      ? `“${prompt.trim().slice(0, 32)}”에 어울리는 곡이에요.`
      : `${mood} 기분과 맑은 날씨에 어울리는 곡이에요.`,
    track: TODAY_TRACKS[mood],
  };
}

export const WEEKLY_REPORT = {
  weekLabel: '이번 주 음악 리포트',
  mood: '활기 · 설렘',
  genre: 'K-POP / 댄스',
  track: '파이팅 해야지 · 부석순',
  comment: '힘이 필요한 순간마다 리듬이 분명한 음악을 골랐어요.',
};

import type { MapPin } from '@/features/map/types';

/**
 * 개발 환경에서 실제 API 응답이 비어있을 때(근처에 등록된 PIN이 없을 때)
 * 배선/렌더링을 확인할 수 있도록 서울시청 근처(공공장소)에 고정으로 띄우는 목데이터.
 * 화면 중심 기준으로 계산하지 않는다 — 지도를 움직여도 따라오지 않고 실제
 * 위치에 고정돼 있어야 하기 때문. 프로덕션 빌드(import.meta.env.DEV === false)
 * 에서는 절대 사용하지 않는다.
 */
export const DEV_MOCK_MAP_PINS: MapPin[] = [
  {
    id: 'dev-mock:1',
    lat: 37.5663,
    lng: 126.9779,
    coverUrl: undefined,
    nickname: '냥코',
    introduction: '도가니 살리기 위잉잉잉~',
    hasBookmarkedPlace: true,
  },
  {
    id: 'dev-mock:2',
    lat: 37.5658,
    lng: 126.9784,
    coverUrl: undefined,
    nickname: '한강러버',
    introduction: '야경 보면서 듣기 딱 좋아요',
    hasBookmarkedPlace: false,
  },
  {
    id: 'dev-mock:3',
    lat: 37.5669,
    lng: 126.9773,
    coverUrl: undefined,
    nickname: '산책러',
    introduction: '퇴근길 산책 플레이리스트',
    hasBookmarkedPlace: false,
  },
  {
    id: 'dev-mock:4',
    lat: 37.5661,
    lng: 126.977,
    coverUrl: undefined,
    nickname: '댄스머신',
    introduction: '기분 좋아지는 노래 추천',
    hasBookmarkedPlace: true,
  },
];

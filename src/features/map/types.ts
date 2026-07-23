export type MapCoordinate = {
  lat: number;
  lng: number;
};

export const DEFAULT_CENTER: MapCoordinate = { lat: 37.5665, lng: 126.978 };

export type KakaoLocalPlace = {
  id: string;
  placeName: string;
  categoryName: string;
  categoryGroupName: string;
  phone: string;
  addressName: string;
  roadAddressName: string;
  placeUrl: string;
  x: number;
  y: number;
  distance?: number;
};

export type MapPin = {
  id: string;
  lat: number;
  lng: number;
  title: string;
  artist: string;
  coverUrl?: string;
};

// 현재 위치 마커 기본 색상
export const DEFAULT_MARKER_COLOR = '#C8F940';

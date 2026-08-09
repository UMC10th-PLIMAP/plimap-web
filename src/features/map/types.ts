export type MapCoordinate = {
  lat: number;
  lng: number;
};

export const DEFAULT_CENTER: MapCoordinate = { lat: 37.5665, lng: 126.978 };

export type MapBounds = {
  southWest: MapCoordinate;
  northEast: MapCoordinate;
};

export type MapViewport = {
  center: MapCoordinate;
  bounds: MapBounds;
  zoom: number;
};

export type MapPlace = {
  id: string;
  placeName: string;
  category: string;
  address: string;
  coordinates: MapCoordinate;
  distance?: number;
};

export type MapPin = {
  id: string;
  placeId?: number;
  lat: number;
  lng: number;
  title?: string;
  artist?: string;
  coverUrl?: string;
  nickname: string;
  avatarUrl?: string;
  introduction: string;
  youtubeVideoId?: string;
  clipStartMs?: number;
};

// 행정구역(REGION1~3) 또는 geohash(GEOHASH) 기준 핀 클러스터
export type PinClusterLevel = 'REGION1' | 'REGION2' | 'REGION3' | 'GEOHASH';

export type PinClusterBounds = {
  southWestLat: number;
  southWestLng: number;
  northEastLat: number;
  northEastLng: number;
};

export type PinCluster = {
  clusterLevel: PinClusterLevel;
  regionName: string | null;
  precision: number | null;
  latitude: number;
  longitude: number;
  placeCount: number;
  bounds: PinClusterBounds;
};

// 현재 위치 마커 기본 색상
export const DEFAULT_MARKER_COLOR = '#C8F940';

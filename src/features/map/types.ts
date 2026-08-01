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
};

export type MapCluster = {
  id: string;
  count: number;
  lat: number;
  lng: number;
  regionName: string;
  bounds: MapBounds;
};

// 현재 위치 마커 기본 색상
export const DEFAULT_MARKER_COLOR = '#C8F940';

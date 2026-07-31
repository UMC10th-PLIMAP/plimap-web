import type { MapCoordinate } from '@/features/map/types';

const EARTH_RADIUS_METERS = 6_371_000;

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

/** 두 좌표 사이의 거리를 하버사인 공식으로 계산해 미터 단위로 반환한다. */
export function calculateDistanceMeters(a: MapCoordinate, b: MapCoordinate): number {
  const deltaLat = toRadians(b.lat - a.lat);
  const deltaLng = toRadians(b.lng - a.lng);

  const sinDeltaLat = Math.sin(deltaLat / 2);
  const sinDeltaLng = Math.sin(deltaLng / 2);

  const h =
    sinDeltaLat * sinDeltaLat +
    Math.cos(toRadians(a.lat)) * Math.cos(toRadians(b.lat)) * sinDeltaLng * sinDeltaLng;

  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.min(1, Math.sqrt(h)));
}

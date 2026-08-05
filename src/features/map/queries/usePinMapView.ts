import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { getPinMapView, type PinMapViewRequest } from '@/api/pin';
import type { MapViewport } from '@/features/map/types';

const COORDINATE_PRECISION = 6;
// useGoogleMap.ts의 MIN_ZOOM/MAX_ZOOM과 동일하게 맞춘다.
const MIN_API_ZOOM = 6;
const MAX_API_ZOOM = 21;

const roundCoordinate = (value: number) => Number(value.toFixed(COORDINATE_PRECISION));

const normalizeMapZoom = (zoom: number) =>
  Math.min(MAX_API_ZOOM, Math.max(MIN_API_ZOOM, Math.round(zoom)));

const toPinMapViewRequest = (viewport: MapViewport): PinMapViewRequest => ({
  southWestLat: roundCoordinate(viewport.bounds.southWest.lat),
  southWestLng: roundCoordinate(viewport.bounds.southWest.lng),
  northEastLat: roundCoordinate(viewport.bounds.northEast.lat),
  northEastLng: roundCoordinate(viewport.bounds.northEast.lng),
  zoomLevel: normalizeMapZoom(viewport.zoom),
});

/** 메인 지도 화면의 viewport 기반 클러스터&핀 조회. 줌 레벨과 무관하게 항상 조회한다. */
export function usePinMapView(viewport: MapViewport | null) {
  const request = viewport ? toPinMapViewRequest(viewport) : null;

  return useQuery({
    queryKey: ['pins', 'map-view', request],
    queryFn: ({ signal }) => {
      if (!request) throw new Error('지도 viewport가 필요합니다.');
      return getPinMapView(request, { signal });
    },
    enabled: request !== null,
    placeholderData: keepPreviousData,
    staleTime: 15_000,
    retry: 1,
  });
}

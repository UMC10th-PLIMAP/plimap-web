import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { getMapPins, type MapPinsRequest } from '@/api/pin';
import type { MapViewport } from '@/features/map/types';

const COORDINATE_PRECISION = 6;
const MIN_API_ZOOM = 1;
const MAX_API_ZOOM = 20;

const roundCoordinate = (value: number) => Number(value.toFixed(COORDINATE_PRECISION));

const toMapPinsRequest = (viewport: MapViewport): MapPinsRequest => ({
  southWestLat: roundCoordinate(viewport.bounds.southWest.lat),
  southWestLng: roundCoordinate(viewport.bounds.southWest.lng),
  northEastLat: roundCoordinate(viewport.bounds.northEast.lat),
  northEastLng: roundCoordinate(viewport.bounds.northEast.lng),
  zoomLevel: Math.min(MAX_API_ZOOM, Math.max(MIN_API_ZOOM, Math.round(viewport.zoom))),
});

export function useMapPins(viewport: MapViewport | null) {
  const request = viewport ? toMapPinsRequest(viewport) : null;

  return useQuery({
    queryKey: ['pins', 'map', request],
    queryFn: () => {
      if (!request) throw new Error('지도 viewport가 필요합니다.');
      return getMapPins(request);
    },
    enabled: Boolean(request),
    placeholderData: keepPreviousData,
    staleTime: 15_000,
    retry: 1,
  });
}

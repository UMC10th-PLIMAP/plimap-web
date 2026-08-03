import { useEffect, useRef, type RefObject } from 'react';

import type { MapCoordinate } from '@/features/map/types';
import type { PinRadiusCenter } from '@/features/pin/components/PinRadiusOverlay';

type UseCoordinateProjectionParams = {
  mapInstanceRef: RefObject<google.maps.Map | null>;
  isLoaded: boolean;
  coordinate?: MapCoordinate | null;
  radiusMeters?: number;
  onProjected?: (center: PinRadiusCenter | null) => void;
};

const EARTH_RADIUS_METERS = 6_378_137;

const getLongitudeOffset = (latitude: number, distanceMeters: number) => {
  const latitudeRadians = (latitude * Math.PI) / 180;
  const longitudeRadians = distanceMeters / (EARTH_RADIUS_METERS * Math.cos(latitudeRadians));
  return (longitudeRadians * 180) / Math.PI;
};

export function useCoordinateProjection({
  mapInstanceRef,
  isLoaded,
  coordinate,
  radiusMeters,
  onProjected,
}: UseCoordinateProjectionParams) {
  const coordinateRef = useRef(coordinate);
  const radiusMetersRef = useRef(radiusMeters);
  const onProjectedRef = useRef(onProjected);
  const overlayRef = useRef<google.maps.OverlayView | null>(null);

  useEffect(() => {
    coordinateRef.current = coordinate;
    overlayRef.current?.draw();
  }, [coordinate]);

  useEffect(() => {
    radiusMetersRef.current = radiusMeters;
    overlayRef.current?.draw();
  }, [radiusMeters]);

  useEffect(() => {
    onProjectedRef.current = onProjected;
  }, [onProjected]);

  useEffect(() => {
    const mapsApi = window.google?.maps;
    const map = mapInstanceRef.current;
    if (!isLoaded || !mapsApi || !map || !onProjectedRef.current) return;

    class ProjectionOverlay extends mapsApi.OverlayView {
      onAdd() {
        // DOM을 추가하지 않고 지도 좌표 투영만 사용한다.
      }

      draw() {
        const target = coordinateRef.current;
        const projection = this.getProjection();
        if (!target || !projection) {
          onProjectedRef.current?.(null);
          return;
        }

        const centerPoint = projection.fromLatLngToContainerPixel(
          new mapsApi.LatLng(target.lat, target.lng),
        );
        if (!centerPoint) {
          onProjectedRef.current?.(null);
          return;
        }

        const targetRadiusMeters = radiusMetersRef.current;
        if (!targetRadiusMeters || targetRadiusMeters <= 0) {
          onProjectedRef.current?.({ x: centerPoint.x, y: centerPoint.y });
          return;
        }

        const radiusEdgePoint = projection.fromLatLngToContainerPixel(
          new mapsApi.LatLng(
            target.lat,
            target.lng + getLongitudeOffset(target.lat, targetRadiusMeters),
          ),
        );
        onProjectedRef.current?.({
          x: centerPoint.x,
          y: centerPoint.y,
          radiusPixels: radiusEdgePoint
            ? Math.hypot(radiusEdgePoint.x - centerPoint.x, radiusEdgePoint.y - centerPoint.y)
            : undefined,
        });
      }

      onRemove() {
        onProjectedRef.current?.(null);
      }
    }

    const overlay = new ProjectionOverlay();
    overlayRef.current = overlay;
    overlay.setMap(map);

    return () => {
      overlay.setMap(null);
      overlayRef.current = null;
    };
  }, [isLoaded, mapInstanceRef]);
}

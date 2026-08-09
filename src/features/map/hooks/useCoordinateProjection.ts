import { useEffect, useRef, type RefObject } from 'react';

import type { MapCoordinate } from '@/features/map/types';

type UseCoordinateProjectionParams = {
  mapInstanceRef: RefObject<google.maps.Map | null>;
  isLoaded: boolean;
  coordinate?: MapCoordinate | null;
  radiusMeters?: number;
  targetElementRef?: RefObject<HTMLElement | null>;
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
  targetElementRef,
}: UseCoordinateProjectionParams) {
  const coordinateRef = useRef(coordinate);
  const radiusMetersRef = useRef(radiusMeters);
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
    const mapsApi = window.google?.maps;
    const map = mapInstanceRef.current;
    if (!isLoaded || !mapsApi || !map || !targetElementRef) return;
    const projectionTargetRef = targetElementRef;

    const clearProjectionStyle = () => {
      const targetElement = projectionTargetRef.current;
      targetElement?.style.removeProperty('--pin-radius-center-x');
      targetElement?.style.removeProperty('--pin-radius-center-y');
      targetElement?.style.removeProperty('--pin-radius-diameter');
    };

    class ProjectionOverlay extends mapsApi.OverlayView {
      onAdd() {
        // DOM을 추가하지 않고 지도 좌표 투영만 사용한다.
      }

      draw() {
        const target = coordinateRef.current;
        const targetElement = projectionTargetRef.current;
        const projection = this.getProjection();
        if (!target || !targetElement || !projection) return;

        const centerPoint = projection.fromLatLngToContainerPixel(
          new mapsApi.LatLng(target.lat, target.lng),
        );
        if (!centerPoint) return;

        targetElement.style.setProperty('--pin-radius-center-x', `${centerPoint.x}px`);
        targetElement.style.setProperty('--pin-radius-center-y', `${centerPoint.y}px`);

        const targetRadiusMeters = radiusMetersRef.current;
        if (!targetRadiusMeters || targetRadiusMeters <= 0) {
          targetElement.style.removeProperty('--pin-radius-diameter');
          return;
        }

        const radiusEdgePoint = projection.fromLatLngToContainerPixel(
          new mapsApi.LatLng(
            target.lat,
            target.lng + getLongitudeOffset(target.lat, targetRadiusMeters),
          ),
        );
        if (!radiusEdgePoint) {
          targetElement.style.removeProperty('--pin-radius-diameter');
          return;
        }

        const radiusPixels = Math.hypot(
          radiusEdgePoint.x - centerPoint.x,
          radiusEdgePoint.y - centerPoint.y,
        );
        targetElement.style.setProperty('--pin-radius-diameter', `${radiusPixels * 2}px`);
      }

      onRemove() {
        clearProjectionStyle();
      }
    }

    const overlay = new ProjectionOverlay();
    overlayRef.current = overlay;
    overlay.setMap(map);

    return () => {
      overlay.setMap(null);
      overlayRef.current = null;
    };
  }, [isLoaded, mapInstanceRef, targetElementRef]);
}

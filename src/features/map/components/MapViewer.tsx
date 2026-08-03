import { forwardRef, useImperativeHandle } from 'react';
import { MapCoordinate, MapPlace, MapPin, MapViewport } from '../types';
import { useGoogleMap } from '../hooks/useGoogleMap';
import { useCurrentLocationMarker } from '../hooks/useCurrentLocationMarker';
import { useMapPinOverlays } from '../hooks/useMapPinOverlays';
import { usePlaceMarkers } from '../hooks/usePlaceMarkers';
import { useCoordinateProjection } from '../hooks/useCoordinateProjection';
import type { PinRadiusCenter } from '@/features/pin/components/PinRadiusOverlay';

type MapViewerProps = {
  isLoaded: boolean;
  isInteractionDisabled?: boolean;
  zoom: number;
  initialCenter?: MapCoordinate;
  placeResults: MapPlace[];
  selectedPlaceId: string | null;
  mapPins: MapPin[];
  selectedMapPinId: string | null;
  projectionCoordinate?: MapCoordinate | null;
  projectionRadiusMeters?: number;
  centerOnFirstLocation?: boolean;
  onZoomChanged?: (newZoom: number) => void;
  onCenterChanged?: (center: MapCoordinate) => void;
  onCurrentLocationChanged?: (coordinate: MapCoordinate) => void;
  onCurrentLocationError?: (message: string) => void;
  onViewportChanged?: (viewport: MapViewport) => void;
  onProjectionChanged?: (center: PinRadiusCenter | null) => void;
  onSelectPlace?: (placeId: string) => void;
  onSelectMapPin?: (pinId: string) => void;
  onPlayPin?: (pinId: string) => void;
  /** 핀이 아닌 지도의 빈 영역을 클릭했을 때 호출된다. */
  onMapClick?: () => void;
};

export type MapViewerHandle = {
  /** 지도를 현재 위치 마커로 이동시킨다. 위치를 아직 못 받았으면 아무 동작도 하지 않는다. */
  recenterToCurrentLocation: () => void;
  panTo: (coordinate: MapCoordinate, options?: { notifyCenterChanged?: boolean }) => void;
};

export const MapViewer = forwardRef<MapViewerHandle, MapViewerProps>(function MapViewer(
  {
    isLoaded,
    isInteractionDisabled = false,
    zoom,
    initialCenter,
    placeResults,
    selectedPlaceId,
    mapPins,
    selectedMapPinId,
    projectionCoordinate,
    projectionRadiusMeters,
    centerOnFirstLocation = true,
    onZoomChanged,
    onCenterChanged,
    onCurrentLocationChanged,
    onCurrentLocationError,
    onViewportChanged,
    onProjectionChanged,
    onSelectPlace,
    onSelectMapPin,
    onPlayPin,
    onMapClick,
  },
  ref,
) {
  const { mapRef, mapInstanceRef, panTo } = useGoogleMap({
    isLoaded,
    isInteractionDisabled,
    zoom,
    initialCenter,
    onZoomChanged,
    onCenterChanged,
    onViewportChanged,
    onMapClick,
  });

  const { recenterToCurrentLocation } = useCurrentLocationMarker({
    mapInstanceRef,
    isLoaded,
    onCenterChanged,
    onCurrentLocationChanged,
    onCurrentLocationError,
    centerOnFirstLocation,
  });

  useImperativeHandle(
    ref,
    () => ({
      recenterToCurrentLocation,
      panTo,
    }),
    [panTo, recenterToCurrentLocation],
  );

  usePlaceMarkers({ mapInstanceRef, isLoaded, placeResults, selectedPlaceId, onSelectPlace });
  useMapPinOverlays({
    mapInstanceRef,
    isLoaded,
    mapPins,
    selectedMapPinId,
    onSelectMapPin,
    onPlayPin,
  });
  useCoordinateProjection({
    mapInstanceRef,
    isLoaded,
    coordinate: projectionCoordinate,
    radiusMeters: projectionRadiusMeters,
    onProjected: onProjectionChanged,
  });

  return (
    <main className="relative h-full w-full">
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#1c2128]">
          <span className="text-[#9A9A9A]">Loading Google Maps...</span>
        </div>
      )}
      <div ref={mapRef} className="h-full w-full" />
    </main>
  );
});

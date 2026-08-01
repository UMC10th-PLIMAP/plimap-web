import { forwardRef, useImperativeHandle } from 'react';
import { MapCluster, MapCoordinate, MapPlace, MapPin, MapViewport } from '../types';
import { useGoogleMap } from '../hooks/useGoogleMap';
import { useCurrentLocationMarker } from '../hooks/useCurrentLocationMarker';
import { useMapPinOverlays } from '../hooks/useMapPinOverlays';
import { usePlaceMarkers } from '../hooks/usePlaceMarkers';
import { useMapClusterOverlays } from '../hooks/useMapClusterOverlays';
import { useCoordinateProjection } from '../hooks/useCoordinateProjection';
import type { PinRadiusCenter } from '@/features/pin/components/PinRadiusOverlay';

type MapViewerProps = {
  isLoaded: boolean;
  zoom: number;
  initialCenter?: MapCoordinate;
  placeResults: MapPlace[];
  selectedPlaceId: string | null;
  mapPins: MapPin[];
  mapClusters?: MapCluster[];
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
  onSelectCluster?: (cluster: MapCluster) => void;
};

export type MapViewerHandle = {
  /** 지도를 현재 위치 마커로 이동시킨다. 위치를 아직 못 받았으면 아무 동작도 하지 않는다. */
  recenterToCurrentLocation: () => void;
  fitBounds: (bounds: MapCluster['bounds']) => void;
};

export const MapViewer = forwardRef<MapViewerHandle, MapViewerProps>(function MapViewer(
  {
    isLoaded,
    zoom,
    initialCenter,
    placeResults,
    selectedPlaceId,
    mapPins,
    mapClusters = [],
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
    onSelectCluster,
  },
  ref,
) {
  const { mapRef, mapInstanceRef } = useGoogleMap({
    isLoaded,
    zoom,
    initialCenter,
    onZoomChanged,
    onCenterChanged,
    onViewportChanged,
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
      fitBounds: (bounds) => {
        mapInstanceRef.current?.fitBounds({
          south: bounds.southWest.lat,
          west: bounds.southWest.lng,
          north: bounds.northEast.lat,
          east: bounds.northEast.lng,
        });
      },
    }),
    [mapInstanceRef, recenterToCurrentLocation],
  );

  usePlaceMarkers({ mapInstanceRef, isLoaded, placeResults, selectedPlaceId, onSelectPlace });
  useMapPinOverlays({ mapInstanceRef, isLoaded, mapPins, selectedMapPinId, onSelectMapPin });
  useMapClusterOverlays({
    mapInstanceRef,
    isLoaded,
    clusters: mapClusters,
    onSelectCluster,
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

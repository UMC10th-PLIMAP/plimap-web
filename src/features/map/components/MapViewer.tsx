import { forwardRef, useImperativeHandle, type RefObject } from 'react';
import { MapCoordinate, MapPlace, MapPin, MapViewport, PinCluster } from '../types';
import { useGoogleMap } from '../hooks/useGoogleMap';
import { useCurrentLocationMarker } from '../hooks/useCurrentLocationMarker';
import { useMapPinOverlays } from '../hooks/useMapPinOverlays';
import { useClusterOverlays } from '../hooks/useClusterOverlays';
import { usePlaceMarkers } from '../hooks/usePlaceMarkers';
import { useCoordinateProjection } from '../hooks/useCoordinateProjection';

type MapViewerProps = {
  isLoaded: boolean;
  isInteractionDisabled?: boolean;
  isLocationTrackingDisabled?: boolean;
  zoom: number;
  initialCenter?: MapCoordinate;
  placeResults: MapPlace[];
  selectedPlaceId: string | null;
  mapPins: MapPin[];
  mapClusters?: PinCluster[];
  selectedMapPinId: string | null;
  projectionCoordinate?: MapCoordinate | null;
  projectionRadiusMeters?: number;
  projectionTargetRef?: RefObject<HTMLElement | null>;
  centerOnFirstLocation?: boolean;
  onZoomChanged?: (newZoom: number) => void;
  onCenterChanged?: (center: MapCoordinate) => void;
  onCurrentLocationChanged?: (coordinate: MapCoordinate) => void;
  onCurrentLocationError?: (message: string) => void;
  onViewportChanged?: (viewport: MapViewport) => void;
  onSelectPlace?: (placeId: string) => void;
  onSelectMapPin?: (pinId: string) => void;
  onPlayPin?: (pinId: string) => void;
  playingMapPinId?: string | null;
  /** 핀이 아닌 지도의 빈 영역을 클릭했을 때 호출된다. */
  onMapClick?: () => void;
  /** 사용자가 지도를 드래그(패닝)하기 시작했을 때 호출된다. */
  onMapDragStart?: () => void;
  /** 장소가 1개뿐인 클러스터를 눌러 줌 21로 이동을 마쳤을 때 호출된다. */
  onSingleClusterArrive?: (position: MapCoordinate) => void;
  /** 북마크 강조 모드 on/off. 켜져 있으면 hasBookmarkedPlace인 핀/클러스터 색이 바뀐다. */
  isBookmarkHighlightOn?: boolean;
};

export type MapViewerHandle = {
  /** 지도를 현재 위치 마커로 이동시킨다. 위치가 준비되지 않았으면 false를 반환한다. */
  recenterToCurrentLocation: () => boolean;
  panTo: (coordinate: MapCoordinate, options?: { notifyCenterChanged?: boolean }) => void;
  flyTo: (position: MapCoordinate, targetZoom: number, onArrive?: () => void) => void;
  restoreViewport: (viewport: MapViewport) => void;
  captureViewport: () => MapViewport | null;
};

export const MapViewer = forwardRef<MapViewerHandle, MapViewerProps>(function MapViewer(
  {
    isLoaded,
    isInteractionDisabled = false,
    isLocationTrackingDisabled = false,
    zoom,
    initialCenter,
    placeResults,
    selectedPlaceId,
    mapPins,
    mapClusters = [],
    selectedMapPinId,
    projectionCoordinate,
    projectionRadiusMeters,
    projectionTargetRef,
    centerOnFirstLocation = true,
    onZoomChanged,
    onCenterChanged,
    onCurrentLocationChanged,
    onCurrentLocationError,
    onViewportChanged,
    onSelectPlace,
    onSelectMapPin,
    onPlayPin,
    playingMapPinId = null,
    onMapClick,
    onMapDragStart,
    onSingleClusterArrive,
    isBookmarkHighlightOn = false,
  },
  ref,
) {
  const { mapRef, mapInstanceRef, panTo, restoreViewport, captureViewport, flyTo, fitToBounds } =
    useGoogleMap({
      isLoaded,
      isInteractionDisabled,
      zoom,
      initialCenter,
      onZoomChanged,
      onCenterChanged,
      onViewportChanged,
      onMapClick,
      onMapDragStart,
    });

  const { recenterToCurrentLocation } = useCurrentLocationMarker({
    mapInstanceRef,
    isLoaded,
    onCenterChanged,
    onCurrentLocationChanged,
    onCurrentLocationError,
    centerOnFirstLocation,
    isTrackingEnabled: !isLocationTrackingDisabled,
  });

  useImperativeHandle(
    ref,
    () => ({
      recenterToCurrentLocation,
      panTo,
      flyTo,
      restoreViewport,
      captureViewport,
    }),
    [captureViewport, flyTo, panTo, recenterToCurrentLocation, restoreViewport],
  );

  usePlaceMarkers({ mapInstanceRef, isLoaded, placeResults, selectedPlaceId, onSelectPlace });
  useMapPinOverlays({
    mapInstanceRef,
    isLoaded,
    mapPins,
    selectedMapPinId,
    zoom,
    playingMapPinId,
    flyTo,
    onSelectMapPin,
    onPlayPin,
    isBookmarkHighlightOn,
  });
  useClusterOverlays({
    mapInstanceRef,
    isLoaded,
    clusters: mapClusters,
    zoom,
    flyTo,
    fitToBounds,
    onSingleClusterArrive,
    isBookmarkHighlightOn,
  });
  useCoordinateProjection({
    mapInstanceRef,
    isLoaded,
    coordinate: projectionCoordinate,
    radiusMeters: projectionRadiusMeters,
    targetElementRef: projectionTargetRef,
  });

  return (
    <main className="relative h-full w-full">
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#1c2128]">
          <span className="text-[#9A9A9A]">Loading Google Maps...</span>
        </div>
      )}
      <div
        ref={mapRef}
        className="h-full w-full touch-none"
        // Keep Chrome from claiming an in-progress map pinch for viewport zoom.
        // Google Maps owns the gesture through gestureHandling: 'greedy'.
      />
    </main>
  );
});

import { forwardRef, useImperativeHandle } from 'react';
import { MapCoordinate, MapPlace, MapPin } from '../types';
import { useGoogleMap } from '../hooks/useGoogleMap';
import { useCurrentLocationMarker } from '../hooks/useCurrentLocationMarker';
import { useMapPinOverlays } from '../hooks/useMapPinOverlays';
import { usePlaceMarkers } from '../hooks/usePlaceMarkers';

type MapViewerProps = {
  isLoaded: boolean;
  zoom: number;
  placeResults: MapPlace[];
  selectedPlaceId: string | null;
  mapPins: MapPin[];
  selectedMapPinId: string | null;
  onZoomChanged?: (newZoom: number) => void;
  onCenterChanged?: (center: MapCoordinate) => void;
  onSelectPlace?: (placeId: string) => void;
  onSelectMapPin?: (pinId: string) => void;
};

export type MapViewerHandle = {
  /** 지도를 현재 위치 마커로 이동시킨다. 위치를 아직 못 받았으면 아무 동작도 하지 않는다. */
  recenterToCurrentLocation: () => void;
};

export const MapViewer = forwardRef<MapViewerHandle, MapViewerProps>(function MapViewer(
  {
    isLoaded,
    zoom,
    placeResults,
    selectedPlaceId,
    mapPins,
    selectedMapPinId,
    onZoomChanged,
    onCenterChanged,
    onSelectPlace,
    onSelectMapPin,
  },
  ref,
) {
  const { mapRef, mapInstanceRef } = useGoogleMap({
    isLoaded,
    zoom,
    onZoomChanged,
    onCenterChanged,
  });

  const { recenterToCurrentLocation } = useCurrentLocationMarker({
    mapInstanceRef,
    isLoaded,
    onCenterChanged,
  });

  useImperativeHandle(ref, () => ({ recenterToCurrentLocation }), [recenterToCurrentLocation]);

  usePlaceMarkers({ mapInstanceRef, isLoaded, placeResults, selectedPlaceId, onSelectPlace });
  useMapPinOverlays({ mapInstanceRef, isLoaded, mapPins, selectedMapPinId, onSelectMapPin });

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

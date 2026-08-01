import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { MapViewer, type MapViewerHandle } from '@/features/map/components/MapViewer';
import { normalizeMapZoom, useMapPins } from '@/features/map/queries/useMapPins';
import { DEFAULT_CENTER, type MapCoordinate, type MapViewport } from '@/features/map/types';
import { calculateDistanceMeters } from '@/features/map/utils/calculateDistanceMeters';
import { loadGoogleMapsScript } from '@/features/map/utils';
import type { PinRadiusCenter } from '@/features/pin/components/PinRadiusOverlay';
import { usePinCreationStore } from '@/store/pinCreationStore';

const PIN_REGISTRATION_RADIUS_METERS = 500;

export type PinRegistrationMapStatus = 'loading' | 'ready' | 'error';

export type PinRegistrationOutletContext = {
  mapStatus: PinRegistrationMapStatus;
  zoom: number;
  radiusCenter: PinRadiusCenter | null;
  locationError: string | null;
  isOutsideAllowedRadius: boolean;
  setMapInteractionDisabled: (disabled: boolean) => void;
};

export default function PinRegistrationLayout() {
  const location = useLocation();
  const mapViewerRef = useRef<MapViewerHandle>(null);
  const candidateCoordinate = usePinCreationStore((state) => state.candidateCoordinate);
  const currentLocation = usePinCreationStore((state) => state.currentLocation);
  const place = usePinCreationStore((state) => state.place);
  const lastPannedStageRef = useRef<string | null>(null);
  const setCandidateCoordinate = usePinCreationStore((state) => state.setCandidateCoordinate);
  const setCurrentLocation = usePinCreationStore((state) => state.setCurrentLocation);

  const [mapStatus, setMapStatus] = useState<PinRegistrationMapStatus>(
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? 'loading' : 'error',
  );
  const [mapLoadAttempt, setMapLoadAttempt] = useState(0);
  const [zoom, setZoom] = useState(16);
  const [viewport, setViewport] = useState<MapViewport | null>(null);
  const [radiusCenter, setRadiusCenter] = useState<PinRadiusCenter | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isMapInteractionDisabled, setMapInteractionDisabled] = useState(false);
  const mapPinsQuery = useMapPins(viewport);

  const isSelectionStage = location.pathname === '/app/pin/register';
  const isConfirmStage = location.pathname === '/app/pin/register/confirm';
  const initialCenter = candidateCoordinate ?? place?.coordinates ?? DEFAULT_CENTER;
  const normalizedZoom = normalizeMapZoom(zoom);
  const displayedMapZoom = mapPinsQuery.data?.zoomLevel ?? normalizedZoom;
  const isOutsideAllowedRadius =
    currentLocation !== null &&
    candidateCoordinate !== null &&
    calculateDistanceMeters(currentLocation, candidateCoordinate) > PIN_REGISTRATION_RADIUS_METERS;

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) return;

    let disposed = false;
    loadGoogleMapsScript(apiKey)
      .then(() => {
        if (!disposed) setMapStatus('ready');
      })
      .catch(() => {
        if (!disposed) setMapStatus('error');
      });

    return () => {
      disposed = true;
    };
  }, [mapLoadAttempt]);

  useEffect(() => {
    if (mapStatus !== 'ready') return;

    const stageKey = `${mapStatus}:${location.pathname}`;
    if (lastPannedStageRef.current === stageKey) return;
    lastPannedStageRef.current = stageKey;

    const targetCoordinate = isConfirmStage
      ? place?.coordinates
      : isSelectionStage
        ? candidateCoordinate
        : null;
    if (targetCoordinate) {
      mapViewerRef.current?.panTo(targetCoordinate, { notifyCenterChanged: false });
    }
  }, [candidateCoordinate, isConfirmStage, isSelectionStage, location.pathname, mapStatus, place]);

  const handleRetryMapLoad = () => {
    document.getElementById('google-maps-script')?.remove();
    setMapStatus('loading');
    setMapLoadAttempt((attempt) => attempt + 1);
  };

  const handleCurrentLocationChanged = (coordinate: MapCoordinate) => {
    setLocationError(null);
    setCurrentLocation(coordinate);
  };

  const handleViewportChanged = (nextViewport: MapViewport) => {
    setViewport(nextViewport);
  };

  const handleCenterChanged = (coordinate: MapCoordinate) => {
    if (isSelectionStage) setCandidateCoordinate(coordinate);
  };

  const outletContext = {
    mapStatus,
    zoom,
    radiusCenter,
    locationError,
    isOutsideAllowedRadius,
    setMapInteractionDisabled,
  } satisfies PinRegistrationOutletContext;

  return (
    <main className="relative h-full overflow-hidden bg-pli-black-85">
      <MapViewer
        ref={mapViewerRef}
        isLoaded={mapStatus === 'ready'}
        isInteractionDisabled={isMapInteractionDisabled}
        zoom={zoom}
        initialCenter={initialCenter}
        centerOnFirstLocation={!candidateCoordinate}
        placeResults={[]}
        selectedPlaceId={null}
        mapPins={displayedMapZoom >= 14 ? (mapPinsQuery.data?.pins ?? []) : []}
        mapClusters={displayedMapZoom < 14 ? (mapPinsQuery.data?.clusters ?? []) : []}
        selectedMapPinId={null}
        projectionCoordinate={isSelectionStage ? currentLocation : null}
        projectionRadiusMeters={PIN_REGISTRATION_RADIUS_METERS}
        onZoomChanged={setZoom}
        onCurrentLocationChanged={handleCurrentLocationChanged}
        onCurrentLocationError={setLocationError}
        onCenterChanged={handleCenterChanged}
        onViewportChanged={handleViewportChanged}
        onProjectionChanged={setRadiusCenter}
        onSelectCluster={(cluster) => mapViewerRef.current?.fitBounds(cluster.bounds)}
      />

      {mapStatus !== 'ready' ? (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-pli-black-85 px-6 text-center body-15-r text-grayscale-400">
          <p>
            {mapStatus === 'loading'
              ? '지도를 불러오고 있어요.'
              : '지도를 불러오지 못했어요. 잠시 후 다시 시도해주세요.'}
          </p>
          {mapStatus === 'error' && import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? (
            <button
              type="button"
              className="rounded-full bg-neon px-6 py-3 body-15-sb text-grayscale-1250"
              onClick={handleRetryMapLoad}
            >
              다시 시도
            </button>
          ) : null}
        </div>
      ) : null}

      {isMapInteractionDisabled ? (
        <div
          aria-hidden="true"
          className="pointer-events-auto absolute inset-0 z-[25] touch-none"
        />
      ) : null}

      <div className="pointer-events-none absolute inset-0 z-30">
        <Outlet context={outletContext} />
      </div>
    </main>
  );
}

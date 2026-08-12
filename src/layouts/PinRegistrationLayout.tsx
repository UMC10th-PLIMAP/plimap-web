import { useEffect, useRef, useState, type RefObject } from 'react';
import { Outlet, useLocation, useMatch, useOutletContext } from 'react-router-dom';

import { MapViewer, type MapViewerHandle } from '@/features/map/components/MapViewer';
import { usePinMapView } from '@/features/map/queries/usePinMapView';
import { DEFAULT_CENTER, type MapCoordinate, type MapViewport } from '@/features/map/types';
import { loadGoogleMapsScript } from '@/features/map/utils';
import type { MapOutletContext } from '@/layouts/MapLayout';
import { usePinCreationStore } from '@/store/pinCreationStore';

const PIN_REGISTRATION_RADIUS_METERS = 500;
const PIN_MARKER_MIN_ZOOM = 14;

export type PinRegistrationMapStatus = 'loading' | 'ready' | 'error';

export type PinRegistrationOutletContext = {
  mainMapCurrentLocation: MapCoordinate | null;
  mapStatus: PinRegistrationMapStatus;
  zoom: number;
  radiusElementRef: RefObject<HTMLDivElement | null>;
  locationError: string | null;
  setMapInteractionDisabled: (disabled: boolean) => void;
};

export default function PinRegistrationLayout() {
  const { currentLocation: mainMapCurrentLocation } = useOutletContext<MapOutletContext>();
  const location = useLocation();
  const mapViewerRef = useRef<MapViewerHandle>(null);
  const radiusElementRef = useRef<HTMLDivElement>(null);
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
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isMapInteractionDisabled, setMapInteractionDisabled] = useState(false);

  const isEntryStage = useMatch('/app/pin/register/place') !== null;
  const isSelectionStage = useMatch('/app/pin/register') !== null;
  const isConfirmStage = useMatch('/app/pin/register/confirm') !== null;
  const mapPinsQuery = usePinMapView(isEntryStage ? null : viewport, {
    minimumZoom: PIN_MARKER_MIN_ZOOM,
  });
  const isMapInteractionLocked = isMapInteractionDisabled || isConfirmStage;
  const stageTargetCoordinate = isConfirmStage
    ? (candidateCoordinate ?? place?.coordinates)
    : isSelectionStage
      ? candidateCoordinate
      : isEntryStage
        ? (currentLocation ?? mainMapCurrentLocation)
        : null;
  const initialCenter =
    candidateCoordinate ??
    place?.coordinates ??
    currentLocation ??
    mainMapCurrentLocation ??
    DEFAULT_CENTER;
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
    if (mapStatus !== 'ready' || !stageTargetCoordinate) return;

    const stageKey = location.pathname;
    if (lastPannedStageRef.current === stageKey) return;
    lastPannedStageRef.current = stageKey;
    mapViewerRef.current?.panTo(stageTargetCoordinate, { notifyCenterChanged: false });
  }, [location.pathname, mapStatus, stageTargetCoordinate]);

  const handleRetryMapLoad = () => {
    document.getElementById('google-maps-script')?.remove();
    setMapStatus('loading');
    setMapLoadAttempt((attempt) => attempt + 1);
  };

  const handleCurrentLocationChanged = (coordinate: MapCoordinate | null) => {
    setCurrentLocation(coordinate);
    if (!coordinate) return;

    setLocationError(null);
    if (isSelectionStage && !candidateCoordinate) setCandidateCoordinate(coordinate);
  };

  const handleCenterChanged = (coordinate: MapCoordinate) => {
    if (!isSelectionStage || !currentLocation) return;
    setCandidateCoordinate(coordinate);
  };

  const outletContext = {
    mainMapCurrentLocation,
    mapStatus,
    zoom,
    radiusElementRef,
    locationError,
    setMapInteractionDisabled,
  } satisfies PinRegistrationOutletContext;

  return (
    <main className="relative h-full overflow-hidden bg-pli-black-85">
      <MapViewer
        ref={mapViewerRef}
        isLoaded={mapStatus === 'ready'}
        isInteractionDisabled={isEntryStage || isMapInteractionLocked}
        isLocationTrackingDisabled={isEntryStage}
        zoom={zoom}
        initialCenter={initialCenter}
        centerOnFirstLocation={!candidateCoordinate}
        placeResults={[]}
        selectedPlaceId={null}
        mapPins={mapPinsQuery.data?.pins ?? []}
        areMapPinsDimmed
        selectedMapPinId={null}
        projectionCoordinate={isSelectionStage ? currentLocation : null}
        projectionRadiusMeters={PIN_REGISTRATION_RADIUS_METERS}
        projectionTargetRef={radiusElementRef}
        onZoomChanged={setZoom}
        onCurrentLocationChanged={handleCurrentLocationChanged}
        onCurrentLocationError={setLocationError}
        onCenterChanged={handleCenterChanged}
        onViewportChanged={setViewport}
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

      {isMapInteractionLocked ? (
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

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { validatePinAvailability } from '@/api/pin';
import { confirmMapSelection } from '@/api/place';
import { MapViewer, type MapViewerHandle } from '@/features/map/components/MapViewer';
import { useMapPins } from '@/features/map/queries/useMapPins';
import { DEFAULT_CENTER, type MapCoordinate, type MapViewport } from '@/features/map/types';
import { calculateDistanceMeters } from '@/features/map/utils/calculateDistanceMeters';
import { reverseGeocode } from '@/features/map/utils/reverseGeocode';
import { loadGoogleMapsScript } from '@/features/map/utils';
import { PinCandidateMarker } from '@/features/pin/components/PinCandidateMarker';
import { PinRadiusOverlay, type PinRadiusCenter } from '@/features/pin/components/PinRadiusOverlay';
import { usePinCreationStore } from '@/store/pinCreationStore';

type MapLoadStatus = 'loading' | 'ready' | 'error';

const PIN_REGISTRATION_RADIUS_METERS = 500;

const availabilityMessage = (status: 'OUT_OF_RANGE' | 'TOO_CLOSE_TO_PIN') =>
  status === 'OUT_OF_RANGE'
    ? '현재 위치에서 500m 이내에 PIN을 등록해 주세요'
    : '이미 근처 20m 이내에 PIN이 있어요';

export default function PinRegisterPage() {
  const navigate = useNavigate();
  const mapViewerRef = useRef<MapViewerHandle>(null);
  const candidateCoordinate = usePinCreationStore((state) => state.candidateCoordinate);
  const currentLocation = usePinCreationStore((state) => state.currentLocation);
  const setCandidateCoordinate = usePinCreationStore((state) => state.setCandidateCoordinate);
  const setCurrentLocation = usePinCreationStore((state) => state.setCurrentLocation);
  const setSearchKeyword = usePinCreationStore((state) => state.setSearchKeyword);
  const setPlace = usePinCreationStore((state) => state.setPlace);
  const reset = usePinCreationStore((state) => state.reset);

  const [mapStatus, setMapStatus] = useState<MapLoadStatus>(
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? 'loading' : 'error',
  );
  const [mapLoadAttempt, setMapLoadAttempt] = useState(0);
  const [zoom, setZoom] = useState(16);
  const [viewport, setViewport] = useState<MapViewport | null>(null);
  const [radiusCenter, setRadiusCenter] = useState<PinRadiusCenter | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const mapPinsQuery = useMapPins(viewport);
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

  const handleRetryMapLoad = () => {
    document.getElementById('google-maps-script')?.remove();
    setMapStatus('loading');
    setMapLoadAttempt((attempt) => attempt + 1);
  };

  const handleCancel = () => {
    reset();
    navigate('/app', { replace: true });
  };

  const handleCurrentLocationChanged = (coordinate: MapCoordinate) => {
    setLocationError(null);
    setCurrentLocation(coordinate);
  };

  const handleViewportChanged = (nextViewport: MapViewport) => {
    setViewport(nextViewport);
    setCandidateCoordinate(nextViewport.center);
  };

  const handleComplete = async () => {
    if (isCompleting || isOutsideAllowedRadius) return;
    setFeedbackMessage(null);

    if (!currentLocation || !candidateCoordinate) {
      setFeedbackMessage(
        locationError ?? '현재 위치를 확인하고 있어요. 잠시 후 다시 시도해 주세요',
      );
      return;
    }

    setIsCompleting(true);
    try {
      const availability = await validatePinAvailability({
        latitude: candidateCoordinate.lat,
        longitude: candidateCoordinate.lng,
        userLatitude: currentLocation.lat,
        userLongitude: currentLocation.lng,
      });

      if (availability.status !== 'CREATABLE_NEW_PLACE') {
        setFeedbackMessage(availabilityMessage(availability.status));
        return;
      }

      if (!availability.registrable) {
        setFeedbackMessage('이 위치에는 핀을 등록할 수 없어요');
        return;
      }

      const address = await reverseGeocode(candidateCoordinate);
      const result = await confirmMapSelection({
        latitude: candidateCoordinate.lat,
        longitude: candidateCoordinate.lng,
        placeName: null,
        address,
        roadAddress: null,
      });

      if (result.status === 'PLACE_SEARCH_REQUIRED') {
        setSearchKeyword(result.buildingName);
        navigate('/app/pin/register/search');
        return;
      }

      if (result.status === 'PLACE_SEARCH_RECOMMENDED') {
        const recommended = result.recommendedPlace;
        const coordinates = { lat: recommended.latitude, lng: recommended.longitude };
        setPlace({
          placeId: recommended.placeId,
          placeName: recommended.placeName,
          address: recommended.address,
          roadAddress: recommended.roadAddress,
          source: recommended.source,
          coordinates,
          distanceMeters: calculateDistanceMeters(currentLocation, coordinates),
        });
        navigate('/app/pin/register/confirm');
        return;
      }

      const confirmed = result.mapSelection;
      const coordinates = { lat: confirmed.latitude, lng: confirmed.longitude };
      setPlace({
        placeId: confirmed.placeId,
        placeName: confirmed.placeName,
        address,
        roadAddress: null,
        source: confirmed.source,
        coordinates,
        distanceMeters: availability.distanceFromUserMeters,
      });
      navigate('/app/pin/register/confirm');
    } catch (error) {
      setFeedbackMessage(
        error instanceof Error ? error.message : '선택한 위치를 확인하지 못했어요.',
      );
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <main className="relative h-full overflow-hidden bg-pli-black-85">
      <MapViewer
        ref={mapViewerRef}
        isLoaded={mapStatus === 'ready'}
        zoom={zoom}
        initialCenter={candidateCoordinate ?? DEFAULT_CENTER}
        centerOnFirstLocation={!candidateCoordinate}
        placeResults={[]}
        selectedPlaceId={null}
        mapPins={zoom >= 14 ? (mapPinsQuery.data?.pins ?? []) : []}
        mapClusters={zoom < 14 ? (mapPinsQuery.data?.clusters ?? []) : []}
        selectedMapPinId={null}
        projectionCoordinate={currentLocation}
        projectionRadiusMeters={PIN_REGISTRATION_RADIUS_METERS}
        onZoomChanged={setZoom}
        onCurrentLocationChanged={handleCurrentLocationChanged}
        onCurrentLocationError={setLocationError}
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
              className="pointer-events-auto rounded-full bg-neon px-6 py-3 body-15-sb text-grayscale-1250"
              onClick={handleRetryMapLoad}
            >
              다시 시도
            </button>
          ) : null}
        </div>
      ) : null}

      {mapStatus === 'ready' ? (
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-[35] -translate-x-1/2 -translate-y-1/2">
          <PinCandidateMarker />
        </div>
      ) : null}

      <PinRadiusOverlay
        zoom={zoom}
        centerLatitude={currentLocation?.lat ?? candidateCoordinate?.lat ?? DEFAULT_CENTER.lat}
        radiusCenter={radiusCenter ?? undefined}
        feedbackMessage={feedbackMessage}
        isCompleting={isCompleting}
        isCompleteDisabled={mapStatus !== 'ready' || isOutsideAllowedRadius}
        showRadius={Boolean(currentLocation && radiusCenter)}
        onCancel={handleCancel}
        onComplete={() => void handleComplete()}
      />
    </main>
  );
}

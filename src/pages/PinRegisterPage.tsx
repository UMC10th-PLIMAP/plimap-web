import { useEffect, useRef, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';

import { isApiRequestCanceled } from '@/api/client';
import { validatePinAvailability } from '@/api/pin';
import { confirmMapSelection } from '@/api/place';
import { calculateDistanceMeters } from '@/features/map/utils/calculateDistanceMeters';
import { reverseGeocode } from '@/features/map/utils/reverseGeocode';
import { PinCandidateMarker } from '@/features/pin/components/PinCandidateMarker';
import { PinRadiusOverlay } from '@/features/pin/components/PinRadiusOverlay';
import type { PinRegistrationOutletContext } from '@/layouts/PinRegistrationLayout';
import { usePinCreationStore } from '@/store/pinCreationStore';

const availabilityMessage = (status: 'OUT_OF_RANGE' | 'TOO_CLOSE_TO_PIN') =>
  status === 'OUT_OF_RANGE'
    ? '현재 위치에서 500m 이내에 PIN을 등록해 주세요'
    : '이미 근처 20m 이내에 PIN이 있어요';

export default function PinRegisterPage() {
  const navigate = useNavigate();
  const {
    mapStatus,
    zoom,
    radiusElementRef,
    locationError,
    isOutsideAllowedRadius,
    setMapInteractionDisabled,
  } = useOutletContext<PinRegistrationOutletContext>();
  const candidateCoordinate = usePinCreationStore((state) => state.candidateCoordinate);
  const currentLocation = usePinCreationStore((state) => state.currentLocation);
  const setSearchKeyword = usePinCreationStore((state) => state.setSearchKeyword);
  const setPlace = usePinCreationStore((state) => state.setPlace);
  const reset = usePinCreationStore((state) => state.reset);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const requestControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      requestControllerRef.current?.abort();
      requestControllerRef.current = null;
      setMapInteractionDisabled(false);
    };
  }, [setMapInteractionDisabled]);

  const navigateToStage = (path: string) => {
    navigate(path, { viewTransition: true });
  };

  const handleCancel = () => {
    reset();
    navigate('/app', { replace: true });
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

    const controller = new AbortController();
    requestControllerRef.current = controller;
    setIsCompleting(true);
    setMapInteractionDisabled(true);
    try {
      const availability = await validatePinAvailability(
        {
          latitude: candidateCoordinate.lat,
          longitude: candidateCoordinate.lng,
          userLatitude: currentLocation.lat,
          userLongitude: currentLocation.lng,
        },
        { signal: controller.signal },
      );

      if (availability.status !== 'CREATABLE_NEW_PLACE') {
        setFeedbackMessage(availabilityMessage(availability.status));
        return;
      }

      if (!availability.registrable) {
        setFeedbackMessage('이 위치에는 핀을 등록할 수 없어요');
        return;
      }

      const address = await reverseGeocode(candidateCoordinate, { signal: controller.signal });
      const result = await confirmMapSelection(
        {
          latitude: candidateCoordinate.lat,
          longitude: candidateCoordinate.lng,
          placeName: null,
          address,
          roadAddress: null,
        },
        { signal: controller.signal },
      );

      if (result.status === 'PLACE_SEARCH_REQUIRED') {
        setSearchKeyword(result.buildingName);
        navigateToStage('/app/pin/register/search');
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
        navigateToStage('/app/pin/register/confirm');
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
      navigateToStage('/app/pin/register/confirm');
    } catch (error) {
      if (controller.signal.aborted || isApiRequestCanceled(error)) return;
      setFeedbackMessage(
        error instanceof Error ? error.message : '선택한 위치를 확인하지 못했어요.',
      );
    } finally {
      if (requestControllerRef.current === controller) {
        requestControllerRef.current = null;
        setIsCompleting(false);
        setMapInteractionDisabled(false);
      }
    }
  };

  return (
    <main
      data-page="pin-register-selection"
      className="pin-register-selection-stage relative h-full"
    >
      {mapStatus === 'ready' ? (
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-[35] -translate-x-1/2 -translate-y-1/2">
          <PinCandidateMarker />
        </div>
      ) : null}

      <PinRadiusOverlay
        zoom={zoom}
        centerLatitude={currentLocation?.lat ?? candidateCoordinate?.lat ?? 0}
        radiusElementRef={radiusElementRef}
        feedbackMessage={feedbackMessage}
        isCompleting={isCompleting}
        isCompleteDisabled={mapStatus !== 'ready' || isOutsideAllowedRadius}
        showRadius={Boolean(currentLocation)}
        onCancel={handleCancel}
        onComplete={() => void handleComplete()}
      />
    </main>
  );
}

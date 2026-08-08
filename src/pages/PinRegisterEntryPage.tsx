import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import LocationIcon from '@/assets/icons/location.svg?react';
import MapSelectionIcon from '@/assets/icons/map-selection.svg?react';
import { Toast, ToastProvider, ToastViewport } from '@/components/ui/Toast';
import { PinPlaceSearch } from '@/features/pin/components/PinPlaceSearch';
import type { PinSearchPlace } from '@/features/pin/types';
import { usePinCreationStore } from '@/store/pinCreationStore';

const MAX_REGISTRATION_DISTANCE_METERS = 500;
const VALIDATION_TOAST_DURATION_MS = 2_000;

type ValidationToast = {
  attempt: number;
  message: string;
};

export default function PinRegisterEntryPage() {
  const navigate = useNavigate();
  const reset = usePinCreationStore((state) => state.reset);
  const setCandidateCoordinate = usePinCreationStore((state) => state.setCandidateCoordinate);
  const setPlace = usePinCreationStore((state) => state.setPlace);
  const setCurrentLocation = usePinCreationStore((state) => state.setCurrentLocation);
  const currentLocation = usePinCreationStore((state) => state.currentLocation);
  const [validationToast, setValidationToast] = useState<ValidationToast | null>(null);

  const handleBack = () => {
    reset();
    navigate('/app', { replace: true });
  };

  const handleMapSelection = () => {
    const startingCoordinate = currentLocation;
    reset();
    if (startingCoordinate) {
      setCurrentLocation(startingCoordinate);
      setCandidateCoordinate(startingCoordinate);
    }
    navigate('/app/pin/register');
  };

  const handlePlaceSelect = (place: PinSearchPlace) => {
    if (place.placeId === undefined) return;

    if (!currentLocation) {
      handleValidationError('현재 위치를 확인하고 있어요. 잠시 후 다시 시도해 주세요.');
      return;
    }

    setPlace({
      placeId: place.placeId,
      placeName: place.placeName,
      address: place.address,
      roadAddress: place.searchSource?.roadAddress ?? null,
      source: place.source ?? 'PLACE_SEARCH',
      coordinates: place.coordinates,
      distanceMeters: place.distance,
    });
    navigate('/app/song/list');
  };

  const handleValidationError = (message: string) => {
    setValidationToast((currentToast) => ({
      attempt: (currentToast?.attempt ?? 0) + 1,
      message,
    }));
  };

  return (
    <ToastProvider duration={VALIDATION_TOAST_DURATION_MS}>
      <div className="relative h-full">
        <PinPlaceSearch
          autoFocus={false}
          placeholder="내가 등록할 장소는?"
          onBack={handleBack}
          validatePlace={(place) =>
            place.withinAccessRange === false || place.distance > MAX_REGISTRATION_DISTANCE_METERS
              ? '현재 위치에서 500m 이내의 장소만 선택할 수 있어요.'
              : null
          }
          onValidationError={handleValidationError}
          onCurrentLocationChanged={setCurrentLocation}
          onPlaceSelect={handlePlaceSelect}
          headerContent={
            <nav
              aria-label="핀 등록 장소 선택 방식"
              className="mb-2 grid h-[60px] shrink-0 grid-cols-2 border-b border-pli-black-50"
            >
              <button
                type="button"
                aria-current="page"
                className="flex items-center justify-center gap-2 body-15-m text-neon"
              >
                <LocationIcon className="size-5" aria-hidden />
                장소 선택
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-2 body-15-m text-grayscale-300"
                onClick={handleMapSelection}
              >
                <MapSelectionIcon className="size-[15px]" aria-hidden />
                지도에서 선택
              </button>
            </nav>
          }
        />

        <div className="pointer-events-none absolute inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+23px)] z-50 flex justify-center">
          {validationToast ? (
            <Toast key={`${validationToast.message}:${validationToast.attempt}`} defaultOpen>
              {validationToast.message}
            </Toast>
          ) : null}
          <ToastViewport />
        </div>
      </div>
    </ToastProvider>
  );
}

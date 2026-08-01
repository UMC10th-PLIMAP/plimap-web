import { Navigate, useNavigate } from 'react-router-dom';

import { PinPlaceSearch } from '@/features/pin/components/PinPlaceSearch';
import type { PinSearchPlace } from '@/features/pin/types';
import { usePinCreationStore } from '@/store/pinCreationStore';

export default function PinRegisterSearchPage() {
  const navigate = useNavigate();
  const candidateCoordinate = usePinCreationStore((state) => state.candidateCoordinate);
  const currentLocation = usePinCreationStore((state) => state.currentLocation);
  const searchKeyword = usePinCreationStore((state) => state.searchKeyword);
  const setPlace = usePinCreationStore((state) => state.setPlace);

  const navigateToStage = (path: string) => {
    navigate(path, { viewTransition: true });
  };

  if (!candidateCoordinate || !currentLocation || !searchKeyword) {
    return <Navigate to="/app/pin/register" replace />;
  }

  const handlePlaceSelect = (place: PinSearchPlace) => {
    if (place.placeId === undefined || !place.source) return;

    setPlace({
      placeId: place.placeId,
      placeName: place.placeName,
      address: place.address,
      roadAddress: place.searchSource?.roadAddress ?? null,
      source: place.source,
      coordinates: place.coordinates,
      distanceMeters: place.distance,
    });
    navigateToStage('/app/pin/register/confirm');
  };

  return (
    <div className="pin-register-search-stage pointer-events-auto h-full">
      <PinPlaceSearch
        initialQuery={searchKeyword}
        showRecentPlaces={false}
        currentLocationOverride={{
          latitude: currentLocation.lat,
          longitude: currentLocation.lng,
        }}
        onBack={() => navigateToStage('/app/pin/register')}
        validatePlace={(place) =>
          place.withinAccessRange === false
            ? '현재 위치에서 500m 이내의 장소만 선택할 수 있어요.'
            : null
        }
        onPlaceSelect={handlePlaceSelect}
      />
    </div>
  );
}

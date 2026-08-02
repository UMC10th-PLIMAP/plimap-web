import { useState } from 'react';
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';

import { PinPlaceSearch } from '@/features/pin/components/PinPlaceSearch';
import type { PinSearchPlace } from '@/features/pin/types';
import type { MapOutletContext } from '@/layouts/MapLayout';

type PinSearchLocationState = {
  fromMap?: boolean;
};

export default function PinPlaceSearchPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectMapPlace } = useOutletContext<MapOutletContext>();
  const cameFromMap = (location.state as PinSearchLocationState | null)?.fromMap === true;
  const [isReturningToMap, setIsReturningToMap] = useState(false);

  const returnToMap = () => {
    if (isReturningToMap) return;

    setIsReturningToMap(true);
  };

  const finishReturningToMap = () => {
    if (cameFromMap) {
      navigate(-1);
      return;
    }

    navigate('/app', {
      replace: true,
    });
  };

  const handlePlaceSelect = (place: PinSearchPlace) => {
    selectMapPlace(place);
    returnToMap();
  };

  return (
    <PinPlaceSearch
      isReturningToMap={isReturningToMap}
      onCloseAnimationEnd={finishReturningToMap}
      onPlaceSelect={handlePlaceSelect}
      onBack={returnToMap}
    />
  );
}

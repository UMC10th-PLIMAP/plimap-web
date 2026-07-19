import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';

import { PinPlaceSearch } from '@/features/pin/components/PinPlaceSearch';
import type { PinSearchPlace } from '@/features/pin/types';
import type { AppOutletContext } from '@/layouts/RootLayout';

type PinSearchLocationState = {
  fromMap?: boolean;
};

export default function PinPlaceSearchPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectMapPlace } = useOutletContext<AppOutletContext>();
  const cameFromMap = (location.state as PinSearchLocationState | null)?.fromMap === true;

  const returnToMap = () => {
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

  return <PinPlaceSearch onPlaceSelect={handlePlaceSelect} onBack={returnToMap} />;
}

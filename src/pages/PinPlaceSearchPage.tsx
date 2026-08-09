import { useState } from 'react';
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';

import { PinPlaceSearch } from '@/features/pin/components/PinPlaceSearch';
import type { PinSearchPlace } from '@/features/pin/types';
import type { MapOutletContext } from '@/layouts/MapLayout';

type PinSearchLocationState = {
  fromMap?: boolean;
  /** 선택된 장소의 검색어를 그대로 복원한다 - 비어있으면 최근 검색 목록이, 값이
   * 있으면 그 검색 결과가 바로 보인다. */
  initialQuery?: string;
};

export default function PinPlaceSearchPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectMapPlace } = useOutletContext<MapOutletContext>();
  const locationState = location.state as PinSearchLocationState | null;
  const cameFromMap = locationState?.fromMap === true;
  const [isReturningToMap, setIsReturningToMap] = useState(false);

  const returnToMap = () => {
    if (isReturningToMap) return;

    setIsReturningToMap(true);
  };

  // 검색어를 다 지운 상태(SearchInput이 이미 clear까지 처리한 뒤)에서만 호출된다 -
  // 새 장소를 고르지 않고 나가는 것이므로 이전 선택을 지운다.
  const handleBack = () => {
    selectMapPlace(null);
    returnToMap();
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
      initialQuery={locationState?.initialQuery ?? ''}
      onCloseAnimationEnd={finishReturningToMap}
      onPlaceSelect={handlePlaceSelect}
      onBack={handleBack}
    />
  );
}

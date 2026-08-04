import { useCallback, useState } from 'react';
import { Outlet } from 'react-router-dom';

import type { PinSearchPlace } from '@/features/pin/types';

export type AppOutletContext = {
  selectedMapPlace: PinSearchPlace | null;
  selectMapPlace: (place: PinSearchPlace | null) => void;
  selectedMapPinId: string | null;
  selectMapPin: (pinId: string | null) => void;
};

const RootLayout = () => {
  const [selectedMapPlace, setSelectedMapPlace] = useState<PinSearchPlace | null>(null);
  const [selectedMapPinId, setSelectedMapPinId] = useState<string | null>(null);
  // 장소 검색 결과 시트와 핀 탭 시트는 동시에 뜨면 안 되므로 상호 배타적으로 둔다.
  // 그렇지 않으면, 핀 탭 → 장소 검색 → 장소 시트 닫기 순서에서 남아있던
  // selectedMapPinId 때문에 핀 시트가 뜬금없이 다시 떠 버린다.
  const selectMapPlace = useCallback((place: PinSearchPlace | null) => {
    setSelectedMapPlace(place);
    setSelectedMapPinId(null);
  }, []);
  const selectMapPin = useCallback((pinId: string | null) => {
    setSelectedMapPinId(pinId);
    setSelectedMapPlace(null);
  }, []);
  const outletContext = {
    selectedMapPlace,
    selectMapPlace,
    selectedMapPinId,
    selectMapPin,
  } satisfies AppOutletContext;

  return (
    <div className="mx-auto flex h-dvh max-w-[402px] flex-col overflow-y-auto bg-pli-black-100 scrollbar-hide">
      <Outlet context={outletContext} />
    </div>
  );
};

export default RootLayout;

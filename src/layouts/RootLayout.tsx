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
  const selectMapPlace = useCallback((place: PinSearchPlace | null) => {
    setSelectedMapPlace(place);
  }, []);
  const selectMapPin = useCallback((pinId: string | null) => {
    setSelectedMapPinId(pinId);
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

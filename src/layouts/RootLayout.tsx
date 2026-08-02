import { useCallback, useState } from 'react';
import { Outlet } from 'react-router-dom';

import type { PinSearchPlace } from '@/features/pin/types';

export type AppOutletContext = {
  selectedMapPlace: PinSearchPlace | null;
  selectMapPlace: (place: PinSearchPlace | null) => void;
};

const RootLayout = () => {
  const [selectedMapPlace, setSelectedMapPlace] = useState<PinSearchPlace | null>(null);
  const selectMapPlace = useCallback((place: PinSearchPlace | null) => {
    setSelectedMapPlace(place);
  }, []);
  const outletContext = { selectedMapPlace, selectMapPlace } satisfies AppOutletContext;

  return (
    <div className="mx-auto flex h-dvh max-w-[402px] flex-col overflow-y-auto bg-pli-black-100 scrollbar-hide">
      <Outlet context={outletContext} />
    </div>
  );
};

export default RootLayout;

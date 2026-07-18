import { useCallback, useState } from 'react';
import { Outlet } from 'react-router-dom';

import type { PinSearchPlace } from '@/features/pin/types';

export type AppOutletContext = {
  selectedMapPlace: PinSearchPlace | null;
  selectMapPlace: (place: PinSearchPlace) => void;
};

const RootLayout = () => {
  const [selectedMapPlace, setSelectedMapPlace] = useState<PinSearchPlace | null>(null);
  const selectMapPlace = useCallback((place: PinSearchPlace) => {
    setSelectedMapPlace(place);
  }, []);

  return (
    <div className="max-w-[402px] h-screen mx-auto bg-pli-black-100 overflow-y-auto scrollbar-hide">
      <Outlet context={{ selectedMapPlace, selectMapPlace } satisfies AppOutletContext} />
    </div>
  );
};

export default RootLayout;

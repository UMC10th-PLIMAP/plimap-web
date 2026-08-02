import { useCallback, useState } from 'react';
import { useMatches, useOutlet } from 'react-router-dom';

import type { PinSearchPlace } from '@/features/pin/types';
import MapPage from '@/pages/MapPage';

type MapRouteHandle = {
  mapOverlay?: boolean;
};

export type MapOutletContext = {
  selectMapPlace: (place: PinSearchPlace | null) => void;
};

const MapLayout = () => {
  const [selectedMapPlace, setSelectedMapPlace] = useState<PinSearchPlace | null>(null);
  const selectMapPlace = useCallback((place: PinSearchPlace | null) => {
    setSelectedMapPlace(place);
  }, []);
  const outletContext = { selectMapPlace } satisfies MapOutletContext;
  const matches = useMatches();
  const outlet = useOutlet(outletContext);
  const hasMapOverlay = matches.some(
    ({ handle }) => (handle as MapRouteHandle | undefined)?.mapOverlay === true,
  );

  return (
    <div className="relative h-full w-full overflow-hidden">
      <MapPage selectedMapPlace={selectedMapPlace} onClearMapPlace={() => selectMapPlace(null)} />

      {hasMapOverlay && outlet ? (
        <div className="map-search-overlay absolute inset-0 z-[60]">{outlet}</div>
      ) : null}
    </div>
  );
};

export default MapLayout;

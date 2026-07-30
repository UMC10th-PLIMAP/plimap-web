import { useMatches, useOutlet, useOutletContext } from 'react-router-dom';

import type { AppOutletContext } from '@/layouts/RootLayout';
import MapPage from '@/pages/MapPage';

type MapRouteHandle = {
  mapOverlay?: boolean;
};

const MapLayout = () => {
  const appContext = useOutletContext<AppOutletContext>();
  const matches = useMatches();
  const outlet = useOutlet(appContext);
  const hasMapOverlay = matches.some(
    ({ handle }) => (handle as MapRouteHandle | undefined)?.mapOverlay === true,
  );

  return (
    <div className="relative min-h-0 w-full flex-1 overflow-hidden">
      <MapPage selectedMapPlace={appContext.selectedMapPlace} />

      {hasMapOverlay && outlet ? (
        <div className="map-search-overlay absolute inset-0 z-30">{outlet}</div>
      ) : null}
    </div>
  );
};

export default MapLayout;

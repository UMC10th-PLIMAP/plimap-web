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
    <div className="relative h-full w-full overflow-hidden">
      <MapPage selectedMapPlace={appContext.selectedMapPlace} />

      {hasMapOverlay && outlet ? <div className="absolute inset-0 z-30">{outlet}</div> : null}
    </div>
  );
};

export default MapLayout;

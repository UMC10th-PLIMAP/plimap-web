import { useMatches, useOutlet, useOutletContext } from 'react-router-dom';

import type { AppOutletContext } from '@/layouts/RootLayout';
import MapPage from '@/pages/MapPage';

type MapRouteHandle = {
  mapOverlay?: boolean;
};

export type MapOutletContext = Pick<AppOutletContext, 'selectMapPlace'>;

const MapLayout = () => {
  const appContext = useOutletContext<AppOutletContext>();
  const matches = useMatches();
  const outlet = useOutlet(appContext);
  const hasMapOverlay = matches.some(
    ({ handle }) => (handle as MapRouteHandle | undefined)?.mapOverlay === true,
  );

  return (
    <div className="relative h-full w-full overflow-hidden">
      <MapPage
        selectedMapPlace={appContext.selectedMapPlace}
        onClearMapPlace={() => appContext.selectMapPlace(null)}
      />

      {hasMapOverlay && outlet ? (
        <div className="map-search-overlay absolute inset-0 z-[60]">{outlet}</div>
      ) : null}
    </div>
  );
};

export default MapLayout;

import { useEffect, useRef, useState } from 'react';
import { useLocation, useMatches, useOutlet, useOutletContext } from 'react-router-dom';

import type { MapCoordinate, MapViewport } from '@/features/map/types';
import type { AppOutletContext } from '@/layouts/RootLayout';
import { cn } from '@/lib/utils';
import MapPage from '@/pages/MapPage';

type MapPresentation = 'visible' | 'overlay' | 'covered';

type MapRouteHandle = {
  mapPresentation?: MapPresentation;
};

export type MapOutletContext = Pick<AppOutletContext, 'selectMapPlace'> & {
  currentLocation: MapCoordinate | null;
};

const MapLayout = () => {
  const appContext = useOutletContext<AppOutletContext>();
  const { pathname } = useLocation();
  const matches = useMatches();
  const contentRef = useRef<HTMLDivElement>(null);
  const mapPresentation = matches.reduce<MapPresentation>((presentation, { handle }) => {
    return (handle as MapRouteHandle | undefined)?.mapPresentation ?? presentation;
  }, 'visible');
  const [hasVisitedMap, setHasVisitedMap] = useState(mapPresentation !== 'covered');
  const [savedMapViewport, setSavedMapViewport] = useState<MapViewport | null>(null);
  const [currentLocation, setCurrentLocation] = useState<MapCoordinate | null>(null);
  const outlet = useOutlet({ ...appContext, currentLocation });

  if (!hasVisitedMap && mapPresentation !== 'covered') setHasVisitedMap(true);

  const shouldRenderMap = hasVisitedMap || mapPresentation !== 'covered';
  const isMapCovered = mapPresentation === 'covered';
  const isMapUiActive = mapPresentation === 'visible';

  useEffect(() => {
    contentRef.current?.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="relative flex min-h-0 flex-1 overflow-hidden">
      {shouldRenderMap ? (
        <div
          className="absolute inset-0 z-0"
          aria-hidden={!isMapUiActive || undefined}
          inert={!isMapUiActive}
        >
          <MapPage
            selectedMapPlace={appContext.selectedMapPlace}
            onClearMapPlace={() => appContext.selectMapPlace(null)}
            selectedMapPinId={appContext.selectedMapPinId}
            onSelectMapPinChange={appContext.selectMapPin}
            isCovered={isMapCovered}
            isUiActive={isMapUiActive}
            savedViewport={savedMapViewport}
            onSaveViewport={setSavedMapViewport}
            onCurrentLocationChange={setCurrentLocation}
          />
        </div>
      ) : null}

      {outlet ? (
        <div
          ref={contentRef}
          className={cn(
            'absolute inset-0',
            mapPresentation === 'visible' && 'pointer-events-none z-50',
            mapPresentation === 'overlay' && 'map-search-overlay z-[60]',
            mapPresentation === 'covered' &&
              'z-[60] overflow-y-auto overscroll-contain bg-pli-black-100 scrollbar-hide',
          )}
        >
          {outlet}
        </div>
      ) : null}
    </div>
  );
};

export default MapLayout;

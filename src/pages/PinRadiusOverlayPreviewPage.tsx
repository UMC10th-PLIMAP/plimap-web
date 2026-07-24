import { useEffect, useState } from 'react';

import { MapViewer } from '@/features/map/components/MapViewer';
import { DEFAULT_CENTER } from '@/features/map/types';
import { loadGoogleMapsScript } from '@/features/map/utils';
import { PinRadiusOverlay } from '@/features/pin/components/PinRadiusOverlay';

type MapStatus = 'loading' | 'ready' | 'error';

const INITIAL_ZOOM = 15;
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim() ?? '';

export default function PinRadiusOverlayPreviewPage() {
  const [mapStatus, setMapStatus] = useState<MapStatus>(GOOGLE_MAPS_API_KEY ? 'loading' : 'error');
  const [zoom, setZoom] = useState(INITIAL_ZOOM);
  const [centerLatitude, setCenterLatitude] = useState(DEFAULT_CENTER.lat);
  const [hasNearbyPinConflict, setHasNearbyPinConflict] = useState(true);
  const [lastAction, setLastAction] = useState('Complete를 눌러 충돌 토스트를 확인하세요.');

  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) return;

    let isDisposed = false;

    loadGoogleMapsScript(GOOGLE_MAPS_API_KEY)
      .then(() => {
        if (!isDisposed) setMapStatus('ready');
      })
      .catch(() => {
        if (!isDisposed) setMapStatus('error');
      });

    return () => {
      isDisposed = true;
    };
  }, []);

  return (
    <main className="min-h-dvh bg-[#151518] px-4 py-4 text-grayscale-200 lg:flex lg:items-center lg:justify-center lg:gap-6">
      <div
        className="relative mx-auto shrink-0 overflow-hidden bg-[#252f3c] shadow-2xl lg:mx-0"
        style={{
          width: 'min(402px, calc(100vw - 32px))',
          height: 'min(874px, calc(100dvh - 32px))',
        }}
      >
        <div className="absolute inset-0">
          <MapViewer
            isLoaded={mapStatus === 'ready'}
            zoom={zoom}
            placeResults={[]}
            selectedPlaceId={null}
            mapPins={[]}
            selectedMapPinId={null}
            onZoomChanged={setZoom}
            onCenterChanged={(center) => setCenterLatitude(center.lat)}
          />
        </div>

        {mapStatus !== 'ready' && (
          <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center px-8 text-center body-15-m text-grayscale-200">
            {mapStatus === 'loading'
              ? 'Google Maps를 불러오는 중이에요.'
              : 'VITE_GOOGLE_MAPS_API_KEY를 확인해 주세요.'}
          </div>
        )}

        <PinRadiusOverlay
          zoom={zoom}
          centerLatitude={centerLatitude}
          hasNearbyPinConflict={hasNearbyPinConflict}
          onCancel={() => setLastAction('Cancel 콜백이 호출됐어요.')}
          onComplete={() => setLastAction('Complete 콜백이 호출됐어요.')}
        />
      </div>

      <aside className="mx-auto mt-4 w-full max-w-[402px] rounded-2xl border border-grayscale-1200 bg-grayscale-1300 p-5 lg:mx-0 lg:mt-0 lg:w-72">
        <h1 className="body-17-m text-grayscale-100">PIN radius preview</h1>
        <p className="mt-2 body-15-r text-grayscale-500">
          지도를 드래그하거나 확대해 500m 반경이 함께 갱신되는지 확인할 수 있어요.
        </p>

        <label className="mt-5 flex cursor-pointer items-center justify-between gap-4 body-15-m">
          20m conflict
          <input
            type="checkbox"
            checked={hasNearbyPinConflict}
            onChange={(event) => setHasNearbyPinConflict(event.target.checked)}
            className="size-5 accent-white"
          />
        </label>

        <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 body-15-r text-grayscale-500">
          <dt>Map</dt>
          <dd className="text-right text-grayscale-200">{mapStatus}</dd>
          <dt>Zoom</dt>
          <dd className="text-right text-grayscale-200">{zoom.toFixed(2)}</dd>
          <dt>Latitude</dt>
          <dd className="text-right text-grayscale-200">{centerLatitude.toFixed(6)}</dd>
        </dl>

        <p aria-live="polite" className="mt-5 body-15-r text-grayscale-300">
          {lastAction}
        </p>
      </aside>
    </main>
  );
}

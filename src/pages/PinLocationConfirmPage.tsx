import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { MapViewer, type MapViewerHandle } from '@/features/map/components/MapViewer';
import { useMapPins } from '@/features/map/queries/useMapPins';
import type { MapViewport } from '@/features/map/types';
import { loadGoogleMapsScript } from '@/features/map/utils';
import { PinCandidateMarker } from '@/features/pin/components/PinCandidateMarker';
import { usePinCreationStore } from '@/store/pinCreationStore';

type MapLoadStatus = 'loading' | 'ready' | 'error';

export default function PinLocationConfirmPage() {
  const navigate = useNavigate();
  const mapViewerRef = useRef<MapViewerHandle>(null);
  const place = usePinCreationStore((state) => state.place);
  const [mapStatus, setMapStatus] = useState<MapLoadStatus>(
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? 'loading' : 'error',
  );
  const [zoom, setZoom] = useState(16);
  const [viewport, setViewport] = useState<MapViewport | null>(null);
  const mapPinsQuery = useMapPins(viewport);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) return;

    let disposed = false;
    loadGoogleMapsScript(apiKey)
      .then(() => {
        if (!disposed) setMapStatus('ready');
      })
      .catch(() => {
        if (!disposed) setMapStatus('error');
      });
    return () => {
      disposed = true;
    };
  }, []);

  if (!place) return <Navigate to="/app/pin/register" replace />;

  return (
    <main className="relative h-full overflow-hidden bg-pli-black-85">
      <MapViewer
        ref={mapViewerRef}
        isLoaded={mapStatus === 'ready'}
        zoom={zoom}
        initialCenter={place.coordinates}
        centerOnFirstLocation={false}
        placeResults={[]}
        selectedPlaceId={null}
        mapPins={zoom >= 14 ? (mapPinsQuery.data?.pins ?? []) : []}
        mapClusters={zoom < 14 ? (mapPinsQuery.data?.clusters ?? []) : []}
        selectedMapPinId={null}
        onZoomChanged={setZoom}
        onViewportChanged={setViewport}
        onSelectCluster={(cluster) => mapViewerRef.current?.fitBounds(cluster.bounds)}
      />

      {mapStatus !== 'ready' ? (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-pli-black-85 px-6 text-center body-15-r text-grayscale-400">
          {mapStatus === 'loading'
            ? '지도를 불러오고 있어요.'
            : '지도를 불러오지 못했어요. 잠시 후 다시 시도해주세요.'}
        </div>
      ) : null}

      <div className="pointer-events-none absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2">
        <PinCandidateMarker variant="confirmed" />
      </div>

      <div className="absolute inset-x-[15px] top-[calc(env(safe-area-inset-top)+16px)] z-40 flex items-center justify-between">
        <Button variant="cancel" size="bt" onClick={() => navigate('/app/pin/register')}>
          이전
        </Button>
        <Button variant="confirm" size="bt" onClick={() => navigate('/app/song/list')}>
          확정
        </Button>
      </div>

      <section className="absolute inset-x-0 bottom-0 z-40 min-h-[161px] rounded-t-[20px] bg-pli-black-100 px-4 pb-[calc(env(safe-area-inset-bottom)+24px)] pt-10">
        <h1 className="truncate head-24-sb text-grayscale-100">{place.placeName}</h1>
        <p className="mt-2 body-15-r text-grayscale-500">
          내 위치에서 {Math.max(0, Math.round(place.distanceMeters))}m
        </p>
        <p className="mt-2 line-clamp-2 body-15-r text-grayscale-600">
          {place.roadAddress || place.address}
        </p>
      </section>
    </main>
  );
}

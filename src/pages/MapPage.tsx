import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { SearchLauncher } from '@/components/ui/SearchInput';
import type { MapPlace } from '@/features/map/types';
import { MapCoordinate, DEFAULT_CENTER, DEFAULT_MARKER_COLOR } from '@/features/map/types';
import { loadGoogleMapsScript } from '@/features/map/utils';
import { MapViewer, type MapViewerHandle } from '@/features/map/components/MapViewer';
import { BottomNav, type NavItemId } from '@/components/BottomNav';
import type { PinSearchPlace } from '@/features/pin/types';
import BookmarkIcon from '@/assets/icons/bookmark.svg?react';
import FocusIcon from '@/assets/icons/focus.svg?react';
import PlusIcon from '@/assets/icons/plus.svg?react';

type MapLoadStatus = 'loading' | 'ready' | 'error';

type MapPageProps = {
  selectedMapPlace: PinSearchPlace | null;
};

const MapPage: React.FC<MapPageProps> = ({ selectedMapPlace }) => {
  const navigate = useNavigate();
  const hasApiKey = Boolean(import.meta.env.VITE_GOOGLE_MAPS_API_KEY);

  // --- 상태 관리 ---
  const [zoom, setZoom] = useState<number>(15);
  const [mapLoadStatus, setMapLoadStatus] = useState<MapLoadStatus>(
    hasApiKey ? 'loading' : 'error',
  );
  const [mapLoadError, setMapLoadError] = useState<string | null>(
    hasApiKey ? null : '지도를 불러올 수 없어요. 잠시 후 다시 시도해주세요.',
  );
  const [activeNavId, setActiveNavId] = useState<NavItemId>('plimap');

  // develop 방식: selectedMapPlace prop으로 장소 결과 관리
  const placeResults = useMemo<MapPlace[]>(
    () => (selectedMapPlace ? [selectedMapPlace] : []),
    [selectedMapPlace],
  );
  const selectedPlaceId = selectedMapPlace?.id ?? null;

  const mapViewerRef = useRef<MapViewerHandle>(null);

  // --- 구글맵 스크립트 로드 (setState는 전부 프로미스 콜백 안에서만 일어나 effect에서 안전하게 호출 가능) ---
  const startGoogleMapsLoad = useCallback((apiKey: string) => {
    loadGoogleMapsScript(apiKey)
      .then(() => {
        setMapLoadStatus('ready');
      })
      .catch((error) => {
        console.error(error);
        setMapLoadStatus('error');
        setMapLoadError('지도를 불러오지 못했어요. 네트워크 상태를 확인해주세요.');
      });
  }, []);

  useEffect(() => {
    // 키가 없으면 상태는 이미 초기값(error)이므로 로드를 시도하지 않는다.
    if (!hasApiKey) return;
    startGoogleMapsLoad(import.meta.env.VITE_GOOGLE_MAPS_API_KEY);
  }, [startGoogleMapsLoad, hasApiKey]);

  // --- 지도 로드 재시도 (실패한 스크립트 태그를 지우고 다시 요청, 클릭 핸들러이므로 동기 setState 가능) ---
  const handleRetryMapLoad = () => {
    document.getElementById('google-maps-script')?.remove();
    setMapLoadStatus('loading');
    setMapLoadError(null);

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
    if (!apiKey) {
      console.error('VITE_GOOGLE_MAPS_API_KEY is missing in environment variables');
      setMapLoadStatus('error');
      setMapLoadError('지도를 불러올 수 없어요. 잠시 후 다시 시도해주세요.');
      return;
    }

    startGoogleMapsLoad(apiKey);
  };

  // --- 줌(배율) 변경 핸들러 ---
  const handleZoomChange = (newZoom: number) => {
    setZoom(newZoom);
  };

  if (mapLoadStatus === 'error') {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-pli-black-100 p-6 text-center">
        <p className="body-15-r text-grayscale-300">{mapLoadError}</p>
        <button
          type="button"
          onClick={handleRetryMapLoad}
          className="rounded-full bg-neon px-6 py-3 body-15-sb text-grayscale-1250"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {/* 상단 장소 검색 바 + 북마크/현재 위치 버튼 */}
      <div className="absolute inset-x-0 top-0 z-20 flex flex-col">
        <div className="shrink-0 px-[15px] pt-[calc(env(safe-area-inset-top)+16px)]">
          <SearchLauncher
            className="map-search-hero"
            value={selectedMapPlace?.placeName}
            placeholder="장소를 검색하세요"
            onClick={() =>
              navigate('/app/pin/search', {
                state: { fromMap: true },
              })
            }
          />
        </div>

        <div className="flex flex-col items-end gap-3 p-4">
          <button
            type="button"
            aria-label="북마크"
            className="flex size-[52px] items-center justify-center rounded-full bg-pli-black-100 shadow-[0_0_4.21px_rgba(0,0,0,0.15)] backdrop-blur-[8.26px]"
          >
            <BookmarkIcon className="size-7" />
          </button>
          <button
            type="button"
            aria-label="현재 위치로 이동"
            onClick={() => mapViewerRef.current?.recenterToCurrentLocation()}
            className="flex size-[52px] items-center justify-center rounded-full bg-pli-black-100 shadow-[0_0_4.21px_rgba(0,0,0,0.15)] backdrop-blur-[8.26px]"
          >
            <FocusIcon className="size-7" />
          </button>
        </div>
      </div>

      <BottomNav activeId={activeNavId} onTabChange={setActiveNavId}>
        {/* 핀 등록 버튼: BottomNav와의 간격은 BottomNav가 관리하므로 여기선 위치를 계산하지 않는다 */}
        <button
          type="button"
          aria-label="핀 등록"
          onClick={() => navigate('/app/pin/register')}
          className="flex size-16 items-center justify-center rounded-full bg-gradient-neon text-grayscale-1200 shadow-[0_3px_8px_rgba(0,0,0,0.7)]"
        >
          <PlusIcon className="size-7" />
        </button>
      </BottomNav>

      <MapViewer
        ref={mapViewerRef}
        isLoaded={mapLoadStatus === 'ready'}
        zoom={zoom}
        placeResults={placeResults}
        selectedPlaceId={selectedPlaceId}
        onZoomChanged={handleZoomChange}
      />
    </div>
  );
};

export default MapPage;
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchInput } from '@/components/ui/SearchInput';
import { KakaoLocalPlace, MapCoordinate, DEFAULT_CENTER } from '@/features/map/types';
import { loadGoogleMapsScript } from '@/features/map/utils';
import { searchKakaoLocal } from '@/features/map/kakaoLocal';
import { MapViewer, type MapViewerHandle } from '@/features/map/components/MapViewer';
import { BottomNav, type NavItemId } from '@/components/BottomNav';
import BookmarkIcon from '@/assets/icons/bookmark.svg?react';
import FocusIcon from '@/assets/icons/focus.svg?react';
import PlusIcon from '@/assets/icons/plus.svg?react';

type MapLoadStatus = 'loading' | 'ready' | 'error';

const MapPage: React.FC = () => {
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
  const [mapCenter, setMapCenter] = useState<MapCoordinate>(DEFAULT_CENTER);
  const [placeQuery, setPlaceQuery] = useState('');
  const [placeResults, setPlaceResults] = useState<KakaoLocalPlace[]>([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [isPlaceSearching, setIsPlaceSearching] = useState(false);
  const [placeSearchError, setPlaceSearchError] = useState<string | null>(null);
  const [activeNavId, setActiveNavId] = useState<NavItemId>('plimap');
  const searchRequestIdRef = useRef(0);
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

  // --- 장소 검색 핸들러 ---
  const handlePlaceSearch = useCallback(async () => {
    const query = placeQuery.trim();

    if (!query) {
      searchRequestIdRef.current += 1;
      setPlaceResults([]);
      setSelectedPlaceId(null);
      setIsPlaceSearching(false);
      setPlaceSearchError(null);
      return;
    }

    const requestId = ++searchRequestIdRef.current;
    setIsPlaceSearching(true);
    setPlaceSearchError(null);

    try {
      const results = await searchKakaoLocal({
        query,
        x: mapCenter.lng,
        y: mapCenter.lat,
      });
      if (searchRequestIdRef.current !== requestId) return;
      setPlaceResults(results);
      setSelectedPlaceId(results[0]?.id ?? null);
      if (results.length === 0) {
        setPlaceSearchError('검색 결과가 없습니다.');
      }
    } catch (error) {
      if (searchRequestIdRef.current !== requestId) return;
      console.error(error);
      setPlaceResults([]);
      setSelectedPlaceId(null);
      setPlaceSearchError(
        error instanceof Error ? error.message : 'Kakao Local API 검색에 실패했습니다.',
      );
    } finally {
      if (searchRequestIdRef.current === requestId) {
        setIsPlaceSearching(false);
      }
    }
  }, [mapCenter.lat, mapCenter.lng, placeQuery]);

  const handleClearPlaceSearch = () => {
    searchRequestIdRef.current += 1;
    setPlaceQuery('');
    setPlaceResults([]);
    setSelectedPlaceId(null);
    setIsPlaceSearching(false);
    setPlaceSearchError(null);
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
      {/* 상단 장소 검색 바 */}
      <div className="absolute inset-x-0 top-0 z-20 px-2.5 pt-4">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            handlePlaceSearch();
          }}
        >
          <SearchInput
            variant="map"
            value={placeQuery}
            onChange={(event) => setPlaceQuery(event.target.value)}
            onClear={handleClearPlaceSearch}
            placeholder={isPlaceSearching ? '검색 중...' : '장소를 검색하세요'}
            disabled={isPlaceSearching}
          />
        </form>
        {placeSearchError && (
          <p className="mt-3 rounded-lg bg-pli-black-85 px-3 py-2 text-xs text-red">
            {placeSearchError}
          </p>
        )}
      </div>

      {/* 북마크/현재 위치 버튼 */}
      <div className="absolute inset-x-0 top-[76px] z-20 flex flex-col items-end gap-3 p-4">
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
        onCenterChanged={setMapCenter}
        onSelectPlace={setSelectedPlaceId}
      />
    </div>
  );
};

export default MapPage;

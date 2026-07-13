import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SearchInput } from '@/components/ui/SearchInput';
import { KakaoLocalPlace, MapCoordinate, DEFAULT_CENTER } from '@/features/map/types';
import { loadGoogleMapsScript } from '@/features/map/utils';
import { searchKakaoLocal } from '@/features/map/kakaoLocal';
import { MapViewer } from '@/features/map/components/MapViewer';

const MapPage: React.FC = () => {
  // --- 상태 관리 ---
  const [zoom, setZoom] = useState<number>(15);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapCenter, setMapCenter] = useState<MapCoordinate>(DEFAULT_CENTER);
  const [placeQuery, setPlaceQuery] = useState('');
  const [placeResults, setPlaceResults] = useState<KakaoLocalPlace[]>([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [isPlaceSearching, setIsPlaceSearching] = useState(false);
  const [placeSearchError, setPlaceSearchError] = useState<string | null>(null);
  const searchRequestIdRef = useRef(0);

  // --- 구글맵 API 동적 로드 ---
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
    if (!apiKey) {
      console.error('VITE_GOOGLE_MAPS_API_KEY is missing in environment variables');
      return;
    }

    loadGoogleMapsScript(apiKey)
      .then(() => {
        setIsMapLoaded(true);
      })
      .catch(console.error);
  }, []);

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

  return (
    <div className="relative h-full w-full">
      {/* 상단 장소 검색 바 */}
      <div className="absolute inset-x-0 top-0 z-20 p-3">
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
          <p className="mt-2 rounded-lg bg-pli-black-85 px-3 py-2 text-xs text-red">
            {placeSearchError}
          </p>
        )}
      </div>

      <MapViewer
        isLoaded={isMapLoaded}
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

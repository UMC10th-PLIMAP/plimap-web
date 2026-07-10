import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ColorSettings,
  KakaoLocalPlace,
  MapCoordinate,
  ToggleSettings,
  MapSize,
  DEFAULT_DARK_COLORS,
  DEFAULT_LIGHT_COLORS,
  DEFAULT_TOGGLES,
  DEFAULT_MAP_SIZE,
  DEFAULT_MARKER_COLOR,
  DEFAULT_CENTER,
} from './types';
import { loadGoogleMapsScript } from './utils';
import { searchKakaoLocal } from './kakaoLocal';
import { MapSidebar } from './components/MapSidebar';
import { MapViewer } from './components/MapViewer';

const MapDemoPage: React.FC = () => {
  // --- 상태 관리 ---
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [colors, setColors] = useState<ColorSettings>(DEFAULT_DARK_COLORS);
  const [toggles, setToggles] = useState<ToggleSettings>(DEFAULT_TOGGLES);
  const [zoom, setZoom] = useState<number>(15);
  const [mapSize, setMapSize] = useState<MapSize>(DEFAULT_MAP_SIZE);
  const [markerColor, setMarkerColor] = useState<string>(DEFAULT_MARKER_COLOR);
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

  // --- 테마(다크/라이트) 전환 핸들러 ---
  const handleToggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const nextMode = !prev;
      setColors(nextMode ? DEFAULT_DARK_COLORS : DEFAULT_LIGHT_COLORS);
      return nextMode;
    });
  };

  // --- 개별 색상 변경 핸들러 ---
  const handleColorChange = (key: keyof ColorSettings, value: string) => {
    setColors((prev) => ({ ...prev, [key]: value }));
  };

  // --- 요소 표시 토글 핸들러 ---
  const handleToggleChange = (key: keyof ToggleSettings) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // --- 줌(배율) 변경 핸들러 ---
  const handleZoomChange = (newZoom: number) => {
    setZoom(newZoom);
  };

  // --- 지도 크기 변경 핸들러 ---
  const handleMapSizeChange = (newSize: MapSize) => {
    setMapSize(newSize);
  };

  // --- 현재 위치 마커 색상 변경 핸들러 ---
  const handleMarkerColorChange = (color: string) => {
    setMarkerColor(color);
  };

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
    <div
      className={`flex w-full h-[100vh] overflow-hidden font-sans ${isDarkMode ? 'bg-[#0C0D0F]' : 'bg-gray-100'}`}
    >
      {/* 1. 좌측 커스텀 사이드바 */}
      <MapSidebar
        isDarkMode={isDarkMode}
        colors={colors}
        toggles={toggles}
        zoom={zoom}
        mapSize={mapSize}
        markerColor={markerColor}
        placeQuery={placeQuery}
        placeResults={placeResults}
        selectedPlaceId={selectedPlaceId}
        isPlaceSearching={isPlaceSearching}
        placeSearchError={placeSearchError}
        onToggleDarkMode={handleToggleDarkMode}
        onColorChange={handleColorChange}
        onToggleChange={handleToggleChange}
        onZoomChange={handleZoomChange}
        onMapSizeChange={handleMapSizeChange}
        onMarkerColorChange={handleMarkerColorChange}
        onPlaceQueryChange={setPlaceQuery}
        onPlaceSearch={handlePlaceSearch}
        onClearPlaceSearch={handleClearPlaceSearch}
        onSelectPlace={setSelectedPlaceId}
      />
      {/* 2. 우측 구글맵 뷰어 */}
      <MapViewer
        isLoaded={isMapLoaded}
        colors={colors}
        toggles={toggles}
        zoom={zoom}
        mapSize={mapSize}
        markerColor={markerColor}
        placeResults={placeResults}
        selectedPlaceId={selectedPlaceId}
        onZoomChanged={handleZoomChange}
        onCenterChanged={setMapCenter}
        onSelectPlace={setSelectedPlaceId}
      />
    </div>
  );
};

export default MapDemoPage;

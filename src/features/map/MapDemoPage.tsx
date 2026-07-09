import React, { useEffect, useState } from 'react';
import {
  ColorSettings,
  ToggleSettings,
  MapSize,
  DEFAULT_DARK_COLORS,
  DEFAULT_LIGHT_COLORS,
  DEFAULT_TOGGLES,
  DEFAULT_MAP_SIZE,
  DEFAULT_MARKER_COLOR,
} from './types';
import { loadGoogleMapsScript } from './utils';
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
        onToggleDarkMode={handleToggleDarkMode}
        onColorChange={handleColorChange}
        onToggleChange={handleToggleChange}
        onZoomChange={handleZoomChange}
        onMapSizeChange={handleMapSizeChange}
        onMarkerColorChange={handleMarkerColorChange}
      />
      {/* 2. 우측 구글맵 뷰어 */}
      <MapViewer
        isLoaded={isMapLoaded}
        colors={colors}
        toggles={toggles}
        zoom={zoom}
        mapSize={mapSize}
        markerColor={markerColor}
        onZoomChanged={handleZoomChange}
      />
    </div>
  );
};

export default MapDemoPage;

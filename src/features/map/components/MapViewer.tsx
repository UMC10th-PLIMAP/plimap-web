import React, { useEffect, useRef } from 'react';
import { ColorSettings, ToggleSettings } from '../types';
import { generateMapStyles } from '../utils';

type MapViewerProps = {
  isLoaded: boolean;
  colors: ColorSettings;
  toggles: ToggleSettings;
  zoom: number;
  onZoomChanged?: (newZoom: number) => void;
};

export const MapViewer: React.FC<MapViewerProps> = ({
  isLoaded,
  colors,
  toggles,
  zoom,
  onZoomChanged,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    // 맵 스크립트가 로드되지 않았거나 컨테이너가 없으면 실행 안함
    if (!isLoaded || !mapRef.current) return;

    if (!mapInstanceRef.current) {
      // --- 구글맵 인스턴스 초기 생성 ---
      const center = { lat: 37.5665, lng: 126.978 };
      const map = new window.google.maps.Map(mapRef.current, {
        center,
        zoom,
        disableDefaultUI: true,
        styles: generateMapStyles(colors, toggles),
      });
      mapInstanceRef.current = map;

      // --- 마우스/트랙패드를 통한 줌 변경 이벤트 리스너 ---
      map.addListener('zoom_changed', () => {
        const newZoom = map.getZoom();
        if (newZoom !== undefined && onZoomChanged) {
          onZoomChanged(newZoom);
        }
      });
    } else {
      // --- 기존 맵 인스턴스 상태 업데이트 (스타일 및 줌 동기화) ---
      const map = mapInstanceRef.current;
      map.setOptions({
        styles: generateMapStyles(colors, toggles),
      });
      if (map.getZoom() !== zoom) {
        map.setZoom(zoom);
      }
    }
  }, [isLoaded, colors, toggles, zoom, onZoomChanged]);

  return (
    <main className="flex-1 h-full relative">
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#1c2128]">
          <span className="text-[#9A9A9A]">Loading Google Maps...</span>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full" />
    </main>
  );
};

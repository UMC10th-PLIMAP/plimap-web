import React, { useEffect, useRef } from 'react';
import { ColorSettings, ToggleSettings, MapSize } from '../types';
import { generateMapStyles } from '../utils';

// 현재 위치를 나타내는 "블루닷" 스타일 아이콘 — Map ID 없이도 동작하는 클래식 Marker용
const createMarkerIcon = (color: string): google.maps.Symbol => ({
  path: window.google.maps.SymbolPath.CIRCLE,
  fillColor: color,
  fillOpacity: 1,
  strokeColor: '#ffffff',
  strokeWeight: 3,
  scale: 9,
});

type MapViewerProps = {
  isLoaded: boolean;
  colors: ColorSettings;
  toggles: ToggleSettings;
  zoom: number;
  mapSize: MapSize;
  markerColor: string;
  onZoomChanged?: (newZoom: number) => void;
};

export const MapViewer: React.FC<MapViewerProps> = ({
  isLoaded,
  colors,
  toggles,
  zoom,
  mapSize,
  markerColor,
  onZoomChanged,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const markerColorRef = useRef(markerColor);

  useEffect(() => {
    markerColorRef.current = markerColor;
  }, [markerColor]);

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

  // --- 지도 크기 변경 시 구글맵에 리사이즈 알림 (중심점 유지) ---
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const center = map.getCenter();
    window.google.maps.event.trigger(map, 'resize');
    if (center) map.setCenter(center);
  }, [mapSize]);

  // --- 브라우저 위치 조회 및 현재 위치 마커 생성 (최초 1회) ---
  useEffect(() => {
    if (!isLoaded || markerRef.current || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const map = mapInstanceRef.current;
        if (!map) return;

        const pos = { lat: position.coords.latitude, lng: position.coords.longitude };
        map.setCenter(pos);

        markerRef.current = new window.google.maps.Marker({
          map,
          position: pos,
          icon: createMarkerIcon(markerColorRef.current),
        });
      },
      (error) => {
        console.warn('현재 위치를 가져올 수 없습니다:', error.message);
      },
    );
  }, [isLoaded]);

  // --- 마커 색상 변경 시 반영 ---
  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) return;

    marker.setIcon(createMarkerIcon(markerColor));
  }, [markerColor]);

  return (
    <main className="flex-1 h-full relative flex items-center justify-center overflow-auto">
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#1c2128]">
          <span className="text-[#9A9A9A]">Loading Google Maps...</span>
        </div>
      )}
      <div
        style={{ width: mapSize.width, height: mapSize.height }}
        className="max-w-full max-h-full shadow-2xl overflow-hidden shrink-0"
      >
        <div ref={mapRef} className="w-full h-full" />
      </div>
    </main>
  );
};

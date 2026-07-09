import React, { useEffect, useRef } from 'react';
import { ColorSettings, KakaoLocalPlace, MapCoordinate, ToggleSettings, MapSize } from '../types';
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

const createPlaceMarkerIcon = (isSelected: boolean): google.maps.Symbol => ({
  path: window.google.maps.SymbolPath.CIRCLE,
  fillColor: isSelected ? '#2563eb' : '#111827',
  fillOpacity: 1,
  strokeColor: isSelected ? '#bfdbfe' : '#ffffff',
  strokeWeight: isSelected ? 4 : 3,
  scale: isSelected ? 13 : 11,
});

const createPlaceInfoContent = (place: KakaoLocalPlace) => {
  const wrapper = document.createElement('div');
  wrapper.style.display = 'flex';
  wrapper.style.flexDirection = 'column';
  wrapper.style.gap = '4px';
  wrapper.style.maxWidth = '220px';
  wrapper.style.color = '#111827';
  wrapper.style.fontFamily = 'Pretendard, system-ui, sans-serif';

  const title = document.createElement('strong');
  title.textContent = place.placeName;
  title.style.fontSize = '14px';
  wrapper.appendChild(title);

  const meta = document.createElement('span');
  meta.textContent = place.categoryGroupName || place.categoryName || '장소';
  meta.style.fontSize = '12px';
  meta.style.color = '#4b5563';
  wrapper.appendChild(meta);

  const address = place.roadAddressName || place.addressName;
  if (address) {
    const addressText = document.createElement('span');
    addressText.textContent = address;
    addressText.style.fontSize = '12px';
    addressText.style.color = '#6b7280';
    wrapper.appendChild(addressText);
  }

  return wrapper;
};

type MapViewerProps = {
  isLoaded: boolean;
  colors: ColorSettings;
  toggles: ToggleSettings;
  zoom: number;
  mapSize: MapSize;
  markerColor: string;
  placeResults: KakaoLocalPlace[];
  selectedPlaceId: string | null;
  onZoomChanged?: (newZoom: number) => void;
  onCenterChanged?: (center: MapCoordinate) => void;
  onSelectPlace?: (placeId: string) => void;
};

export const MapViewer: React.FC<MapViewerProps> = ({
  isLoaded,
  colors,
  toggles,
  zoom,
  mapSize,
  markerColor,
  placeResults,
  selectedPlaceId,
  onZoomChanged,
  onCenterChanged,
  onSelectPlace,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const markerColorRef = useRef(markerColor);
  const placeMarkersRef = useRef<
    { id: string; place: KakaoLocalPlace; marker: google.maps.Marker }[]
  >([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const onCenterChangedRef = useRef(onCenterChanged);
  const onSelectPlaceRef = useRef(onSelectPlace);
  const selectedPlaceIdRef = useRef(selectedPlaceId);

  useEffect(() => {
    markerColorRef.current = markerColor;
  }, [markerColor]);

  useEffect(() => {
    onCenterChangedRef.current = onCenterChanged;
  }, [onCenterChanged]);

  useEffect(() => {
    onSelectPlaceRef.current = onSelectPlace;
  }, [onSelectPlace]);

  useEffect(() => {
    selectedPlaceIdRef.current = selectedPlaceId;
  }, [selectedPlaceId]);

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

      map.addListener('idle', () => {
        const newCenter = map.getCenter();
        if (!newCenter) return;

        onCenterChangedRef.current?.({
          lat: newCenter.lat(),
          lng: newCenter.lng(),
        });
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

    let ignore = false;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (ignore) return;
        const map = mapInstanceRef.current;
        if (!map) return;

        const pos = { lat: position.coords.latitude, lng: position.coords.longitude };
        map.setCenter(pos);

        markerRef.current = new window.google.maps.Marker({
          map,
          position: pos,
          icon: createMarkerIcon(markerColorRef.current),
        });
        onCenterChangedRef.current?.(pos);
      },
      (error) => {
        if (ignore) return;
        console.warn('현재 위치를 가져올 수 없습니다:', error.message);
      },
    );

    return () => {
      ignore = true;
    };
  }, [isLoaded]);

  // --- 마커 색상 변경 시 반영 ---
  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) return;

    marker.setIcon(createMarkerIcon(markerColor));
  }, [markerColor]);

  // --- Kakao Local 검색 결과 마커 렌더링 ---
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!isLoaded || !map) return;

    placeMarkersRef.current.forEach(({ marker }) => marker.setMap(null));
    placeMarkersRef.current = [];
    infoWindowRef.current?.close();

    if (placeResults.length === 0) return;

    if (!infoWindowRef.current) {
      infoWindowRef.current = new window.google.maps.InfoWindow();
    }

    const bounds = new window.google.maps.LatLngBounds();
    const selectedId = selectedPlaceIdRef.current;

    placeMarkersRef.current = placeResults.map((place, index) => {
      const position = { lat: place.y, lng: place.x };
      const marker = new window.google.maps.Marker({
        map,
        position,
        title: place.placeName,
        label: {
          text: String(index + 1),
          color: '#ffffff',
          fontSize: '12px',
          fontWeight: '700',
        },
        icon: createPlaceMarkerIcon(place.id === selectedId),
      });

      marker.addListener('click', () => {
        onSelectPlaceRef.current?.(place.id);
      });
      bounds.extend(position);

      return { id: place.id, place, marker };
    });

    if (placeResults.length === 1) {
      map.setCenter({ lat: placeResults[0].y, lng: placeResults[0].x });
      map.setZoom(Math.max(map.getZoom() ?? 16, 16));
    } else {
      map.fitBounds(bounds, 48);
    }
  }, [isLoaded, placeResults]);

  // --- 선택된 Kakao 장소 강조 및 정보창 표시 ---
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const infoWindow = infoWindowRef.current;

    placeMarkersRef.current.forEach((placeMarker) => {
      const isSelected = placeMarker.id === selectedPlaceId;
      placeMarker.marker.setIcon(createPlaceMarkerIcon(isSelected));
      placeMarker.marker.setZIndex(isSelected ? 1000 : undefined);
    });

    const selectedMarker =
      placeMarkersRef.current.find((placeMarker) => placeMarker.id === selectedPlaceId) ?? null;

    if (!infoWindow || !selectedMarker) {
      infoWindow?.close();
      return;
    }

    infoWindow.setContent(createPlaceInfoContent(selectedMarker.place));
    infoWindow.open({
      map,
      anchor: selectedMarker.marker,
    });
    map.panTo(
      selectedMarker.marker.getPosition() ?? {
        lat: selectedMarker.place.y,
        lng: selectedMarker.place.x,
      },
    );
  }, [selectedPlaceId]);

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

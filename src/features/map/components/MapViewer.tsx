import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import {
  KakaoLocalPlace,
  MapCoordinate,
  MapPin,
  DEFAULT_CENTER,
  DEFAULT_MARKER_COLOR,
} from '../types';
import {
  createMapPinOverlay,
  disposeMapPinOverlay,
  toMapPinMarkerProps,
  updateMapPinMarker,
  type MapPinOverlayEntry,
} from '../utils/mapPinMarker';

// 지도 줌 하한선 (레벨 단위 유지, 상한선은 API 지원 한도까지 허용)
const MIN_ZOOM = 6;

// 대한민국 영역으로 패닝을 제한하는 경계 상자 (엄격 모드)
const KOREA_BOUNDS: google.maps.LatLngBoundsLiteral = {
  north: 38.7,
  south: 33.0,
  east: 132.0,
  west: 124.5,
};

// 확정된 지도 스타일 (디자이너 검수 완료, 데모 페이지에서 산출된 최종 값을 그대로 고정)
const FIXED_MAP_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#252f3c' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#2d485f' }] },
  { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#2a3433' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2e3238' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#394069' }] },
  {
    featureType: 'road.highway.controlled_access',
    elementType: 'geometry',
    stylers: [{ color: '#696e7f' }],
  },
  { featureType: 'transit.line', elementType: 'geometry', stylers: [{ color: '#5a6255' }] },
  { featureType: 'landscape.man_made', elementType: 'geometry', stylers: [{ color: '#22272f' }] },
  {
    featureType: 'landscape.man_made',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#666a7a' }],
  },
  { elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative', stylers: [{ visibility: 'off' }] },
  { featureType: 'landscape.man_made', stylers: [{ visibility: 'on' }] },
  { featureType: 'landscape.natural', stylers: [{ visibility: 'on' }] },
  { featureType: 'water', stylers: [{ visibility: 'on' }] },
  { featureType: 'road.highway', stylers: [{ visibility: 'on' }] },
  { featureType: 'road.arterial', stylers: [{ visibility: 'on' }] },
  { featureType: 'road.local', stylers: [{ visibility: 'on' }] },
  { featureType: 'transit.line', stylers: [{ visibility: 'on' }] },
  { featureType: 'transit.station', stylers: [{ visibility: 'on' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#475162' }] },
  { featureType: 'road', elementType: 'labels.text.stroke', stylers: [{ color: '#252f3c' }] },
  { featureType: 'poi', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi', elementType: 'labels.text', stylers: [{ visibility: 'on' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#5f6163' }] },
  { featureType: 'poi', elementType: 'labels.text.stroke', stylers: [{ color: '#252f3c' }] },
  { featureType: 'landscape', elementType: 'labels.text.fill', stylers: [{ color: '#5f6163' }] },
  { featureType: 'landscape', elementType: 'labels.text.stroke', stylers: [{ color: '#252f3c' }] },
  {
    featureType: 'administrative',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#5f6163' }],
  },
  {
    featureType: 'administrative',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#252f3c' }],
  },
  { featureType: 'transit', elementType: 'labels.text.fill', stylers: [{ color: '#5f6163' }] },
  { featureType: 'transit', elementType: 'labels.text.stroke', stylers: [{ color: '#252f3c' }] },
];

// 현재 위치 점 아이콘 (Aura, White Border, Inner Dot)
const createMarkerIcon = (mapsApi: typeof google.maps, color: string) => {
  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
      <circle cx="24" cy="24" r="20" fill="${color}" fill-opacity="0.25" />
      <circle cx="24" cy="24" r="12" fill="#ffffff" />
      <circle cx="24" cy="24" r="9" fill="${color}" />
    </svg>
  `;
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svgString.trim())}`,
    anchor: new mapsApi.Point(24, 24),
    scaledSize: new mapsApi.Size(48, 48),
  };
};

// 기기 방향 이벤트에서 나침반 방향 추출 (절대 방위 기준일 때만 alpha를 신뢰)
const getCompassHeading = (event: DeviceOrientationEvent): number | null => {
  const iosEvent = event as DeviceOrientationEvent & { webkitCompassHeading?: number };
  if (typeof iosEvent.webkitCompassHeading === 'number') {
    return iosEvent.webkitCompassHeading;
  }
  if (event.absolute && typeof event.alpha === 'number') {
    return (360 - event.alpha) % 360;
  }
  return null;
};

// 방향 쐐기 아이콘 (오라 밖에서 시작하며 흰 테두리가 있는 삼각형)
const createHeadingIcon = (
  mapsApi: typeof google.maps,
  color: string,
  heading: number,
): google.maps.Symbol => ({
  path: 'M -6,-16 L 0,-23 L 6,-16 Z',
  rotation: heading,
  fillColor: color,
  fillOpacity: 1,
  strokeColor: '#ffffff',
  strokeWeight: 2.5,
  anchor: new mapsApi.Point(0, 0),
  scale: 1,
});

const createPlaceMarkerIcon = (
  mapsApi: typeof google.maps,
  isSelected: boolean,
): google.maps.Symbol => ({
  path: mapsApi.SymbolPath.CIRCLE,
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
  zoom: number;
  placeResults: KakaoLocalPlace[];
  selectedPlaceId: string | null;
  mapPins: MapPin[];
  selectedMapPinId: string | null;
  onZoomChanged?: (newZoom: number) => void;
  onCenterChanged?: (center: MapCoordinate) => void;
  onSelectPlace?: (placeId: string) => void;
  onSelectMapPin?: (pinId: string) => void;
};

export type MapViewerHandle = {
  /** 지도를 현재 위치 마커로 이동시킨다. 위치를 아직 못 받았으면 아무 동작도 하지 않는다. */
  recenterToCurrentLocation: () => void;
};

export const MapViewer = forwardRef<MapViewerHandle, MapViewerProps>(function MapViewer(
  {
    isLoaded,
    zoom,
    placeResults,
    selectedPlaceId,
    mapPins,
    selectedMapPinId,
    onZoomChanged,
    onCenterChanged,
    onSelectPlace,
    onSelectMapPin,
  },
  ref,
) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const headingMarkerRef = useRef<google.maps.Marker | null>(null);

  const placeMarkersRef = useRef<
    { id: string; place: KakaoLocalPlace; marker: google.maps.Marker }[]
  >([]);
  const mapPinOverlaysRef = useRef<{ id: string; entry: MapPinOverlayEntry }[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const onCenterChangedRef = useRef(onCenterChanged);
  const onSelectPlaceRef = useRef(onSelectPlace);
  const onSelectMapPinRef = useRef(onSelectMapPin);
  const selectedPlaceIdRef = useRef(selectedPlaceId);
  const selectedMapPinIdRef = useRef(selectedMapPinId);

  useEffect(() => {
    onCenterChangedRef.current = onCenterChanged;
  }, [onCenterChanged]);

  useEffect(() => {
    onSelectPlaceRef.current = onSelectPlace;
  }, [onSelectPlace]);

  useEffect(() => {
    onSelectMapPinRef.current = onSelectMapPin;
  }, [onSelectMapPin]);

  useEffect(() => {
    selectedMapPinIdRef.current = selectedMapPinId;
  }, [selectedMapPinId]);

  useEffect(() => {
    selectedPlaceIdRef.current = selectedPlaceId;
  }, [selectedPlaceId]);

  // --- 기기 방향 이벤트 처리 (클래식 마커 회전) ---
  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    const mapsApi = window.google?.maps;
    const map = mapInstanceRef.current;
    const marker = markerRef.current;
    if (!mapsApi || !map || !marker) return;

    const heading = getCompassHeading(event);
    if (heading === null) return;

    const position = marker.getPosition();
    if (!position) return;

    if (!headingMarkerRef.current) {
      headingMarkerRef.current = new mapsApi.Marker({
        map,
        position,
        icon: createHeadingIcon(mapsApi, DEFAULT_MARKER_COLOR, heading),
        clickable: false,
        zIndex: 11, // 메인 점(오라 포함) 위로 올라오게 설정
      });
    } else {
      headingMarkerRef.current.setPosition(position);
      headingMarkerRef.current.setIcon(createHeadingIcon(mapsApi, DEFAULT_MARKER_COLOR, heading));
    }
  }, []);

  // --- 나침반 리스너 등록 (iOS는 사용자 제스처 안에서 권한 요청 후에만 이벤트가 발생함) ---
  const compassRegisteredRef = useRef(false);

  const enableCompassIfNeeded = useCallback(() => {
    if (compassRegisteredRef.current) return;

    const register = () => {
      if (compassRegisteredRef.current) return;
      compassRegisteredRef.current = true;
      window.addEventListener('deviceorientationabsolute', handleOrientation);
      window.addEventListener('deviceorientation', handleOrientation);
    };

    const OrientationEventCtor = window.DeviceOrientationEvent as
      | (typeof DeviceOrientationEvent & {
          requestPermission?: () => Promise<'granted' | 'denied'>;
        })
      | undefined;

    if (!OrientationEventCtor) return;

    if (typeof OrientationEventCtor.requestPermission === 'function') {
      OrientationEventCtor.requestPermission()
        .then((result) => {
          if (result === 'granted') register();
        })
        .catch(() => {});
    } else {
      register();
    }
  }, [handleOrientation]);

  useEffect(() => {
    return () => {
      window.removeEventListener('deviceorientationabsolute', handleOrientation);
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [handleOrientation]);

  useEffect(() => {
    const mapsApi = window.google?.maps;
    if (!isLoaded || !mapRef.current || !mapsApi) return;

    if (!mapInstanceRef.current) {
      // --- 구글맵 인스턴스 초기 생성 (Map ID 제거하여 JSON 스타일 우선 적용) ---
      const map = new mapsApi.Map(mapRef.current, {
        center: DEFAULT_CENTER,
        zoom,
        minZoom: MIN_ZOOM,
        // maxZoom은 지정하지 않음 → API 지원 한도까지 확대 허용
        restriction: {
          latLngBounds: KOREA_BOUNDS,
          strictBounds: true,
        },
        disableDefaultUI: true,
        styles: FIXED_MAP_STYLES, // Map ID가 없어야 이 스타일이 정상 작동함
      });
      mapInstanceRef.current = map;

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
    } else if (mapInstanceRef.current.getZoom() !== zoom) {
      mapInstanceRef.current.setZoom(zoom);
    }
  }, [isLoaded, zoom, onZoomChanged]);

  // --- 브라우저 위치 조회 및 내 위치 마커 생성 (실시간 트래킹) ---
  useEffect(() => {
    const mapsApi = window.google?.maps;
    if (!isLoaded || !mapsApi || !navigator.geolocation) return;

    let ignore = false;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        if (ignore) return;
        const map = mapInstanceRef.current;
        if (!map) return;

        const pos = { lat: position.coords.latitude, lng: position.coords.longitude };

        if (!markerRef.current) {
          map.setCenter(pos);

          markerRef.current = new mapsApi.Marker({
            map,
            position: pos,
            icon: createMarkerIcon(mapsApi, DEFAULT_MARKER_COLOR),
            zIndex: 10,
          });

          // 실제 기기 방향 값이 들어오기 전에 항상 방향 쐐기가 보이도록 함. 기본값(0도, 북쪽)
          headingMarkerRef.current = new mapsApi.Marker({
            map,
            position: pos,
            icon: createHeadingIcon(mapsApi, DEFAULT_MARKER_COLOR, 0),
            clickable: false,
            zIndex: 11,
          });

          // 사용자 제스처가 필요 없는 브라우저(iOS 외)에서는 위치를 얻는 시점에 나침반도 바로 켠다.
          enableCompassIfNeeded();

          onCenterChangedRef.current?.(pos);
        } else {
          markerRef.current.setPosition(pos);
          if (headingMarkerRef.current) {
            headingMarkerRef.current.setPosition(pos);
          }
        }
      },
      (error) => {
        if (ignore) return;
        console.warn('현재 위치를 갱신할 수 없습니다:', error.message);
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 },
    );

    return () => {
      ignore = true;
      navigator.geolocation.clearWatch(watchId);
    };
  }, [isLoaded, enableCompassIfNeeded]);

  // --- "현재 위치" 버튼에서 호출할 재중심 이동 ---
  const recenterToCurrentLocation = useCallback(() => {
    // 사용자 제스처 안에서 호출되므로 나침반 권한도 함께 요청한다 (iOS 요구사항)
    enableCompassIfNeeded();

    const map = mapInstanceRef.current;
    const position = markerRef.current?.getPosition();
    if (!map || !position) return;

    map.panTo(position);
    if ((map.getZoom() ?? 0) < 16) {
      map.setZoom(16);
    }
  }, [enableCompassIfNeeded]);

  useImperativeHandle(ref, () => ({ recenterToCurrentLocation }), [recenterToCurrentLocation]);

  // --- Kakao Local 검색 결과 마커 렌더링 ---
  useEffect(() => {
    const mapsApi = window.google?.maps;
    const map = mapInstanceRef.current;
    if (!isLoaded || !mapsApi || !map) return;

    placeMarkersRef.current.forEach(({ marker }) => {
      marker.setMap(null);
    });
    placeMarkersRef.current = [];
    infoWindowRef.current?.close();

    if (placeResults.length === 0) return;

    if (!infoWindowRef.current) {
      infoWindowRef.current = new mapsApi.InfoWindow();
    }

    const bounds = new mapsApi.LatLngBounds();
    const selectedId = selectedPlaceIdRef.current;

    placeMarkersRef.current = placeResults.map((place, index) => {
      const position = { lat: place.y, lng: place.x };
      const marker = new google.maps.Marker({
        map,
        position,
        title: place.placeName,
        label: {
          text: String(index + 1),
          color: '#ffffff',
          fontSize: '12px',
          fontWeight: '700',
        },
        icon: createPlaceMarkerIcon(mapsApi, place.id === selectedId),
        zIndex: place.id === selectedId ? 1000 : 1,
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
    const mapsApi = window.google?.maps;
    const map = mapInstanceRef.current;
    if (!mapsApi || !map) return;

    const infoWindow = infoWindowRef.current;

    placeMarkersRef.current.forEach((placeMarker) => {
      const isSelected = placeMarker.id === selectedPlaceId;
      placeMarker.marker.setIcon(createPlaceMarkerIcon(mapsApi, isSelected));
      placeMarker.marker.setZIndex(isSelected ? 1000 : 1);
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

    const pos = selectedMarker.marker.getPosition();
    if (pos) {
      map.panTo(pos);
    }
  }, [selectedPlaceId, placeResults]);

  // --- 지도 핀(OverlayView) 렌더링 ---
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!isLoaded || !map) return;

    mapPinOverlaysRef.current.forEach(({ entry }) => disposeMapPinOverlay(entry));

    const selectedId = selectedMapPinIdRef.current;

    mapPinOverlaysRef.current = mapPins.map((pin) => {
      const entry = createMapPinOverlay({
        position: { lat: pin.lat, lng: pin.lng },
        zIndex: pin.id === selectedId ? 200 : 100,
        onClick: () => onSelectMapPinRef.current?.(pin.id),
        ...toMapPinMarkerProps(pin, pin.id === selectedId),
      });
      entry.overlay.setMap(map);

      return { id: pin.id, entry };
    });
  }, [isLoaded, mapPins]);

  // --- 선택된 지도 핀 강조 ---
  useEffect(() => {
    mapPinOverlaysRef.current.forEach(({ id, entry }) => {
      const pin = mapPins.find((candidate) => candidate.id === id);
      if (!pin) return;

      const isSelected = id === selectedMapPinId;
      updateMapPinMarker(entry.mount, toMapPinMarkerProps(pin, isSelected));
      entry.overlay.setZIndex(isSelected ? 200 : 100);
    });
  }, [selectedMapPinId, mapPins]);

  return (
    <main className="relative h-full w-full">
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#1c2128]">
          <span className="text-[#9A9A9A]">Loading Google Maps...</span>
        </div>
      )}
      <div ref={mapRef} className="h-full w-full" />
    </main>
  );
});

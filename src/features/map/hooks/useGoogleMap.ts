import { useEffect, useRef } from 'react';
import { DEFAULT_CENTER, type MapCoordinate } from '../types';

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

type UseGoogleMapParams = {
  isLoaded: boolean;
  zoom: number;
  onZoomChanged?: (newZoom: number) => void;
  onCenterChanged?: (center: MapCoordinate) => void;
};

/** 구글맵 인스턴스를 생성하고, zoom/center 변경을 리스닝한다. */
export function useGoogleMap({
  isLoaded,
  zoom,
  onZoomChanged,
  onCenterChanged,
}: UseGoogleMapParams) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const onCenterChangedRef = useRef(onCenterChanged);
  const onZoomChangedRef = useRef(onZoomChanged);

  useEffect(() => {
    onCenterChangedRef.current = onCenterChanged;
  }, [onCenterChanged]);

  useEffect(() => {
    onZoomChangedRef.current = onZoomChanged;
  }, [onZoomChanged]);

  useEffect(() => {
    const mapsApi = window.google?.maps;
    if (!isLoaded || !mapRef.current || !mapsApi) return;

    if (!mapInstanceRef.current) {
      // --- 구글맵 인스턴스 초기 생성 (Map ID 제거하여 JSON 스타일 우선 적용) ---
      const map = new mapsApi.Map(mapRef.current, {
        center: DEFAULT_CENTER,
        zoom,
        isFractionalZoomEnabled: true,
        minZoom: MIN_ZOOM,
        // maxZoom은 지정하지 않음 → API 지원 한도까지 확대 허용
        restriction: {
          latLngBounds: KOREA_BOUNDS,
          strictBounds: true,
        },
        disableDefaultUI: true,
        gestureHandling: 'greedy',
        styles: FIXED_MAP_STYLES, // Map ID가 없어야 이 스타일이 정상 작동함
      });
      mapInstanceRef.current = map;

      map.addListener('zoom_changed', () => {
        const newZoom = map.getZoom();
        if (newZoom !== undefined) {
          onZoomChangedRef.current?.(newZoom);
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
  }, [isLoaded, zoom]);

  return { mapRef, mapInstanceRef };
}

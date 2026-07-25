import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { MapCoordinate, MapPlace, MapPin, DEFAULT_CENTER } from '../types';
import { useCurrentLocationMarker } from '../hooks/useCurrentLocationMarker';
import { useMapPinOverlays } from '../hooks/useMapPinOverlays';
import { usePlaceMarkers } from '../hooks/usePlaceMarkers';

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

type MapViewerProps = {
  isLoaded: boolean;
  zoom: number;
  placeResults: MapPlace[];
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

  const onCenterChangedRef = useRef(onCenterChanged);

  useEffect(() => {
    onCenterChangedRef.current = onCenterChanged;
  }, [onCenterChanged]);

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

  const { recenterToCurrentLocation } = useCurrentLocationMarker({
    mapInstanceRef,
    isLoaded,
    onCenterChanged,
  });

  useImperativeHandle(ref, () => ({ recenterToCurrentLocation }), [recenterToCurrentLocation]);

  usePlaceMarkers({ mapInstanceRef, isLoaded, placeResults, selectedPlaceId, onSelectPlace });
  useMapPinOverlays({ mapInstanceRef, isLoaded, mapPins, selectedMapPinId, onSelectMapPin });

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

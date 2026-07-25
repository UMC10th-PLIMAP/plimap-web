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
      // --- 구글맵 인스턴스 초기 생성 (벡터 맵: 스타일은 Cloud Console에서 Map ID에 연결된 것을 사용) ---
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
        mapId: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID,
      });
      mapInstanceRef.current = map;

      // TEMP DEBUG: 실기기에서 vector/raster 렌더링 여부를 화면에서 바로 확인하기 위한 임시 배지. 확인 끝나면 제거할 것.
      const debugBadge = document.createElement('div');
      debugBadge.style.cssText =
        'position:fixed;top:8px;left:8px;z-index:9999;padding:4px 8px;background:rgba(0,0,0,0.75);color:#0f0;font-size:12px;font-family:monospace;border-radius:4px;pointer-events:none;';
      document.body.appendChild(debugBadge);
      const updateDebugBadge = () => {
        debugBadge.textContent = `renderingType: ${map.getRenderingType()}`;
      };
      updateDebugBadge();
      map.addListener('renderingtype_changed', updateDebugBadge);

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

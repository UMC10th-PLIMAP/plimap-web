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

      // TEMP DEBUG: vector/raster 여부 + 강제 회전 버튼. 확인 끝나면 제거할 것.
      const debugWrapper = document.createElement('div');
      debugWrapper.style.cssText =
        'position:fixed;top:8px;left:8px;z-index:9999;display:flex;flex-direction:column;gap:4px;font-family:monospace;';
      const debugBadge = document.createElement('div');
      debugBadge.style.cssText =
        'padding:4px 8px;background:rgba(0,0,0,0.75);color:#0f0;font-size:12px;border-radius:4px;';
      const updateDebugBadge = () => {
        debugBadge.textContent = `renderingType: ${map.getRenderingType()}`;
      };
      updateDebugBadge();
      map.addListener('renderingtype_changed', updateDebugBadge);
      const debugButton = document.createElement('button');
      debugButton.textContent = 'Rotate +45°';
      debugButton.style.cssText =
        'padding:6px 10px;background:rgba(0,0,0,0.75);color:#0f0;font-size:12px;font-family:monospace;border-radius:4px;border:1px solid #0f0;';
      debugButton.addEventListener('click', () => {
        const currentHeading = map.getHeading() ?? 0;
        map.setHeading((currentHeading + 45) % 360);
      });
      debugWrapper.appendChild(debugBadge);
      debugWrapper.appendChild(debugButton);
      document.body.appendChild(debugWrapper);

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

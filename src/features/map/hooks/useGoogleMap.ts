import { useCallback, useEffect, useRef } from 'react';
import { DEFAULT_CENTER, type MapCoordinate, type MapViewport } from '../types';

// 지도 줌 하한선 (레벨 단위 유지, 상한선은 API 지원 한도까지 허용)
const MIN_ZOOM = 6;
const CENTER_EQUALITY_EPSILON = 1e-9;

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
  initialCenter?: MapCoordinate;
  isInteractionDisabled?: boolean;
  onZoomChanged?: (newZoom: number) => void;
  onCenterChanged?: (center: MapCoordinate) => void;
  onViewportChanged?: (viewport: MapViewport) => void;
};

type PanToOptions = {
  notifyCenterChanged?: boolean;
};

/** 구글맵 인스턴스를 생성하고, zoom/center 변경을 리스닝한다. */
export function useGoogleMap({
  isLoaded,
  zoom,
  initialCenter = DEFAULT_CENTER,
  isInteractionDisabled = false,
  onZoomChanged,
  onCenterChanged,
  onViewportChanged,
}: UseGoogleMapParams) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const onCenterChangedRef = useRef(onCenterChanged);
  const onZoomChangedRef = useRef(onZoomChanged);
  const onViewportChangedRef = useRef(onViewportChanged);
  const initialCenterRef = useRef(initialCenter);
  const suppressNextCenterChangedRef = useRef(false);

  useEffect(() => {
    onCenterChangedRef.current = onCenterChanged;
  }, [onCenterChanged]);

  useEffect(() => {
    onZoomChangedRef.current = onZoomChanged;
  }, [onZoomChanged]);

  useEffect(() => {
    onViewportChangedRef.current = onViewportChanged;
  }, [onViewportChanged]);

  useEffect(() => {
    mapInstanceRef.current?.setOptions({
      gestureHandling: isInteractionDisabled ? 'none' : 'greedy',
      keyboardShortcuts: !isInteractionDisabled,
    });
  }, [isInteractionDisabled]);

  useEffect(() => {
    const mapsApi = window.google?.maps;
    if (!isLoaded || !mapRef.current || !mapsApi) return;

    if (!mapInstanceRef.current) {
      const mapId = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID;
      if (!mapId) {
        // Map ID 없이는 벡터 렌더링(회전/틸트)과 Cloud Console 스타일이 전부 비활성화된다.
        console.error(
          'VITE_GOOGLE_MAPS_MAP_ID is missing — falling back to an unstyled, non-rotatable raster map.',
        );
      }

      // --- 구글맵 인스턴스 초기 생성 (벡터 맵: 스타일은 Cloud Console에서 Map ID에 연결된 것을 사용) ---
      const map = new mapsApi.Map(mapRef.current, {
        center: initialCenterRef.current,
        zoom,
        isFractionalZoomEnabled: true,
        minZoom: MIN_ZOOM,
        // maxZoom은 지정하지 않음 → API 지원 한도까지 확대 허용
        restriction: {
          latLngBounds: KOREA_BOUNDS,
          strictBounds: false,
        },
        disableDefaultUI: true,
        gestureHandling: isInteractionDisabled ? 'none' : 'greedy',
        keyboardShortcuts: !isInteractionDisabled,
        // 지하철역/POI 아이콘 클릭 시 뜨는 구글 기본 정보창 비활성화
        clickableIcons: false,
        ...(mapId ? { mapId } : {}),
      });
      mapInstanceRef.current = map;

      map.addListener('zoom_changed', () => {
        const newZoom = map.getZoom();
        if (newZoom !== undefined) {
          onZoomChangedRef.current?.(newZoom);
        }
      });

      map.addListener('dragstart', () => {
        suppressNextCenterChangedRef.current = false;
      });

      map.addListener('idle', () => {
        const newCenter = map.getCenter();
        const bounds = map.getBounds();
        const newZoom = map.getZoom();
        if (!newCenter || !bounds || newZoom === undefined) return;

        const center = {
          lat: newCenter.lat(),
          lng: newCenter.lng(),
        };
        if (!suppressNextCenterChangedRef.current) {
          onCenterChangedRef.current?.(center);
        }
        suppressNextCenterChangedRef.current = false;

        const southWest = bounds.getSouthWest();
        const northEast = bounds.getNorthEast();
        onViewportChangedRef.current?.({
          center,
          zoom: newZoom,
          bounds: {
            southWest: { lat: southWest.lat(), lng: southWest.lng() },
            northEast: { lat: northEast.lat(), lng: northEast.lng() },
          },
        });
      });
    } else if (mapInstanceRef.current.getZoom() !== zoom) {
      mapInstanceRef.current.setZoom(zoom);
    }
  }, [isInteractionDisabled, isLoaded, zoom]);

  const panTo = useCallback((coordinate: MapCoordinate, options?: PanToOptions) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const currentCenter = map.getCenter();
    if (
      currentCenter &&
      Math.abs(currentCenter.lat() - coordinate.lat) < CENTER_EQUALITY_EPSILON &&
      Math.abs(currentCenter.lng() - coordinate.lng) < CENTER_EQUALITY_EPSILON
    ) {
      suppressNextCenterChangedRef.current = false;
      return;
    }

    suppressNextCenterChangedRef.current = options?.notifyCenterChanged === false;
    map.panTo(coordinate);
  }, []);

  return { mapRef, mapInstanceRef, panTo };
}

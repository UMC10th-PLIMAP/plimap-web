import { useCallback, useEffect, useRef } from 'react';
import { DEFAULT_CENTER, type MapCoordinate, type MapViewport } from '../types';
import { flyToLocation, FLY_TO_DURATION_MS } from '../utils/mapCamera';

// 지도 줌 하한/상한선 (핀 포커스 줌 레벨과 동일하게 상한 고정)
const MIN_ZOOM = 6;
const MAX_ZOOM = 21;
const CENTER_EQUALITY_EPSILON = 1e-9;
const CENTER_CHANGE_SUPPRESSION_TIMEOUT_MS = 2_000;
// flyTo 애니메이션이 프레임마다 setZoom을 호출하는 동안, 그 zoom_changed
// 이벤트가 React state로 되먹임되어 useGoogleMap의 zoom prop 동기화 effect와
// 서로 다시 setZoom을 부르는 루프가 생기는 것을 막기 위한 억제 구간.
const FLY_TO_ZOOM_SUPPRESSION_TIMEOUT_MS = FLY_TO_DURATION_MS + 100;

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
  /** 핀 등 오버레이가 아닌, 지도의 빈 영역을 클릭했을 때만 호출된다. */
  onMapClick?: () => void;
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
  onMapClick,
}: UseGoogleMapParams) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const onCenterChangedRef = useRef(onCenterChanged);
  const onZoomChangedRef = useRef(onZoomChanged);
  const onViewportChangedRef = useRef(onViewportChanged);
  const onMapClickRef = useRef(onMapClick);
  const initialCenterRef = useRef(initialCenter);
  const suppressNextCenterChangedRef = useRef(false);
  const centerChangeSuppressionTimeoutRef = useRef<number | null>(null);
  const isFlyingRef = useRef(false);
  const flyingCancelRef = useRef<(() => void) | null>(null);
  const flyingTimeoutRef = useRef<number | null>(null);

  const clearCenterChangeSuppression = useCallback(() => {
    suppressNextCenterChangedRef.current = false;
    if (centerChangeSuppressionTimeoutRef.current !== null) {
      window.clearTimeout(centerChangeSuppressionTimeoutRef.current);
      centerChangeSuppressionTimeoutRef.current = null;
    }
  }, []);

  const clearFlyingSuppression = useCallback(() => {
    isFlyingRef.current = false;
    if (flyingTimeoutRef.current !== null) {
      window.clearTimeout(flyingTimeoutRef.current);
      flyingTimeoutRef.current = null;
    }
  }, []);

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
    onMapClickRef.current = onMapClick;
  }, [onMapClick]);

  useEffect(() => {
    mapInstanceRef.current?.setOptions({
      gestureHandling: isInteractionDisabled ? 'none' : 'greedy',
      keyboardShortcuts: !isInteractionDisabled,
    });
  }, [isInteractionDisabled]);

  useEffect(() => {
    const mapElement = mapRef.current;
    if (!isLoaded || !mapElement) return;

    // A suppressed programmatic pan must never consume the next user-initiated
    // center update, even when the pan was clamped and emitted no idle event.
    const handleUserInteraction = () => clearCenterChangeSuppression();
    mapElement.addEventListener('pointerdown', handleUserInteraction, true);
    mapElement.addEventListener('wheel', handleUserInteraction, true);
    mapElement.addEventListener('keydown', handleUserInteraction, true);

    return () => {
      mapElement.removeEventListener('pointerdown', handleUserInteraction, true);
      mapElement.removeEventListener('wheel', handleUserInteraction, true);
      mapElement.removeEventListener('keydown', handleUserInteraction, true);
    };
  }, [clearCenterChangeSuppression, isLoaded]);

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
        maxZoom: MAX_ZOOM,
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
        // panTo does not change zoom, so a zoom event belongs to another
        // interaction and must not inherit its center-change suppression.
        clearCenterChangeSuppression();
        // flyTo가 매 프레임 setZoom을 호출하는 동안 이 이벤트를 그대로 흘려보내면
        // zoom prop 동기화 effect가 다시 setZoom을 불러 서로 되먹임된다.
        if (isFlyingRef.current) return;
        const newZoom = map.getZoom();
        if (newZoom !== undefined) {
          onZoomChangedRef.current?.(newZoom);
        }
      });

      map.addListener('dragstart', () => {
        clearCenterChangeSuppression();
        clearFlyingSuppression();
      });

      // 핀 오버레이는 overlayMouseTarget 페인에서 클릭을 자체 처리하므로,
      // 이 리스너는 오버레이가 없는 빈 영역을 클릭했을 때만 호출된다.
      map.addListener('click', () => {
        onMapClickRef.current?.();
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
        clearCenterChangeSuppression();
        // flyTo 애니메이션이 자연스럽게 끝나 idle이 뜨면, 타임아웃을 기다리지
        // 않고 바로 억제를 풀어서 최종 zoom/center가 지체 없이 반영되게 한다.
        clearFlyingSuppression();

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
    } else if (!isFlyingRef.current && mapInstanceRef.current.getZoom() !== zoom) {
      mapInstanceRef.current.setZoom(zoom);
    }
  }, [clearCenterChangeSuppression, clearFlyingSuppression, isInteractionDisabled, isLoaded, zoom]);

  useEffect(() => clearCenterChangeSuppression, [clearCenterChangeSuppression]);
  useEffect(() => {
    return () => {
      flyingCancelRef.current?.();
      clearFlyingSuppression();
    };
  }, [clearFlyingSuppression]);

  const flyTo = useCallback(
    (position: MapCoordinate, targetZoom: number, onArrive?: () => void) => {
      const map = mapInstanceRef.current;
      if (!map) return;

      flyingCancelRef.current?.();
      clearFlyingSuppression();
      isFlyingRef.current = true;
      flyingCancelRef.current = flyToLocation(map, position, targetZoom, () => {
        // 마지막 프레임의 zoom_changed는 비동기라, 값이 직전 프레임과 겹치면
        // 아예 안 올 수도 있다 - 그러면 억제가 풀린 뒤에도 zoom state가
        // targetZoom과 어긋난 채로 남아, 나중에 zoom 동기화 effect가 지도를
        // 그 오래된 값으로 되돌려버릴 수 있다. 이벤트에 의존하지 않고 도착
        // 시점에 직접 동기화한다.
        onZoomChangedRef.current?.(targetZoom);
        clearFlyingSuppression();
        onArrive?.();
      });
      // idle 이벤트 없이 애니메이션이 끝날 수도 있으므로, 시간 기반으로도 해제한다.
      flyingTimeoutRef.current = window.setTimeout(
        clearFlyingSuppression,
        FLY_TO_ZOOM_SUPPRESSION_TIMEOUT_MS,
      );
    },
    [clearFlyingSuppression],
  );

  const panTo = useCallback(
    (coordinate: MapCoordinate, options?: PanToOptions) => {
      const map = mapInstanceRef.current;
      if (!map) return;

      const currentCenter = map.getCenter();
      if (
        currentCenter &&
        Math.abs(currentCenter.lat() - coordinate.lat) < CENTER_EQUALITY_EPSILON &&
        Math.abs(currentCenter.lng() - coordinate.lng) < CENTER_EQUALITY_EPSILON
      ) {
        clearCenterChangeSuppression();
        return;
      }

      clearCenterChangeSuppression();
      if (options?.notifyCenterChanged === false) {
        suppressNextCenterChangedRef.current = true;
        // A restricted/no-op pan may emit neither center_changed nor idle.
        // User interaction clears suppression immediately; this timeout only
        // bounds the remaining no-event programmatic case.
        centerChangeSuppressionTimeoutRef.current = window.setTimeout(
          clearCenterChangeSuppression,
          CENTER_CHANGE_SUPPRESSION_TIMEOUT_MS,
        );
      }
      map.panTo(coordinate);
    },
    [clearCenterChangeSuppression],
  );

  return { mapRef, mapInstanceRef, panTo, flyTo };
}

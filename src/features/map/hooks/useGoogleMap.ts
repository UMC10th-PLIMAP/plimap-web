import { useCallback, useEffect, useRef } from 'react';
import { DEFAULT_CENTER, type MapCoordinate, type MapViewport } from '../types';
import { flyToLocation, getBoundsZoomLevel, FLY_TO_DURATION_MS } from '../utils/mapCamera';

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
  /** 사용자가 지도를 드래그(패닝)하기 시작했을 때 호출된다. */
  onMapDragStart?: () => void;
};

type PanToOptions = {
  notifyCenterChanged?: boolean;
};

function readMapViewport(map: google.maps.Map): MapViewport | null {
  const center = map.getCenter();
  const bounds = map.getBounds();
  const zoom = map.getZoom();
  if (!center || !bounds || zoom === undefined) return null;

  const southWest = bounds.getSouthWest();
  const northEast = bounds.getNorthEast();
  return {
    center: { lat: center.lat(), lng: center.lng() },
    zoom,
    bounds: {
      southWest: { lat: southWest.lat(), lng: southWest.lng() },
      northEast: { lat: northEast.lat(), lng: northEast.lng() },
    },
  };
}

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
  onMapDragStart,
}: UseGoogleMapParams) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const onCenterChangedRef = useRef(onCenterChanged);
  const onZoomChangedRef = useRef(onZoomChanged);
  const onViewportChangedRef = useRef(onViewportChanged);
  const onMapClickRef = useRef(onMapClick);
  const onMapDragStartRef = useRef(onMapDragStart);
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
    onMapDragStartRef.current = onMapDragStart;
  }, [onMapDragStart]);

  useEffect(() => {
    mapInstanceRef.current?.setOptions({
      gestureHandling: isInteractionDisabled ? 'none' : 'greedy',
      keyboardShortcuts: !isInteractionDisabled,
    });
  }, [isInteractionDisabled]);

  useEffect(() => {
    const mapElement = mapRef.current;
    if (!isLoaded || !mapElement) return;

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
        onMapDragStartRef.current?.();
      });

      // 핀 오버레이는 overlayMouseTarget 페인에서 클릭을 자체 처리하므로,
      // 이 리스너는 오버레이가 없는 빈 영역을 클릭했을 때만 호출된다.
      map.addListener('click', () => {
        onMapClickRef.current?.();
      });

      map.addListener('idle', () => {
        const nextViewport = readMapViewport(map);
        if (!nextViewport) return;

        const { center, zoom: newZoom } = nextViewport;
        if (!suppressNextCenterChangedRef.current) {
          onCenterChangedRef.current?.(center);
        }
        clearCenterChangeSuppression();
        // flyTo/fitBounds 애니메이션이 자연스럽게 끝나 idle이 뜨면, 타임아웃을
        // 기다리지 않고 바로 억제를 풀어서 최종 zoom/center가 지체 없이 반영되게 한다.
        clearFlyingSuppression();
        // fitBounds처럼 목표 줌을 미리 알 수 없는 프로그래매틱 이동은 도착 시점에
        // zoom_changed가 억제돼 React zoom state가 못 따라올 수 있다 - 지도가
        // 정지(idle)할 때마다 실제 줌으로 명시적으로 동기화해서, 다음 렌더에서
        // zoom 동기화 effect가 오래된 값으로 지도를 되돌리는 것을 막는다.
        onZoomChangedRef.current?.(newZoom);

        onViewportChangedRef.current?.(nextViewport);
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

  const fitToBounds = useCallback(
    (bounds: google.maps.LatLngBoundsLiteral) => {
      const map = mapInstanceRef.current;
      if (!map) return;

      // 네이티브 map.fitBounds()는 이 지도의 restriction(대한민국 경계 제한)과
      // 함께 쓰면 줌만 바뀌고 center는 restriction 중심으로 그대로 남는 버그가
      // 있어(실측 확인됨), 대신 bounds로 목표 줌을 직접 계산해 flyToLocation으로
      // 이동한다 - 핀 클릭 때와 동일한, 검증된 애니메이션 경로를 재사용하는 셈.
      const mapDiv = map.getDiv();
      const targetZoom = getBoundsZoomLevel(
        bounds,
        { width: mapDiv.clientWidth, height: mapDiv.clientHeight },
        MAX_ZOOM,
      );
      const center = {
        lat: (bounds.north + bounds.south) / 2,
        lng: (bounds.east + bounds.west) / 2,
      };

      flyingCancelRef.current?.();
      clearFlyingSuppression();
      isFlyingRef.current = true;
      flyingCancelRef.current = flyToLocation(map, center, targetZoom, () => {
        onZoomChangedRef.current?.(targetZoom);
        clearFlyingSuppression();
      });
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
        centerChangeSuppressionTimeoutRef.current = window.setTimeout(
          clearCenterChangeSuppression,
          CENTER_CHANGE_SUPPRESSION_TIMEOUT_MS,
        );
      }
      map.panTo(coordinate);
    },
    [clearCenterChangeSuppression],
  );

  const restoreViewport = useCallback(
    (viewport: MapViewport) => {
      const map = mapInstanceRef.current;
      if (!map) return;

      flyingCancelRef.current?.();
      clearFlyingSuppression();
      clearCenterChangeSuppression();

      map.setZoom(viewport.zoom);
      map.setCenter(viewport.center);
      onZoomChangedRef.current?.(viewport.zoom);
    },
    [clearCenterChangeSuppression, clearFlyingSuppression],
  );

  const captureViewport = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return null;

    flyingCancelRef.current?.();
    flyingCancelRef.current = null;
    clearFlyingSuppression();
    clearCenterChangeSuppression();

    const viewport = readMapViewport(map);
    if (!viewport) return null;

    // native panTo 애니메이션도 현재 프레임에서 멈추도록 같은 카메라 값을 다시 적용한다.
    map.setCenter(viewport.center);
    map.setZoom(viewport.zoom);
    onZoomChangedRef.current?.(viewport.zoom);
    return viewport;
  }, [clearCenterChangeSuppression, clearFlyingSuppression]);

  return {
    mapRef,
    mapInstanceRef,
    panTo,
    restoreViewport,
    captureViewport,
    flyTo,
    fitToBounds,
  };
}

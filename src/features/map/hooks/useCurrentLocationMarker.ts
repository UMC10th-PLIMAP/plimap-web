import { useCallback, useEffect, useRef, type RefObject } from 'react';
import { DEFAULT_MARKER_COLOR, type MapCoordinate } from '../types';
import {
  createCurrentLocationOverlay,
  type CurrentLocationOverlayHandle,
} from '../utils/currentLocationOverlay';

// "현재 위치로 이동" 버튼을 눌렀을 때 항상 이 줌으로 고정한다.
const RECENTER_ZOOM = 16;

// 이 시간 동안 더 정확한 fix가 안 오면, 정확도가 나빠졌더라도 최신 위치를 받아들인다.
// (GPS 신호가 실내 진입 등으로 영구적으로 나빠졌을 때 마커가 영원히 멈춰있는 것 방지)
const ACCURACY_STALE_MS = 10000;

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

type UseCurrentLocationMarkerParams = {
  mapInstanceRef: RefObject<google.maps.Map | null>;
  isLoaded: boolean;
  onCenterChanged?: (center: MapCoordinate) => void;
  onCurrentLocationChanged?: (coordinate: MapCoordinate) => void;
  onCurrentLocationError?: (message: string) => void;
  centerOnFirstLocation?: boolean;
};

/** 현재 위치 마커(방향 쐐기 포함)를 실시간으로 추적/렌더링하고, 재중심 이동 함수를 제공한다. */
export function useCurrentLocationMarker({
  mapInstanceRef,
  isLoaded,
  onCenterChanged,
  onCurrentLocationChanged,
  onCurrentLocationError,
  centerOnFirstLocation = true,
}: UseCurrentLocationMarkerParams) {
  const overlayRef = useRef<CurrentLocationOverlayHandle | null>(null);
  const positionRef = useRef<MapCoordinate | null>(null);
  const bestAccuracyRef = useRef(Infinity);
  const lastAcceptedAtRef = useRef(0);
  const onCenterChangedRef = useRef(onCenterChanged);
  const onCurrentLocationChangedRef = useRef(onCurrentLocationChanged);
  const onCurrentLocationErrorRef = useRef(onCurrentLocationError);
  const centerOnFirstLocationRef = useRef(centerOnFirstLocation);

  useEffect(() => {
    onCenterChangedRef.current = onCenterChanged;
  }, [onCenterChanged]);

  useEffect(() => {
    onCurrentLocationChangedRef.current = onCurrentLocationChanged;
  }, [onCurrentLocationChanged]);

  useEffect(() => {
    onCurrentLocationErrorRef.current = onCurrentLocationError;
  }, [onCurrentLocationError]);

  // --- 기기 방향 이벤트 처리 (방향 쐐기 회전) ---
  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    const heading = getCompassHeading(event);
    if (heading === null) return;
    overlayRef.current?.setHeading(heading);
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

        // 와이파이/기지국 기반의 부정확한 초기 fix 이후 더 정확한 fix가 갱신되면
        // 반영하되, 이미 더 정확한 값을 알고 있는데 정확도가 나빠진 갱신이 오면
        // (터널/실내 등) 무시해서 위치가 뒤로 튀지 않게 한다. 다만 그 상태로
        // ACCURACY_STALE_MS 이상 더 나은 fix가 안 오면, 마커가 영영 멈춰있지
        // 않도록 정확도와 상관없이 최신 위치를 받아들인다.
        const now = Date.now();
        const isStale = now - lastAcceptedAtRef.current > ACCURACY_STALE_MS;
        if (overlayRef.current && position.coords.accuracy > bestAccuracyRef.current && !isStale) {
          return;
        }
        bestAccuracyRef.current = position.coords.accuracy;
        lastAcceptedAtRef.current = now;

        const pos = { lat: position.coords.latitude, lng: position.coords.longitude };
        positionRef.current = pos;
        onCurrentLocationChangedRef.current?.(pos);

        if (!overlayRef.current) {
          if (centerOnFirstLocationRef.current) {
            map.setCenter(pos);
          }

          // 핀(overlayMouseTarget, zIndex 최대 200)보다 항상 위에 보이도록 floatPane에 렌더링한다.
          overlayRef.current = createCurrentLocationOverlay(DEFAULT_MARKER_COLOR, pos);
          overlayRef.current.setMap(map);

          enableCompassIfNeeded();

          if (centerOnFirstLocationRef.current) {
            onCenterChangedRef.current?.(pos);
          }
        } else {
          overlayRef.current.setPosition(pos);
        }
      },
      (error) => {
        if (ignore) return;
        console.warn('현재 위치를 갱신할 수 없습니다:', error.message);
        onCurrentLocationErrorRef.current?.(
          '현재 위치를 확인할 수 없어요. 위치 권한을 확인한 뒤 다시 시도해 주세요',
        );
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 },
    );

    return () => {
      ignore = true;
      navigator.geolocation.clearWatch(watchId);

      // 이펙트가 unmount 없이 재실행될 때(예: isLoaded가 껐다 켜지는 경우) 다음
      // 실행이 이전 오버레이/위치/정확도를 이어받지 않도록 완전히 초기화한다.
      overlayRef.current?.setMap(null);
      overlayRef.current = null;
      positionRef.current = null;
      bestAccuracyRef.current = Infinity;
      lastAcceptedAtRef.current = 0;
    };
  }, [isLoaded, enableCompassIfNeeded, mapInstanceRef]);

  // --- "현재 위치" 버튼에서 호출할 재중심 이동 ---
  const recenterToCurrentLocation = useCallback(() => {
    // 사용자 제스처 안에서 호출되므로 나침반 권한도 함께 요청한다 (iOS 요구사항)
    enableCompassIfNeeded();

    const map = mapInstanceRef.current;
    const position = positionRef.current;
    if (!map || !position) return;

    // 축소된 상태에서 panTo부터 하면 restriction이 넓은 뷰포트 기준으로
    // 좌표를 다시 clamp해버릴 수 있어, 줌을 먼저 좁힌 뒤에 이동한다.
    map.setZoom(RECENTER_ZOOM);
    map.panTo(position);
  }, [enableCompassIfNeeded, mapInstanceRef]);

  return { recenterToCurrentLocation };
}

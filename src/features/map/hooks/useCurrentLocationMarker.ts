import { useCallback, useEffect, useRef, type RefObject } from 'react';
import { DEFAULT_MARKER_COLOR, type MapCoordinate } from '../types';

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

type UseCurrentLocationMarkerParams = {
  mapInstanceRef: RefObject<google.maps.Map | null>;
  isLoaded: boolean;
  onCenterChanged?: (center: MapCoordinate) => void;
};

/** 현재 위치 마커(방향 쐐기 포함)를 실시간으로 추적/렌더링하고, 재중심 이동 함수를 제공한다. */
export function useCurrentLocationMarker({
  mapInstanceRef,
  isLoaded,
  onCenterChanged,
}: UseCurrentLocationMarkerParams) {
  const markerRef = useRef<google.maps.Marker | null>(null);
  const headingMarkerRef = useRef<google.maps.Marker | null>(null);
  const onCenterChangedRef = useRef(onCenterChanged);

  useEffect(() => {
    onCenterChangedRef.current = onCenterChanged;
  }, [onCenterChanged]);

  // --- 기기 방향 이벤트 처리 (클래식 마커 회전) ---
  const handleOrientation = useCallback(
    (event: DeviceOrientationEvent) => {
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
    },
    [mapInstanceRef],
  );

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
  }, [isLoaded, enableCompassIfNeeded, mapInstanceRef]);

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
  }, [enableCompassIfNeeded, mapInstanceRef]);

  return { recenterToCurrentLocation };
}

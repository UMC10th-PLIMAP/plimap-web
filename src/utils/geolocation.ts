import type { MapCoordinate } from '@/features/map/types';

const DEFAULT_POSITION_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  maximumAge: 0,
  timeout: 5000,
};

export type GetCurrentPositionResult =
  | { ok: true; coordinate: MapCoordinate }
  | { ok: false; reason: 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' | 'UNSUPPORTED' };

const toReason = (code: number): 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' => {
  switch (code) {
    case GeolocationPositionError.PERMISSION_DENIED:
      return 'PERMISSION_DENIED';
    case GeolocationPositionError.TIMEOUT:
      return 'TIMEOUT';
    default:
      return 'POSITION_UNAVAILABLE';
  }
};

/** 사용자의 현재 위치(위도/경도)를 한 번 조회한다. 실시간 추적이 필요하면 별도로 navigator.geolocation.watchPosition을 사용할 것. */
export function getCurrentPosition(
  options: PositionOptions = DEFAULT_POSITION_OPTIONS,
): Promise<GetCurrentPositionResult> {
  if (!navigator.geolocation) {
    return Promise.resolve({ ok: false, reason: 'UNSUPPORTED' });
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          ok: true,
          coordinate: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
        });
      },
      (error) => {
        resolve({ ok: false, reason: toReason(error.code) });
      },
      options,
    );
  });
}

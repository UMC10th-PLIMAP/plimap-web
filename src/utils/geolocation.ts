import type { MapCoordinate } from '@/features/map/types';

const DEFAULT_POSITION_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  maximumAge: 0,
  timeout: 5000,
};

export type GeolocationFailureReason =
  'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' | 'UNSUPPORTED';

export type GetCurrentPositionResult =
  { ok: true; coordinate: MapCoordinate } | { ok: false; reason: GeolocationFailureReason };

const toReason = (code: number): Exclude<GeolocationFailureReason, 'UNSUPPORTED'> => {
  switch (code) {
    case GeolocationPositionError.PERMISSION_DENIED:
      return 'PERMISSION_DENIED';
    case GeolocationPositionError.TIMEOUT:
      return 'TIMEOUT';
    default:
      return 'POSITION_UNAVAILABLE';
  }
};

export function getGeolocationErrorMessage(reason: GeolocationFailureReason): string {
  switch (reason) {
    case 'PERMISSION_DENIED':
      return '위치 권한이 필요해요. 설정에서 허용한 뒤 다시 시도해 주세요.';
    case 'TIMEOUT':
      return '위치를 확인하는 데 시간이 너무 오래 걸렸어요. 다시 시도해 주세요.';
    case 'UNSUPPORTED':
      return '이 환경에서는 위치를 사용할 수 없어요.';
    default:
      return '현재 위치를 확인할 수 없어요. 잠시 후 다시 시도해 주세요.';
  }
}

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

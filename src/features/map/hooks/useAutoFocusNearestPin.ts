import { useState } from 'react';

import { calculateDistanceMeters } from '@/features/map/utils/calculateDistanceMeters';
import type { MapPin, MapViewport } from '@/features/map/types';

// 최대 줌 레벨(핀 포커스 줌과 동일)에서만 자동 포커스를 켠다.
const AUTO_FOCUS_ZOOM = 21;
// 부동소수점 오차만 흡수할 정도의 좁은 허용치. Math.round를 쓰면 20.5~21.49도
// 전부 21로 반올림되어, 최대 줌이 아닌데도 자동 포커스가 켜지는 문제가 있었다.
const ZOOM_EQUALITY_EPSILON = 0.01;
// 선택/해제 반경을 다르게 둬서(hysteresis) 경계에서 깜빡이는 것을 방지한다.
const SELECT_RADIUS_METERS = 5;
const DESELECT_RADIUS_METERS = 6;

type UseAutoFocusNearestPinParams = {
  mapPins: MapPin[];
  viewport: MapViewport | null;
};

function findNearestPinWithinRadius(
  mapPins: MapPin[],
  center: MapViewport['center'],
  radiusMeters: number,
) {
  let nearestPinId: string | null = null;
  let nearestDistance = Infinity;
  for (const pin of mapPins) {
    const distance = calculateDistanceMeters(center, { lat: pin.lat, lng: pin.lng });
    if (distance <= radiusMeters && distance < nearestDistance) {
      nearestDistance = distance;
      nearestPinId = pin.id;
    }
  }
  return nearestPinId;
}

function resolveAutoFocusedPinId(
  currentId: string | null,
  mapPins: MapPin[],
  viewport: MapViewport | null,
) {
  if (!viewport || Math.abs(viewport.zoom - AUTO_FOCUS_ZOOM) > ZOOM_EQUALITY_EPSILON) return null;

  // 이미 포커스된 핀이 아직 해제 반경(6m) 안이면 그대로 유지한다.
  const currentPin = mapPins.find((pin) => pin.id === currentId);
  if (currentPin) {
    const distanceToCurrentPin = calculateDistanceMeters(viewport.center, {
      lat: currentPin.lat,
      lng: currentPin.lng,
    });
    if (distanceToCurrentPin <= DESELECT_RADIUS_METERS) return currentId;
  }

  return findNearestPinWithinRadius(mapPins, viewport.center, SELECT_RADIUS_METERS);
}

/**
 * 카메라가 idle(정지)될 때마다(= viewport가 바뀔 때마다) 화면 중심 기준으로
 * 가장 가까운 핀을 찾아 자동으로 포커스(말풍선 노출)한다. 바텀시트가
 * 열려있는지 여부와 무관하게 항상 동작한다 (일시정지 없음).
 *
 * effect 대신 "렌더 중 상태 조정" 패턴을 쓴다 - viewport 또는 mapPins 참조가
 * 바뀐 시점(=idle 이벤트로 뷰포트가 갱신되거나, 핀 목록이 새로 도착한 시점)에만
 * 다음 렌더로 상태를 갱신한다. mapPins만 따로 추적하지 않으면, 뷰포트가 이미
 * 최대 줌에 머물러 있는 상태에서 핀 목록이 뒤늦게 도착해도 자동 포커스가
 * 갱신되지 않는다.
 */
export function useAutoFocusNearestPin({ mapPins, viewport }: UseAutoFocusNearestPinParams) {
  const [autoFocusedPinId, setAutoFocusedPinId] = useState<string | null>(null);
  const [trackedViewport, setTrackedViewport] = useState(viewport);
  const [trackedMapPins, setTrackedMapPins] = useState(mapPins);

  if (viewport !== trackedViewport || mapPins !== trackedMapPins) {
    setTrackedViewport(viewport);
    setTrackedMapPins(mapPins);
    setAutoFocusedPinId(resolveAutoFocusedPinId(autoFocusedPinId, mapPins, viewport));
  }

  return autoFocusedPinId;
}

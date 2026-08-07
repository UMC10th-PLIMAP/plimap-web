import { useEffect, useRef, type RefObject } from 'react';
import type { MapCoordinate, PinCluster, PinClusterLevel } from '../types';
import {
  createClusterOverlay,
  disposeClusterOverlay,
  type ClusterOverlayEntry,
} from '../utils/mapClusterMarker';
import {
  createMapPinOverlay,
  disposeMapPinOverlay,
  type MapPinOverlayEntry,
} from '../utils/mapPinMarker';

// 클러스터 클릭 시, bounds가 한 점으로 퇴화됐는데 장소가 2개 이상인 경우(같은 좌표에
// 여러 장소가 겹친 경우) fitBounds 대신 이동할 다음 단계의 줌 레벨. 각 클러스터
// 레벨이 다음에 어떤 줌 구간으로 이어지는지는 확정된 줌 구간 표를 따른다.
const NEXT_TIER_ZOOM: Record<PinClusterLevel, number> = {
  REGION1: 8,
  REGION2: 11,
  REGION3: 14,
  GEOHASH: 20,
};

// 장소가 1개뿐인 클러스터는 단계를 하나씩 밟지 않고 바로 개별 핀이 보이는
// 줌으로 이동한다 (useMapPinOverlays.ts의 PIN_FOCUS_ZOOM과 동일).
const SINGLE_PLACE_ZOOM = 21;

// GEOHASH 클러스터와 개별 핀이 함께 보이기 시작하는 줌(14) 이상부터는, 장소가
// 1개뿐인 클러스터도 숫자 버블 대신 실제 핀 아이콘으로 그려서 개별 핀과 자연스럽게
// 섞이게 한다. 그보다 낮은 줌(행정구역 단위)에서는 지역 하나에 장소가 1개뿐이어도
// 핀 아이콘이 아니라 여전히 숫자 버블로 보여준다.
const SINGLE_PLACE_PIN_MIN_ZOOM = 14;

// 위경도 값은 서버 직렬화 과정에서 마지막 자리가 미세하게 달라질 수 있어, 정확히
// 같은 값인지(===)가 아니라 오차 허용 범위 안에 있는지로 퇴화 여부를 판단한다.
const DEGENERATE_BOUNDS_EPSILON = 1e-7;

const isDegenerateBounds = (bounds: PinCluster['bounds']) =>
  Math.abs(bounds.southWestLat - bounds.northEastLat) < DEGENERATE_BOUNDS_EPSILON &&
  Math.abs(bounds.southWestLng - bounds.northEastLng) < DEGENERATE_BOUNDS_EPSILON;

// 클러스터 "내용"이 같은지 판단하는 키 - 같으면 기존 오버레이를 재사용해 깜빡임을 막는다.
const clusterKey = (cluster: PinCluster) =>
  [
    cluster.clusterLevel,
    cluster.regionName ?? '',
    cluster.precision ?? '',
    cluster.latitude,
    cluster.longitude,
    cluster.placeCount,
    cluster.bounds.southWestLat,
    cluster.bounds.southWestLng,
    cluster.bounds.northEastLat,
    cluster.bounds.northEastLng,
  ].join(':');

type UseClusterOverlaysParams = {
  mapInstanceRef: RefObject<google.maps.Map | null>;
  isLoaded: boolean;
  clusters: PinCluster[];
  zoom: number;
  flyTo: (position: MapCoordinate, targetZoom: number, onArrive?: () => void) => void;
  fitToBounds: (bounds: google.maps.LatLngBoundsLiteral) => void;
  /** 장소 1개짜리 클러스터를 눌러 줌 21 이동을 마쳤을 때 호출된다(그 좌표를 넘겨줌). */
  onSingleClusterArrive?: (position: MapCoordinate) => void;
};

/**
 * 지도 위 핀 클러스터(OverlayView)를 렌더링하고, 클릭 시 해당 영역으로 확대한다.
 * 줌 14 이상에서 장소가 1개뿐인 클러스터는 숫자 버블 대신 실제 핀 아이콘으로 그려서
 * 개별 핀과 혼용된다.
 */
export function useClusterOverlays({
  mapInstanceRef,
  isLoaded,
  clusters,
  zoom,
  flyTo,
  fitToBounds,
  onSingleClusterArrive,
}: UseClusterOverlaysParams) {
  const clusterOverlaysRef = useRef<{ key: string; entry: ClusterOverlayEntry }[]>([]);
  const singlePlacePinOverlaysRef = useRef<{ key: string; entry: MapPinOverlayEntry }[]>([]);
  const flyToRef = useRef(flyTo);
  const fitToBoundsRef = useRef(fitToBounds);
  const onSingleClusterArriveRef = useRef(onSingleClusterArrive);
  // 소수점 zoom을 그대로 의존성에 넣으면 줌 애니메이션 프레임마다 다시 그려 깜빡이므로,
  // 14 문턱을 넘었는지 여부(불리언)만 의존성으로 쓴다.
  const showSinglePlaceAsPin = zoom >= SINGLE_PLACE_PIN_MIN_ZOOM;

  useEffect(() => {
    flyToRef.current = flyTo;
  }, [flyTo]);

  useEffect(() => {
    onSingleClusterArriveRef.current = onSingleClusterArrive;
  }, [onSingleClusterArrive]);

  useEffect(() => {
    fitToBoundsRef.current = fitToBounds;
  }, [fitToBounds]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!isLoaded || !map) return;

    // 키가 같은 클러스터는 지웠다 새로 그리지 않고 기존 오버레이를 재사용한다.
    const prevClusterByKey = new Map(
      clusterOverlaysRef.current.map(({ key, entry }) => [key, entry]),
    );
    const prevPinByKey = new Map(
      singlePlacePinOverlaysRef.current.map(({ key, entry }) => [key, entry]),
    );

    const nextClusterEntries: { key: string; entry: ClusterOverlayEntry }[] = [];
    const nextPinEntries: { key: string; entry: MapPinOverlayEntry }[] = [];

    clusters.forEach((cluster) => {
      const key = clusterKey(cluster);
      const position = { lat: cluster.latitude, lng: cluster.longitude };
      const isPinMode = cluster.placeCount === 1 && showSinglePlaceAsPin;

      if (isPinMode) {
        const existing = prevPinByKey.get(key);
        if (existing) {
          prevPinByKey.delete(key);
          nextPinEntries.push({ key, entry: existing });
          return;
        }
      } else {
        const existing = prevClusterByKey.get(key);
        if (existing) {
          prevClusterByKey.delete(key);
          nextClusterEntries.push({ key, entry: existing });
          return;
        }
      }

      const onClick = () => {
        if (cluster.placeCount === 1) {
          flyToRef.current(position, SINGLE_PLACE_ZOOM, () => {
            onSingleClusterArriveRef.current?.(position);
          });
          return;
        }

        if (isDegenerateBounds(cluster.bounds)) {
          flyToRef.current(position, NEXT_TIER_ZOOM[cluster.clusterLevel]);
          return;
        }

        fitToBoundsRef.current({
          south: cluster.bounds.southWestLat,
          west: cluster.bounds.southWestLng,
          north: cluster.bounds.northEastLat,
          east: cluster.bounds.northEastLng,
        });
      };

      if (isPinMode) {
        const entry = createMapPinOverlay({ position, onClick });
        entry.overlay.setMap(map);
        nextPinEntries.push({ key, entry });
        return;
      }

      const entry = createClusterOverlay({ position, placeCount: cluster.placeCount, onClick });
      entry.overlay.setMap(map);
      nextClusterEntries.push({ key, entry });
    });

    // 이번엔 안 쓰인(더 이상 없는) 이전 오버레이만 정리한다.
    prevClusterByKey.forEach((entry) => disposeClusterOverlay(entry));
    prevPinByKey.forEach((entry) => disposeMapPinOverlay(entry));

    clusterOverlaysRef.current = nextClusterEntries;
    singlePlacePinOverlaysRef.current = nextPinEntries;
  }, [isLoaded, clusters, showSinglePlaceAsPin, mapInstanceRef]);

  // 언마운트될 때만 정리한다 - 위 이펙트는 재실행마다 자체적으로 diff해서 정리한다.
  useEffect(() => {
    return () => {
      clusterOverlaysRef.current.forEach(({ entry }) => disposeClusterOverlay(entry));
      clusterOverlaysRef.current = [];
      singlePlacePinOverlaysRef.current.forEach(({ entry }) => disposeMapPinOverlay(entry));
      singlePlacePinOverlaysRef.current = [];
    };
  }, []);
}

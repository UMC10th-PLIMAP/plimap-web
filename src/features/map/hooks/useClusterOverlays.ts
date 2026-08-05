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

const isDegenerateBounds = (bounds: PinCluster['bounds']) =>
  bounds.southWestLat === bounds.northEastLat && bounds.southWestLng === bounds.northEastLng;

type UseClusterOverlaysParams = {
  mapInstanceRef: RefObject<google.maps.Map | null>;
  isLoaded: boolean;
  clusters: PinCluster[];
  zoom: number;
  flyTo: (position: MapCoordinate, targetZoom: number, onArrive?: () => void) => void;
  fitToBounds: (bounds: google.maps.LatLngBoundsLiteral) => void;
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
}: UseClusterOverlaysParams) {
  const clusterOverlaysRef = useRef<ClusterOverlayEntry[]>([]);
  const singlePlacePinOverlaysRef = useRef<MapPinOverlayEntry[]>([]);
  const flyToRef = useRef(flyTo);
  const fitToBoundsRef = useRef(fitToBounds);

  useEffect(() => {
    flyToRef.current = flyTo;
  }, [flyTo]);

  useEffect(() => {
    fitToBoundsRef.current = fitToBounds;
  }, [fitToBounds]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!isLoaded || !map) return;

    const clusterEntries: ClusterOverlayEntry[] = [];
    const singlePlacePinEntries: MapPinOverlayEntry[] = [];

    clusters.forEach((cluster) => {
      const position = { lat: cluster.latitude, lng: cluster.longitude };

      const onClick = () => {
        if (cluster.placeCount === 1) {
          flyToRef.current(position, SINGLE_PLACE_ZOOM);
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

      if (cluster.placeCount === 1 && zoom >= SINGLE_PLACE_PIN_MIN_ZOOM) {
        const entry = createMapPinOverlay({ position, onClick });
        entry.overlay.setMap(map);
        singlePlacePinEntries.push(entry);
        return;
      }

      const entry = createClusterOverlay({ position, placeCount: cluster.placeCount, onClick });
      entry.overlay.setMap(map);
      clusterEntries.push(entry);
    });

    clusterOverlaysRef.current = clusterEntries;
    singlePlacePinOverlaysRef.current = singlePlacePinEntries;

    return () => {
      clusterOverlaysRef.current.forEach(disposeClusterOverlay);
      clusterOverlaysRef.current = [];
      singlePlacePinOverlaysRef.current.forEach(disposeMapPinOverlay);
      singlePlacePinOverlaysRef.current = [];
    };
  }, [isLoaded, clusters, zoom, mapInstanceRef]);
}

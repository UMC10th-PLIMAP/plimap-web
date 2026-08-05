import { useEffect, useRef, type RefObject } from 'react';
import type { MapCoordinate, PinCluster, PinClusterLevel } from '../types';
import {
  createClusterOverlay,
  disposeClusterOverlay,
  type ClusterOverlayEntry,
} from '../utils/mapClusterMarker';

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

const isDegenerateBounds = (bounds: PinCluster['bounds']) =>
  bounds.southWestLat === bounds.northEastLat && bounds.southWestLng === bounds.northEastLng;

type UseClusterOverlaysParams = {
  mapInstanceRef: RefObject<google.maps.Map | null>;
  isLoaded: boolean;
  clusters: PinCluster[];
  flyTo: (position: MapCoordinate, targetZoom: number, onArrive?: () => void) => void;
  fitToBounds: (bounds: google.maps.LatLngBoundsLiteral) => void;
};

/** 지도 위 핀 클러스터(OverlayView)를 렌더링하고, 클릭 시 해당 영역으로 확대한다. */
export function useClusterOverlays({
  mapInstanceRef,
  isLoaded,
  clusters,
  flyTo,
  fitToBounds,
}: UseClusterOverlaysParams) {
  const clusterOverlaysRef = useRef<ClusterOverlayEntry[]>([]);
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

    clusterOverlaysRef.current = clusters.map((cluster) => {
      const entry = createClusterOverlay({
        position: { lat: cluster.latitude, lng: cluster.longitude },
        placeCount: cluster.placeCount,
        onClick: () => {
          if (cluster.placeCount === 1) {
            flyToRef.current({ lat: cluster.latitude, lng: cluster.longitude }, SINGLE_PLACE_ZOOM);
            return;
          }

          if (isDegenerateBounds(cluster.bounds)) {
            flyToRef.current(
              { lat: cluster.latitude, lng: cluster.longitude },
              NEXT_TIER_ZOOM[cluster.clusterLevel],
            );
            return;
          }

          fitToBoundsRef.current({
            south: cluster.bounds.southWestLat,
            west: cluster.bounds.southWestLng,
            north: cluster.bounds.northEastLat,
            east: cluster.bounds.northEastLng,
          });
        },
      });
      entry.overlay.setMap(map);

      return entry;
    });

    return () => {
      clusterOverlaysRef.current.forEach(disposeClusterOverlay);
      clusterOverlaysRef.current = [];
    };
  }, [isLoaded, clusters, mapInstanceRef]);
}

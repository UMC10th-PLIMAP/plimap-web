import { useEffect, useRef, type RefObject } from 'react';

import type { MapCluster } from '@/features/map/types';

type UseMapClusterOverlaysParams = {
  mapInstanceRef: RefObject<google.maps.Map | null>;
  isLoaded: boolean;
  clusters: MapCluster[];
  onSelectCluster?: (cluster: MapCluster) => void;
};

export function useMapClusterOverlays({
  mapInstanceRef,
  isLoaded,
  clusters,
  onSelectCluster,
}: UseMapClusterOverlaysParams) {
  const markersRef = useRef<google.maps.Marker[]>([]);
  const onSelectClusterRef = useRef(onSelectCluster);

  useEffect(() => {
    onSelectClusterRef.current = onSelectCluster;
  }, [onSelectCluster]);

  useEffect(() => {
    const mapsApi = window.google?.maps;
    const map = mapInstanceRef.current;
    if (!isLoaded || !mapsApi || !map) return;

    markersRef.current = clusters.map((cluster) => {
      const marker = new mapsApi.Marker({
        map,
        position: { lat: cluster.lat, lng: cluster.lng },
        label: {
          text: String(cluster.count),
          color: '#191919',
          fontSize: '13px',
          fontWeight: '600',
        },
        icon: {
          path: mapsApi.SymbolPath.CIRCLE,
          fillColor: '#C8F940',
          fillOpacity: 1,
          strokeColor: '#F7FE90',
          strokeWeight: 3,
          scale: 20,
        },
        title: `${cluster.regionName} PIN ${cluster.count}개`,
        zIndex: 80,
      });
      marker.addListener('click', () => onSelectClusterRef.current?.(cluster));
      return marker;
    });

    return () => {
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];
    };
  }, [clusters, isLoaded, mapInstanceRef]);
}

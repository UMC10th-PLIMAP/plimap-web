import { useEffect, useRef, type RefObject } from 'react';
import type { MapPin } from '../types';
import {
  createMapPinOverlay,
  disposeMapPinOverlay,
  toMapPinMarkerProps,
  updateMapPinMarker,
  type MapPinOverlayEntry,
} from '../utils/mapPinMarker';

type UseMapPinOverlaysParams = {
  mapInstanceRef: RefObject<google.maps.Map | null>;
  isLoaded: boolean;
  mapPins: MapPin[];
  selectedMapPinId: string | null;
  onSelectMapPin?: (pinId: string) => void;
};

/** 지도 위 핀(OverlayView)을 렌더링하고, 선택 상태에 따라 강조한다. */
export function useMapPinOverlays({
  mapInstanceRef,
  isLoaded,
  mapPins,
  selectedMapPinId,
  onSelectMapPin,
}: UseMapPinOverlaysParams) {
  const mapPinOverlaysRef = useRef<{ id: string; entry: MapPinOverlayEntry }[]>([]);
  const onSelectMapPinRef = useRef(onSelectMapPin);
  const selectedMapPinIdRef = useRef(selectedMapPinId);

  useEffect(() => {
    onSelectMapPinRef.current = onSelectMapPin;
  }, [onSelectMapPin]);

  useEffect(() => {
    selectedMapPinIdRef.current = selectedMapPinId;
  }, [selectedMapPinId]);

  // --- 지도 핀(OverlayView) 렌더링 ---
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!isLoaded || !map) return;

    const selectedId = selectedMapPinIdRef.current;

    mapPinOverlaysRef.current = mapPins.map((pin) => {
      const entry = createMapPinOverlay({
        position: { lat: pin.lat, lng: pin.lng },
        zIndex: pin.id === selectedId ? 200 : 100,
        onClick: () => onSelectMapPinRef.current?.(pin.id),
        ...toMapPinMarkerProps(pin, pin.id === selectedId),
      });
      entry.overlay.setMap(map);

      return { id: pin.id, entry };
    });

    return () => {
      mapPinOverlaysRef.current.forEach(({ entry }) => disposeMapPinOverlay(entry));
      mapPinOverlaysRef.current = [];
    };
  }, [isLoaded, mapPins, mapInstanceRef]);

  // --- 선택된 지도 핀 강조 ---
  useEffect(() => {
    mapPinOverlaysRef.current.forEach(({ id, entry }) => {
      const pin = mapPins.find((candidate) => candidate.id === id);
      if (!pin) return;

      const isSelected = id === selectedMapPinId;
      updateMapPinMarker(entry.mount, toMapPinMarkerProps(pin, isSelected));
      entry.overlay.setZIndex(isSelected ? 200 : 100);
    });
  }, [selectedMapPinId, mapPins]);
}

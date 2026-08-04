import { useEffect, useRef, type RefObject } from 'react';
import type { MapCoordinate, MapPin } from '../types';
import {
  createMapPinOverlay,
  disposeMapPinOverlay,
  toMapPinMarkerProps,
  updateMapPinMarker,
  type MapPinOverlayEntry,
} from '../utils/mapPinMarker';

// 핀 클릭 시 포커스할 줌 레벨
const PIN_FOCUS_ZOOM = 21;

type UseMapPinOverlaysParams = {
  mapInstanceRef: RefObject<google.maps.Map | null>;
  isLoaded: boolean;
  mapPins: MapPin[];
  selectedMapPinId: string | null;
  flyTo: (position: MapCoordinate, targetZoom: number, onArrive?: () => void) => void;
  onSelectMapPin?: (pinId: string) => void;
  onPlayPin?: (pinId: string) => void;
};

/** 지도 위 핀(OverlayView)을 렌더링하고, 선택 상태에 따라 강조한다. */
export function useMapPinOverlays({
  mapInstanceRef,
  isLoaded,
  mapPins,
  selectedMapPinId,
  flyTo,
  onSelectMapPin,
  onPlayPin,
}: UseMapPinOverlaysParams) {
  const mapPinOverlaysRef = useRef<{ id: string; entry: MapPinOverlayEntry }[]>([]);
  const onSelectMapPinRef = useRef(onSelectMapPin);
  const onPlayPinRef = useRef(onPlayPin);
  const selectedMapPinIdRef = useRef(selectedMapPinId);
  const flyToRef = useRef(flyTo);

  useEffect(() => {
    onSelectMapPinRef.current = onSelectMapPin;
  }, [onSelectMapPin]);

  useEffect(() => {
    onPlayPinRef.current = onPlayPin;
  }, [onPlayPin]);

  useEffect(() => {
    selectedMapPinIdRef.current = selectedMapPinId;
  }, [selectedMapPinId]);

  useEffect(() => {
    flyToRef.current = flyTo;
  }, [flyTo]);

  // --- 지도 핀(OverlayView) 렌더링 ---
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!isLoaded || !map) return;

    const selectedId = selectedMapPinIdRef.current;

    mapPinOverlaysRef.current = mapPins.map((pin) => {
      const entry = createMapPinOverlay({
        position: { lat: pin.lat, lng: pin.lng },
        zIndex: pin.id === selectedId ? 200 : 100,
        onClick: () => {
          // 카메라 이동이 다 끝난 뒤에 바텀시트를 열어서, 지도 애니메이션과
          // 시트 마운트가 동시에 일어나 화면이 안 뜨는 것처럼 보이지 않게 한다.
          flyToRef.current({ lat: pin.lat, lng: pin.lng }, PIN_FOCUS_ZOOM, () => {
            onSelectMapPinRef.current?.(pin.id);
          });
        },
        ...toMapPinMarkerProps(pin, pin.id === selectedId, () => onPlayPinRef.current?.(pin.id)),
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
      updateMapPinMarker(
        entry.mount,
        toMapPinMarkerProps(pin, isSelected, () => onPlayPinRef.current?.(pin.id)),
      );
      entry.overlay.setZIndex(isSelected ? 200 : 100);
    });
  }, [selectedMapPinId, mapPins]);
}

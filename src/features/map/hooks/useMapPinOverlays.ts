import { useEffect, useRef, type RefObject } from 'react';
import type { MapCoordinate, MapPin } from '../types';
import {
  createMapPinOverlay,
  disposeMapPinOverlay,
  toMapPinMarkerProps,
  updateMapPinMarker,
  type MapPinOverlayEntry,
} from '../utils/mapPinMarker';

// 핀 클릭 시 포커스할 줌 레벨. 말풍선도 이 줌 범위에서만 노출한다.
const PIN_FOCUS_ZOOM = 21;
// flyTo 도중 소수점 줌과 정확히 21을 구분하기 위한 오차 허용치.
const ZOOM_EQUALITY_EPSILON = 0.01;

type UseMapPinOverlaysParams = {
  mapInstanceRef: RefObject<google.maps.Map | null>;
  isLoaded: boolean;
  mapPins: MapPin[];
  selectedMapPinId: string | null;
  zoom: number;
  playingMapPinId?: string | null;
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
  zoom,
  playingMapPinId = null,
  flyTo,
  onSelectMapPin,
  onPlayPin,
}: UseMapPinOverlaysParams) {
  const mapPinOverlaysRef = useRef<{ id: string; entry: MapPinOverlayEntry }[]>([]);
  const onSelectMapPinRef = useRef(onSelectMapPin);
  const onPlayPinRef = useRef(onPlayPin);
  const selectedMapPinIdRef = useRef(selectedMapPinId);
  const playingMapPinIdRef = useRef(playingMapPinId);
  const flyToRef = useRef(flyTo);
  // 마커 재생성 이펙트가 zoom에 매 프레임 반응하면 깜빡이므로 최신 값은 ref로 읽는다.
  const isAtPinFocusZoomRef = useRef(Math.abs(zoom - PIN_FOCUS_ZOOM) <= ZOOM_EQUALITY_EPSILON);
  // 선택 상태 갱신 이펙트는 줌 21 문턱을 넘었는지(불리언)만 의존성으로 쓴다.
  const isAtPinFocusZoom = Math.abs(zoom - PIN_FOCUS_ZOOM) <= ZOOM_EQUALITY_EPSILON;

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
    playingMapPinIdRef.current = playingMapPinId;
  }, [playingMapPinId]);

  useEffect(() => {
    flyToRef.current = flyTo;
  }, [flyTo]);

  useEffect(() => {
    isAtPinFocusZoomRef.current = isAtPinFocusZoom;
  }, [isAtPinFocusZoom]);

  // --- 지도 핀(OverlayView) 렌더링 ---
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!isLoaded || !map) return;

    const selectedId = selectedMapPinIdRef.current;
    const playingId = playingMapPinIdRef.current;

    const prevById = new Map(mapPinOverlaysRef.current.map(({ id, entry }) => [id, entry]));
    const nextEntries: { id: string; entry: MapPinOverlayEntry }[] = [];

    const handlePinClick = (pin: MapPin) => () => {
      // 카메라 이동이 다 끝난 뒤에 바텀시트를 열어서, 지도 애니메이션과
      // 시트 마운트가 동시에 일어나 화면이 안 뜨는 것처럼 보이지 않게 한다.
      flyToRef.current({ lat: pin.lat, lng: pin.lng }, PIN_FOCUS_ZOOM, () => {
        onSelectMapPinRef.current?.(pin.id);
      });
    };

    mapPins.forEach((pin) => {
      const existing = prevById.get(pin.id);
      if (existing) {
        prevById.delete(pin.id);
        // 같은 id라도 좌표가 바뀔 수 있으니(예: 서버 좌표 보정) 위치와 클릭
        // 핸들러(클로저로 좌표를 캡처)를 최신 pin 기준으로 갱신한다.
        existing.overlay.setPosition({ lat: pin.lat, lng: pin.lng });
        existing.overlay.setOnClick(handlePinClick(pin));
        nextEntries.push({ id: pin.id, entry: existing });
        return;
      }

      const entry = createMapPinOverlay({
        position: { lat: pin.lat, lng: pin.lng },
        zIndex: pin.id === selectedId ? 200 : 100,
        onClick: handlePinClick(pin),
        ...toMapPinMarkerProps(
          pin,
          pin.id === selectedId,
          () => onPlayPinRef.current?.(pin.id),
          pin.id === playingId,
          pin.id === selectedId && isAtPinFocusZoomRef.current,
        ),
      });
      entry.overlay.setMap(map);
      nextEntries.push({ id: pin.id, entry });
    });

    prevById.forEach((entry) => disposeMapPinOverlay(entry));
    mapPinOverlaysRef.current = nextEntries;
  }, [isLoaded, mapPins, mapInstanceRef]);

  // 언마운트될 때만 정리한다 - 위 이펙트는 재실행마다 자체적으로 diff해서 정리한다.
  useEffect(() => {
    return () => {
      mapPinOverlaysRef.current.forEach(({ entry }) => disposeMapPinOverlay(entry));
      mapPinOverlaysRef.current = [];
    };
  }, []);

  // --- 선택된 지도 핀 강조 / 재생 상태 ---
  useEffect(() => {
    mapPinOverlaysRef.current.forEach(({ id, entry }) => {
      const pin = mapPins.find((candidate) => candidate.id === id);
      if (!pin) return;

      const isSelected = id === selectedMapPinId;
      updateMapPinMarker(
        entry.mount,
        toMapPinMarkerProps(
          pin,
          isSelected,
          () => onPlayPinRef.current?.(pin.id),
          id === playingMapPinId,
          isSelected && isAtPinFocusZoom,
        ),
      );
      entry.overlay.setZIndex(isSelected ? 200 : 100);
    });
  }, [selectedMapPinId, playingMapPinId, mapPins, isAtPinFocusZoom]);
}

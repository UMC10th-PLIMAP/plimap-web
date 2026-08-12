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
export const PIN_FOCUS_ZOOM = 21;
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
  /** 말풍선의 프로필(아바타·닉네임) 클릭 시 호출된다. writerId가 있는 핀만 클릭 가능해진다. */
  onOpenProfile?: (pin: MapPin) => void;
  /** 북마크 강조 모드 on/off. 켜져 있으면 hasBookmarkedPlace인 핀 색이 바뀐다. */
  isBookmarkHighlightOn?: boolean;
  areMapPinsDimmed?: boolean;
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
  onOpenProfile,
  isBookmarkHighlightOn = false,
  areMapPinsDimmed = false,
}: UseMapPinOverlaysParams) {
  const mapPinOverlaysRef = useRef<Map<string, MapPinOverlayEntry>>(new Map());
  const mapPinsByIdRef = useRef<Map<string, MapPin>>(new Map());
  const onSelectMapPinRef = useRef(onSelectMapPin);
  const onPlayPinRef = useRef(onPlayPin);
  const onOpenProfileRef = useRef(onOpenProfile);
  const selectedMapPinIdRef = useRef(selectedMapPinId);
  const playingMapPinIdRef = useRef(playingMapPinId);
  const flyToRef = useRef(flyTo);
  const isBookmarkHighlightOnRef = useRef(isBookmarkHighlightOn);
  // 마커 재생성 이펙트가 zoom에 매 프레임 반응하면 깜빡이므로 최신 값은 ref로 읽는다.
  const isAtPinFocusZoomRef = useRef(Math.abs(zoom - PIN_FOCUS_ZOOM) <= ZOOM_EQUALITY_EPSILON);
  // 선택 상태 갱신 이펙트는 줌 21 문턱을 넘었는지(불리언)만 의존성으로 쓴다.
  const isAtPinFocusZoom = Math.abs(zoom - PIN_FOCUS_ZOOM) <= ZOOM_EQUALITY_EPSILON;

  useEffect(() => {
    mapPinsByIdRef.current = new Map(mapPins.map((pin) => [pin.id, pin]));
  }, [mapPins]);

  useEffect(() => {
    onSelectMapPinRef.current = onSelectMapPin;
  }, [onSelectMapPin]);

  useEffect(() => {
    onPlayPinRef.current = onPlayPin;
  }, [onPlayPin]);

  useEffect(() => {
    onOpenProfileRef.current = onOpenProfile;
  }, [onOpenProfile]);

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
    isBookmarkHighlightOnRef.current = isBookmarkHighlightOn;
  }, [isBookmarkHighlightOn]);

  useEffect(() => {
    isAtPinFocusZoomRef.current = isAtPinFocusZoom;
  }, [isAtPinFocusZoom]);

  // --- 지도 핀(OverlayView) 렌더링 ---
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!isLoaded || !map) {
      mapPinOverlaysRef.current.forEach(disposeMapPinOverlay);
      mapPinOverlaysRef.current.clear();
      return;
    }

    const previousEntries = new Map(mapPinOverlaysRef.current);
    const nextEntries = new Map<string, MapPinOverlayEntry>();

    mapPins.forEach((pin) => {
      const onClick = areMapPinsDimmed
        ? undefined
        : () => {
            const latestPin = mapPinsByIdRef.current.get(pin.id);
            if (!latestPin) return;

            // 탭 피드백과 시트를 즉시 반영하고, 카메라 이동은 독립적으로 진행한다.
            onSelectMapPinRef.current?.(pin.id);
            flyToRef.current({ lat: latestPin.lat, lng: latestPin.lng }, PIN_FOCUS_ZOOM);
          };
      const existingEntry = previousEntries.get(pin.id);
      if (existingEntry) {
        previousEntries.delete(pin.id);
        existingEntry.overlay.setPosition({ lat: pin.lat, lng: pin.lng });
        existingEntry.overlay.setOnClick(onClick);
        nextEntries.set(pin.id, existingEntry);
        return;
      }

      const entry = createMapPinOverlay({
        position: { lat: pin.lat, lng: pin.lng },
        zIndex: pin.id === selectedMapPinIdRef.current ? 200 : 100,
        onClick,
        ...toMapPinMarkerProps(
          pin,
          pin.id === selectedMapPinIdRef.current,
          () => onPlayPinRef.current?.(pin.id),
          pin.id === playingMapPinIdRef.current,
          pin.id === selectedMapPinIdRef.current && isAtPinFocusZoomRef.current,
          isBookmarkHighlightOnRef.current && pin.hasBookmarkedPlace,
          pin.writerId != null ? () => onOpenProfileRef.current?.(pin) : undefined,
          areMapPinsDimmed,
        ),
      });
      entry.overlay.setMap(map);
      nextEntries.set(pin.id, entry);
    });

    previousEntries.forEach(disposeMapPinOverlay);
    mapPinOverlaysRef.current = nextEntries;
  }, [areMapPinsDimmed, isLoaded, mapPins, mapInstanceRef]);

  useEffect(
    () => () => {
      mapPinOverlaysRef.current.forEach(disposeMapPinOverlay);
      mapPinOverlaysRef.current.clear();
    },
    [],
  );

  // --- 선택된 지도 핀 강조 / 재생 상태 ---
  useEffect(() => {
    mapPinOverlaysRef.current.forEach((entry, id) => {
      const pin = mapPinsByIdRef.current.get(id);
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
          isBookmarkHighlightOn && pin.hasBookmarkedPlace,
          pin.writerId != null ? () => onOpenProfileRef.current?.(pin) : undefined,
          areMapPinsDimmed,
        ),
      );
      entry.overlay.setZIndex(isSelected ? 200 : 100);
    });
  }, [
    selectedMapPinId,
    playingMapPinId,
    mapPins,
    isAtPinFocusZoom,
    isBookmarkHighlightOn,
    areMapPinsDimmed,
  ]);
}

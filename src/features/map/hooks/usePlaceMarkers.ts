import { useEffect, useRef, type RefObject } from 'react';
import type { MapPlace } from '../types';

const createPlaceMarkerIcon = (
  mapsApi: typeof google.maps,
  isSelected: boolean,
): google.maps.Symbol => ({
  path: mapsApi.SymbolPath.CIRCLE,
  fillColor: isSelected ? '#2563eb' : '#111827',
  fillOpacity: 1,
  strokeColor: isSelected ? '#bfdbfe' : '#ffffff',
  strokeWeight: isSelected ? 4 : 3,
  scale: isSelected ? 13 : 11,
});

const createPlaceInfoContent = (place: MapPlace) => {
  const wrapper = document.createElement('div');
  wrapper.style.display = 'flex';
  wrapper.style.flexDirection = 'column';
  wrapper.style.gap = '4px';
  wrapper.style.maxWidth = '220px';
  wrapper.style.color = '#111827';
  wrapper.style.fontFamily = 'Pretendard, system-ui, sans-serif';

  const title = document.createElement('strong');
  title.textContent = place.placeName;
  title.style.fontSize = '14px';
  wrapper.appendChild(title);

  const meta = document.createElement('span');
  meta.textContent = place.category || '장소';
  meta.style.fontSize = '12px';
  meta.style.color = '#4b5563';
  wrapper.appendChild(meta);

  if (place.address) {
    const addressText = document.createElement('span');
    addressText.textContent = place.address;
    addressText.style.fontSize = '12px';
    addressText.style.color = '#6b7280';
    wrapper.appendChild(addressText);
  }

  return wrapper;
};

type UsePlaceMarkersParams = {
  mapInstanceRef: RefObject<google.maps.Map | null>;
  isLoaded: boolean;
  placeResults: MapPlace[];
  selectedPlaceId: string | null;
  onSelectPlace?: (placeId: string) => void;
};

/** 장소 검색 결과 마커를 지도에 렌더링하고, 선택된 장소를 강조 + 정보창으로 표시한다. */
export function usePlaceMarkers({
  mapInstanceRef,
  isLoaded,
  placeResults,
  selectedPlaceId,
  onSelectPlace,
}: UsePlaceMarkersParams) {
  const placeMarkersRef = useRef<{ id: string; place: MapPlace; marker: google.maps.Marker }[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const onSelectPlaceRef = useRef(onSelectPlace);
  const selectedPlaceIdRef = useRef(selectedPlaceId);

  useEffect(() => {
    onSelectPlaceRef.current = onSelectPlace;
  }, [onSelectPlace]);

  useEffect(() => {
    selectedPlaceIdRef.current = selectedPlaceId;
  }, [selectedPlaceId]);

  // --- 장소 검색 결과 마커 렌더링 ---
  useEffect(() => {
    const mapsApi = window.google?.maps;
    const map = mapInstanceRef.current;
    if (!isLoaded || !mapsApi || !map) return;

    placeMarkersRef.current.forEach(({ marker }) => {
      marker.setMap(null);
    });
    placeMarkersRef.current = [];
    infoWindowRef.current?.close();

    if (placeResults.length === 0) return;

    if (!infoWindowRef.current) {
      infoWindowRef.current = new mapsApi.InfoWindow();
    }

    const selectedId = selectedPlaceIdRef.current;

    placeMarkersRef.current = placeResults.map((place, index) => {
      const position = place.coordinates;
      const marker = new google.maps.Marker({
        map,
        position,
        title: place.placeName,
        label: {
          text: String(index + 1),
          color: '#ffffff',
          fontSize: '12px',
          fontWeight: '700',
        },
        icon: createPlaceMarkerIcon(mapsApi, place.id === selectedId),
        zIndex: place.id === selectedId ? 1000 : 1,
      });

      marker.addListener('click', () => {
        onSelectPlaceRef.current?.(place.id);
      });
      return { id: place.id, place, marker };
    });
  }, [isLoaded, placeResults, mapInstanceRef]);

  // --- 선택된 장소 강조 및 정보창 표시 ---
  useEffect(() => {
    const mapsApi = window.google?.maps;
    const map = mapInstanceRef.current;
    if (!mapsApi || !map) return;

    const infoWindow = infoWindowRef.current;

    placeMarkersRef.current.forEach((placeMarker) => {
      const isSelected = placeMarker.id === selectedPlaceId;
      placeMarker.marker.setIcon(createPlaceMarkerIcon(mapsApi, isSelected));
      placeMarker.marker.setZIndex(isSelected ? 1000 : 1);
    });

    const selectedMarker =
      placeMarkersRef.current.find((placeMarker) => placeMarker.id === selectedPlaceId) ?? null;

    if (!infoWindow || !selectedMarker) {
      infoWindow?.close();
      return;
    }

    infoWindow.setContent(createPlaceInfoContent(selectedMarker.place));
    infoWindow.open({
      map,
      anchor: selectedMarker.marker,
    });
  }, [selectedPlaceId, placeResults, mapInstanceRef]);
}

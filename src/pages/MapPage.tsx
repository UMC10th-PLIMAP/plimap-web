import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { SearchLauncher } from '@/components/ui/SearchInput';
import { Toast, ToastProvider, ToastViewport } from '@/components/ui/Toast';
import { Button } from '@/components/ui/button';
import type { MapCoordinate, MapPin, MapPlace, MapViewport } from '@/features/map/types';
import { loadGoogleMapsScript } from '@/features/map/utils';
import { MapViewer, type MapViewerHandle } from '@/features/map/components/MapViewer';
import { useMapPins } from '@/features/map/queries/useMapPins';
import { useAutoFocusNearestPin } from '@/features/map/hooks/useAutoFocusNearestPin';
import { DEV_MOCK_MAP_PINS } from '@/features/map/constants/devMockMapPins';
import { PinListSheet } from '@/features/pin/components/PinListSheet';
import type { PinSearchPlace, PlaceInfo } from '@/features/pin/types';
import BookmarkIcon from '@/assets/icons/bookmark.svg?react';
import FocusIcon from '@/assets/icons/focus.svg?react';
import { usePinCreationStore } from '@/store/pinCreationStore';

type MapLoadStatus = 'loading' | 'ready' | 'error';
const REGISTRATION_TOAST_DURATION_MS = 2_000;

type RegistrationToast = {
  attempt: number;
  message: string;
};

type MapPageProps = {
  selectedMapPlace: PinSearchPlace | null;
  onClearMapPlace?: () => void;
  selectedMapPinId: string | null;
  onSelectMapPinChange: (pinId: string | null) => void;
};

function toPlaceInfo(place: PinSearchPlace): PlaceInfo {
  return {
    id: place.id,
    placeId: place.placeId,
    name: place.placeName,
    creatorName: place.creatorName,
    distance: place.distance,
    address: place.address,
    latitude: place.coordinates.lat,
    longitude: place.coordinates.lng,
    bookmarkedByMe: place.bookmarkedByMe,
  };
}

// 지도 핀 탭으로 바텀시트를 열 때는 정확한 이름/거리를 아직 모른다 - PinListSheet가
// usePlaceDetail 응답을 받으면 그 값으로 채워준다.
function mapPinToPlaceInfo(pin: MapPin): PlaceInfo {
  return {
    id: pin.id,
    placeId: pin.placeId,
    name: '',
    distance: 0,
    latitude: pin.lat,
    longitude: pin.lng,
  };
}

const MapPage: React.FC<MapPageProps> = ({
  selectedMapPlace,
  onClearMapPlace,
  selectedMapPinId,
  onSelectMapPinChange,
}) => {
  const navigate = useNavigate();
  const hasApiKey = Boolean(import.meta.env.VITE_GOOGLE_MAPS_API_KEY);

  // --- 상태 관리 ---
  const [zoom, setZoom] = useState<number>(15);
  const [mapLoadStatus, setMapLoadStatus] = useState<MapLoadStatus>(
    hasApiKey ? 'loading' : 'error',
  );
  const [mapLoadError, setMapLoadError] = useState<string | null>(
    hasApiKey ? null : '지도를 불러올 수 없어요. 잠시 후 다시 시도해주세요.',
  );
  const [currentLocation, setCurrentLocation] = useState<MapCoordinate | null>(null);
  const [registrationToast, setRegistrationToast] = useState<RegistrationToast | null>(null);
  const [viewport, setViewport] = useState<MapViewport | null>(null);
  const { data: mapPinsData } = useMapPins(viewport);
  const mapPins =
    import.meta.env.DEV && mapPinsData !== undefined && mapPinsData.pins.length === 0
      ? DEV_MOCK_MAP_PINS
      : (mapPinsData?.pins ?? []);
  // 최대 줌에서 화면 중심 근처 핀을 자동으로 포커스 (탭으로 연 시트가 있으면 그게 우선)
  const autoFocusedPinId = useAutoFocusNearestPin({ mapPins, viewport });
  const displayedMapPinId = selectedMapPinId ?? autoFocusedPinId;
  const selectedMapPin = selectedMapPinId
    ? (mapPins.find((pin) => pin.id === selectedMapPinId) ?? null)
    : null;
  // develop 방식: selectedMapPlace prop으로 장소 결과 관리
  const placeResults = useMemo<MapPlace[]>(
    () => (selectedMapPlace ? [selectedMapPlace] : []),
    [selectedMapPlace],
  );
  const selectedPlaceId = selectedMapPlace?.id ?? null;
  const isPlaceSheetOpen = selectedMapPlace !== null;
  const resetPinCreation = usePinCreationStore((state) => state.reset);
  const setPinCreationCurrentLocation = usePinCreationStore((state) => state.setCurrentLocation);
  const setPinCreationPlace = usePinCreationStore((state) => state.setPlace);

  const mapViewerRef = useRef<MapViewerHandle>(null);

  // --- 구글맵 스크립트 로드 (setState는 전부 프로미스 콜백 안에서만 일어나 effect에서 안전하게 호출 가능) ---
  const startGoogleMapsLoad = useCallback((apiKey: string) => {
    loadGoogleMapsScript(apiKey)
      .then(() => {
        setMapLoadStatus('ready');
      })
      .catch((error) => {
        console.error(error);
        setMapLoadStatus('error');
        setMapLoadError('지도를 불러오지 못했어요. 네트워크 상태를 확인해주세요.');
      });
  }, []);

  useEffect(() => {
    // 키가 없으면 상태는 이미 초기값(error)이므로 로드를 시도하지 않는다.
    if (!hasApiKey) return;
    startGoogleMapsLoad(import.meta.env.VITE_GOOGLE_MAPS_API_KEY);
  }, [startGoogleMapsLoad, hasApiKey]);

  // --- 지도 로드 재시도 (실패한 스크립트 태그를 지우고 다시 요청, 클릭 핸들러이므로 동기 setState 가능) ---
  const handleRetryMapLoad = () => {
    document.getElementById('google-maps-script')?.remove();
    setMapLoadStatus('loading');
    setMapLoadError(null);

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
    if (!apiKey) {
      console.error('VITE_GOOGLE_MAPS_API_KEY is missing in environment variables');
      setMapLoadStatus('error');
      setMapLoadError('지도를 불러올 수 없어요. 잠시 후 다시 시도해주세요.');
      return;
    }

    startGoogleMapsLoad(apiKey);
  };

  // --- 줌(배율) 변경 핸들러 ---
  const handleZoomChange = (newZoom: number) => {
    setZoom(newZoom);
  };

  // --- 지도 빈 영역 탭: 핀 탭으로 연 시트 닫기 ---
  const handleMapClick = () => {
    onSelectMapPinChange(null);
  };

  const handleRegisterSelectedPlace = () => {
    if (!selectedMapPlace || selectedMapPlace.placeId === undefined) return;

    if (!currentLocation) {
      setRegistrationToast((currentToast) => ({
        attempt: (currentToast?.attempt ?? 0) + 1,
        message: '현재 위치를 확인하고 있어요. 위치 권한을 확인한 뒤 다시 시도해 주세요.',
      }));
      return;
    }

    resetPinCreation();
    setPinCreationCurrentLocation(currentLocation);
    setPinCreationPlace({
      placeId: selectedMapPlace.placeId,
      placeName: selectedMapPlace.placeName,
      address: selectedMapPlace.address,
      roadAddress: selectedMapPlace.searchSource?.roadAddress ?? null,
      source: selectedMapPlace.source ?? 'PLACE_SEARCH',
      coordinates: selectedMapPlace.coordinates,
      distanceMeters: selectedMapPlace.distance,
    });
    navigate('/app/song/list');
  };

  if (mapLoadStatus === 'error') {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-pli-black-100 p-6 text-center">
        <p className="body-15-r text-grayscale-300">{mapLoadError}</p>
        <button
          type="button"
          onClick={handleRetryMapLoad}
          className="rounded-full bg-neon px-6 py-3 body-15-sb text-grayscale-1250"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {/* 상단 장소 검색 바 + 북마크/현재 위치 버튼 */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-col">
        <div className="pointer-events-auto shrink-0 px-[15px] pt-[calc(env(safe-area-inset-top)+16px)]">
          <SearchLauncher
            className="map-search-hero"
            value={selectedMapPlace?.placeName}
            placeholder="장소를 검색하세요"
            onClick={() =>
              navigate('/app/pin/search', {
                state: { fromMap: true },
              })
            }
          />
        </div>

        <div className="flex flex-col items-end gap-3 p-4">
          <button
            type="button"
            aria-label="북마크"
            className="pointer-events-auto flex size-[52px] items-center justify-center rounded-full bg-pli-black-100 shadow-[0_0_4.21px_rgba(0,0,0,0.15)] backdrop-blur-[8.26px]"
          >
            <BookmarkIcon className="size-7" />
          </button>
          <button
            type="button"
            aria-label="현재 위치로 이동"
            onClick={() => mapViewerRef.current?.recenterToCurrentLocation()}
            className="pointer-events-auto flex size-[52px] items-center justify-center rounded-full bg-pli-black-100 shadow-[0_0_4.21px_rgba(0,0,0,0.15)] backdrop-blur-[8.26px]"
          >
            <FocusIcon className="size-7" />
          </button>
        </div>
      </div>

      {isPlaceSheetOpen ? (
        <ToastProvider duration={REGISTRATION_TOAST_DURATION_MS}>
          <div className="pointer-events-none fixed inset-x-0 bottom-[calc(50%+16px)] z-[60] mx-auto flex w-full max-w-[402px] justify-end px-4">
            <Button
              type="button"
              variant="pin"
              size="pin"
              className="pointer-events-auto"
              onClick={handleRegisterSelectedPlace}
              disabled={selectedMapPlace?.placeId === undefined}
            >
              등록하기
            </Button>
          </div>

          <div className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+23px)] z-[70] flex justify-center">
            {registrationToast ? (
              <Toast key={`${registrationToast.message}:${registrationToast.attempt}`} defaultOpen>
                {registrationToast.message}
              </Toast>
            ) : null}
            <ToastViewport />
          </div>
        </ToastProvider>
      ) : null}

      {selectedMapPlace ? (
        <PinListSheet
          open={isPlaceSheetOpen}
          onClose={() => onClearMapPlace?.()}
          place={toPlaceInfo(selectedMapPlace)}
          onPinClick={(pin) => navigate(`/app/pins/${pin.placeTrackId}`)}
        />
      ) : selectedMapPin ? (
        <PinListSheet
          open
          onClose={() => onSelectMapPinChange(null)}
          place={mapPinToPlaceInfo(selectedMapPin)}
          onPinClick={(pin) => navigate(`/app/pins/${pin.placeTrackId}`)}
        />
      ) : null}

      <MapViewer
        ref={mapViewerRef}
        isLoaded={mapLoadStatus === 'ready'}
        zoom={zoom}
        placeResults={placeResults}
        selectedPlaceId={selectedPlaceId}
        mapPins={mapPins}
        selectedMapPinId={displayedMapPinId}
        onZoomChanged={handleZoomChange}
        onCurrentLocationChanged={setCurrentLocation}
        onViewportChanged={setViewport}
        onSelectMapPin={onSelectMapPinChange}
        onMapClick={handleMapClick}
      />
    </div>
  );
};

export default MapPage;

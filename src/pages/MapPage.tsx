import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { SearchLauncher } from '@/components/ui/SearchInput';
import { Toast, ToastProvider, ToastViewport } from '@/components/ui/Toast';
import { Button } from '@/components/ui/button';
import type {
  MapCoordinate,
  MapPin,
  MapPlace,
  MapViewport,
  PinCluster,
} from '@/features/map/types';
import { loadGoogleMapsScript } from '@/features/map/utils';
import { MapViewer, type MapViewerHandle } from '@/features/map/components/MapViewer';
import { usePinMapView } from '@/features/map/queries/usePinMapView';
import { useAutoFocusNearestPin } from '@/features/map/hooks/useAutoFocusNearestPin';
import { DEV_MOCK_MAP_PINS } from '@/features/map/constants/devMockMapPins';
import { PinListSheet } from '@/features/pin/components/PinListSheet';
import type { PinSearchPlace, PlaceInfo } from '@/features/pin/types';
import BookmarkIcon from '@/assets/icons/bookmark.svg?react';
import FocusIcon from '@/assets/icons/focus.svg?react';
import { usePinCreationStore } from '@/store/pinCreationStore';

type MapLoadStatus = 'loading' | 'ready' | 'error';
const REGISTRATION_TOAST_DURATION_MS = 2_000;
// mapViewData 로딩 중(undefined)에는 매 렌더마다 새 배열 리터럴이 생기면 안 된다 -
// useAutoFocusNearestPin이 mapPins 참조 변경을 감지해 상태를 갱신하므로, 참조가
// 계속 바뀌면 무한 렌더 루프(React #301)가 된다.
const EMPTY_MAP_PINS: MapPin[] = [];
const EMPTY_MAP_CLUSTERS: PinCluster[] = [];

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
    isMine: place.isMine,
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
  const [currentLocationError, setCurrentLocationError] = useState<string | null>(null);
  const [registrationToast, setRegistrationToast] = useState<RegistrationToast | null>(null);
  const [viewport, setViewport] = useState<MapViewport | null>(null);
  const { data: mapViewData } = usePinMapView(viewport);
  // 클러스터가 있는 줌 구간(6~19)에서는 개별 핀이 0개인 게 정상이라, 목데이터로
  // 대체하면 안 된다 - 핀만 반환되는 구간(clusters가 없음)에서 실제로 핀이 하나도
  // 없을 때만 로컬 확인용 목데이터를 채운다.
  const shouldUseDevMockPins =
    import.meta.env.DEV &&
    mapViewData !== undefined &&
    (mapViewData.pins?.length ?? 0) === 0 &&
    (mapViewData.clusters?.length ?? 0) === 0;
  const mapPins = shouldUseDevMockPins ? DEV_MOCK_MAP_PINS : (mapViewData?.pins ?? EMPTY_MAP_PINS);
  const mapClusters = mapViewData?.clusters ?? EMPTY_MAP_CLUSTERS;
  // 피드/찜한 노래 진입 시: 말풍선용 핀을 주입·덮어쓰고 선택된 상태로 표시한다.
  // CTA(focusedFeedPin)와 말풍선(mapFocusPin)을 분리해, 찜한 노래에서는 내 등록 곡이 없어도 인기 PIN 말풍선은 유지한다.
  const overlayFocusPin = selectedMapPlace?.mapFocusPin ?? selectedMapPlace?.focusedFeedPin;
  const focusedMapPinId = selectedMapPlace && overlayFocusPin ? selectedMapPlace.id : null;
  const displayMapPins = useMemo(() => {
    if (!selectedMapPlace || !overlayFocusPin) return mapPins;

    const focusedPin: MapPin = {
      id: selectedMapPlace.id,
      placeId: selectedMapPlace.placeId,
      lat: selectedMapPlace.coordinates.lat,
      lng: selectedMapPlace.coordinates.lng,
      coverUrl: overlayFocusPin.albumImageUrl || undefined,
      nickname: overlayFocusPin.nickname,
      avatarUrl: overlayFocusPin.avatarUrl,
      introduction: overlayFocusPin.introduction,
    };

    return [...mapPins.filter((pin) => pin.id !== focusedPin.id), focusedPin];
  }, [mapPins, overlayFocusPin, selectedMapPlace]);
  // 최대 줌에서 화면 중심 근처 핀을 자동으로 포커스 (탭으로 연 시트가 있으면 그게 우선)
  const autoFocusedPinId = useAutoFocusNearestPin({ mapPins: displayMapPins, viewport });
  const displayedMapPinId = selectedMapPinId ?? autoFocusedPinId;
  const selectedMapPin = selectedMapPinId
    ? (displayMapPins.find((pin) => pin.id === selectedMapPinId) ?? null)
    : null;
  // develop 방식: selectedMapPlace prop으로 장소 결과 관리
  const placeResults = useMemo<MapPlace[]>(
    () => (selectedMapPlace ? [selectedMapPlace] : []),
    [selectedMapPlace],
  );
  const selectedPlaceId = selectedMapPlace?.id ?? null;
  const isPlaceSheetOpen = selectedMapPlace !== null;
  const viewerSelectedMapPinId = focusedMapPinId ?? (selectedMapPlace ? null : displayedMapPinId);
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

  // 선택된 장소가 있으면 해당 위도·경도로 지도를 이동한다.
  // 현재 위치 최초 센터링보다 우선한다.
  useEffect(() => {
    if (mapLoadStatus !== 'ready' || !selectedMapPlace) return;

    const coordinate = selectedMapPlace.coordinates;
    const frameId = window.requestAnimationFrame(() => {
      mapViewerRef.current?.panTo(coordinate);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [mapLoadStatus, selectedMapPlace]);

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

  const handleCurrentLocationChanged = (coordinate: MapCoordinate) => {
    setCurrentLocation(coordinate);
    setCurrentLocationError(null);
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

      {isPlaceSheetOpen && !selectedMapPlace?.focusedFeedPin ? (
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
          focusedFeedPin={selectedMapPlace.focusedFeedPin}
          detailLocation={
            selectedMapPlace.selectionLocation ??
            (currentLocation
              ? { latitude: currentLocation.lat, longitude: currentLocation.lng }
              : null)
          }
          detailLocationError={currentLocationError}
          onPinClick={(pin) => navigate(`/app/pins/${pin.placeTrackId}`)}
          onFocusedTrackClick={(placeTrackId) => navigate(`/app/pins/${placeTrackId}`)}
        />
      ) : selectedMapPin ? (
        <PinListSheet
          open
          onClose={() => onSelectMapPinChange(null)}
          place={mapPinToPlaceInfo(selectedMapPin)}
          detailLocation={
            currentLocation
              ? { latitude: currentLocation.lat, longitude: currentLocation.lng }
              : null
          }
          detailLocationError={currentLocationError}
          onPinClick={(pin) => navigate(`/app/pins/${pin.placeTrackId}`)}
        />
      ) : null}

      <MapViewer
        ref={mapViewerRef}
        isLoaded={mapLoadStatus === 'ready'}
        zoom={zoom}
        placeResults={placeResults}
        selectedPlaceId={selectedPlaceId}
        mapPins={displayMapPins}
        mapClusters={mapClusters}
        selectedMapPinId={viewerSelectedMapPinId}
        centerOnFirstLocation={!selectedMapPlace}
        onZoomChanged={handleZoomChange}
        onCurrentLocationChanged={handleCurrentLocationChanged}
        onCurrentLocationError={setCurrentLocationError}
        onViewportChanged={setViewport}
        onSelectMapPin={onSelectMapPinChange}
        onMapClick={handleMapClick}
      />
    </div>
  );
};

export default MapPage;

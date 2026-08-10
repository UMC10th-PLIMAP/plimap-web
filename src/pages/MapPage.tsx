import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { SearchLauncher } from '@/components/ui/SearchInput';
import { Toast, ToastPortal, ToastProvider, ToastViewport } from '@/components/ui/Toast';
import { Button } from '@/components/ui/button';
import type {
  MapCoordinate,
  MapPin,
  MapPlace,
  MapViewport,
  PinCluster,
} from '@/features/map/types';
import { loadGoogleMapsScript } from '@/features/map/utils';
import { calculateDistanceMeters } from '@/features/map/utils/calculateDistanceMeters';
import { MapViewer, type MapViewerHandle } from '@/features/map/components/MapViewer';
import { usePinMapView } from '@/features/map/queries/usePinMapView';
import { useAutoFocusNearestPin } from '@/features/map/hooks/useAutoFocusNearestPin';
import { PIN_FOCUS_ZOOM } from '@/features/map/hooks/useMapPinOverlays';
import { DEV_MOCK_MAP_PINS } from '@/features/map/constants/devMockMapPins';
import {
  PinListSheet,
  PIN_LIST_SHEET_MID_SNAP,
  type ResolvedPlaceSummary,
} from '@/features/pin/components/PinListSheet';
import type { PinSearchPlace, PlaceInfo } from '@/features/pin/types';
import BookmarkIcon from '@/assets/icons/bookmark.svg?react';
import FocusIcon from '@/assets/icons/focus.svg?react';
import { usePinCreationStore } from '@/store/pinCreationStore';
import { useYouTubeClipPlayer, preloadYouTubeIframeApi } from '@/hooks/useYouTubeClipPlayer';
import { useCurrentPosition } from '@/hooks/useCurrentPosition';

type MapLoadStatus = 'loading' | 'ready' | 'error';
const REGISTRATION_TOAST_DURATION_MS = 2_000;
// mapViewData 로딩 중(undefined)에는 매 렌더마다 새 배열 리터럴이 생기면 안 된다 -
// useAutoFocusNearestPin이 mapPins 참조 변경을 감지해 상태를 갱신하므로, 참조가
// 계속 바뀌면 무한 렌더 루프(React #301)가 된다.
const EMPTY_MAP_PINS: MapPin[] = [];
const EMPTY_MAP_CLUSTERS: PinCluster[] = [];
// 장소 1개짜리 클러스터를 눌러 줌 21로 이동한 뒤, 근처 몇 m 안 개별 핀을 같은 장소로 본다.
const SINGLE_CLUSTER_MATCH_RADIUS_METERS = 15;

type RegistrationToast = {
  attempt: number;
  message: string;
};

type MapPageProps = {
  selectedMapPlace: PinSearchPlace | null;
  onClearMapPlace?: () => void;
  selectedMapPinId: string | null;
  onSelectMapPinChange: (pinId: string | null) => void;
  isCovered: boolean;
  isUiActive: boolean;
  savedViewport: MapViewport | null;
  onSaveViewport: (viewport: MapViewport) => void;
  onCurrentLocationChange: (coordinate: MapCoordinate) => void;
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
  isCovered,
  isUiActive,
  savedViewport,
  onSaveViewport,
  onCurrentLocationChange,
}) => {
  const navigate = useNavigate();
  const hasApiKey = Boolean(import.meta.env.VITE_GOOGLE_MAPS_API_KEY);

  // --- 상태 관리 ---
  const [zoom, setZoom] = useState<number>(savedViewport?.zoom ?? 19);
  const [mapLoadStatus, setMapLoadStatus] = useState<MapLoadStatus>(
    hasApiKey ? 'loading' : 'error',
  );
  const [mapLoadError, setMapLoadError] = useState<string | null>(
    hasApiKey ? null : '지도를 불러올 수 없어요. 잠시 후 다시 시도해주세요.',
  );
  const [currentLocation, setCurrentLocation] = useState<MapCoordinate | null>(null);
  const [currentLocationError, setCurrentLocationError] = useState<string | null>(null);
  // 기본 좌표로 그렸다가 GPS 도착 시 옮기는 대신, 위치를 먼저 받아 바로 그 좌표로 지도를 만든다.
  const initialPositionQuery = useCurrentPosition({
    enabled: !savedViewport && !selectedMapPlace,
  });
  const hasInitialPosition =
    Boolean(savedViewport) ||
    Boolean(selectedMapPlace) ||
    initialPositionQuery.isSuccess ||
    initialPositionQuery.isError;
  // 초기 조회 결과를 currentLocation/부모 콜백에도 반영한다.
  const [trackedInitialPosition, setTrackedInitialPosition] = useState(initialPositionQuery.data);
  if (initialPositionQuery.data !== trackedInitialPosition) {
    setTrackedInitialPosition(initialPositionQuery.data);
    if (initialPositionQuery.data) {
      const coordinate = {
        lat: initialPositionQuery.data.latitude,
        lng: initialPositionQuery.data.longitude,
      };
      setCurrentLocation(coordinate);
      setCurrentLocationError(null);
      onCurrentLocationChange(coordinate);
    }
  }
  const [registrationToast, setRegistrationToast] = useState<RegistrationToast | null>(null);
  const [viewport, setViewport] = useState<MapViewport | null>(null);
  // 지도 빈 곳을 탭하면 시트를 닫지 않고 가장 작은 스냅으로만 축소한다 - 값은 의미 없이 신호로만 쓴다.
  const [sheetCollapseSignal, setSheetCollapseSignal] = useState(0);
  // 등록하기 버튼을 바텀시트 상단에 붙이기 위해 시트의 현재 활성 스냅(0~1)을 추적한다.
  const [activeSheetSnap, setActiveSheetSnap] = useState<number>(PIN_LIST_SHEET_MID_SNAP);
  // 버튼 위치도 스냅 추적과 같은 기준(window.innerHeight)의 픽셀값으로 계산한다.
  const [viewportInnerHeight, setViewportInnerHeight] = useState(() => window.innerHeight);
  useEffect(() => {
    const handleResize = () => setViewportInnerHeight(window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  // 등록하기 버튼 활성화 여부(500m 이내·본인 핀 아님) 판단용, 서버에서 해결된 장소 정보.
  const [resolvedActivePlace, setResolvedActivePlace] = useState<ResolvedPlaceSummary | null>(null);
  // 클러스터 응답엔 placeId가 없어 그 자리에서 시트를 못 여니, 목표 좌표를 잡아두고
  // 줌 21 재조회로 도착한 개별 핀 중 가장 가까운 걸 찾으면 선택한다.
  const [pendingClusterPinPosition, setPendingClusterPinPosition] = useState<MapCoordinate | null>(
    null,
  );
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
  // 핀을 선택한 뒤 지도를 축소(줌아웃)하면, 그 핀이 개별 핀이 아니라 클러스터로
  // 묶여 mapPins 응답에서 통째로 빠질 수 있다 - 그러면 마커·말풍선·바텀시트가 전부
  // 갑자기 사라진다. 선택된 핀의 마지막으로 알고 있던 데이터를 스냅샷으로 잡아두고,
  // mapPins에 없을 때만 displayMapPins에 그대로 얹어서 계속 보이게 한다.
  const [trackedSelectedPinId, setTrackedSelectedPinId] = useState(selectedMapPinId);
  const [selectedMapPinSnapshot, setSelectedMapPinSnapshot] = useState<MapPin | null>(null);

  if (selectedMapPinId !== trackedSelectedPinId) {
    setTrackedSelectedPinId(selectedMapPinId);
    setSelectedMapPinSnapshot(
      selectedMapPinId ? (mapPins.find((pin) => pin.id === selectedMapPinId) ?? null) : null,
    );
  }

  // 피드/찜한 노래 진입 시: 말풍선용 핀을 주입·덮어쓰고 선택된 상태로 표시한다.
  // CTA(focusedFeedPin)와 말풍선(mapFocusPin)을 분리해, 찜한 노래에서는 내 등록 곡이 없어도 인기 PIN 말풍선은 유지한다.
  const overlayFocusPin = selectedMapPlace?.mapFocusPin ?? selectedMapPlace?.focusedFeedPin;
  const focusedMapPinId = selectedMapPlace && overlayFocusPin ? selectedMapPlace.id : null;
  const displayMapPins = useMemo(() => {
    let pins = mapPins;

    if (selectedMapPinSnapshot && !pins.some((pin) => pin.id === selectedMapPinSnapshot.id)) {
      pins = [...pins, selectedMapPinSnapshot];
    }

    if (!selectedMapPlace || !overlayFocusPin) return pins;

    const focusedPin: MapPin = {
      id: selectedMapPlace.id,
      placeId: selectedMapPlace.placeId,
      lat: selectedMapPlace.coordinates.lat,
      lng: selectedMapPlace.coordinates.lng,
      coverUrl: overlayFocusPin.albumImageUrl || undefined,
      nickname: overlayFocusPin.nickname,
      avatarUrl: overlayFocusPin.avatarUrl,
      introduction: overlayFocusPin.introduction,
      youtubeVideoId: overlayFocusPin.youtubeVideoId,
      clipStartMs: overlayFocusPin.clipStartMs,
    };

    return [...pins.filter((pin) => pin.id !== focusedPin.id), focusedPin];
  }, [mapPins, overlayFocusPin, selectedMapPlace, selectedMapPinSnapshot]);
  // 최대 줌에서 화면 중심 근처 핀을 자동으로 포커스 (탭으로 연 시트가 있으면 그게 우선)
  const autoFocusedPinId = useAutoFocusNearestPin({ mapPins: displayMapPins, viewport });
  const displayedMapPinId = selectedMapPinId ?? autoFocusedPinId;
  const selectedMapPin = selectedMapPinId
    ? (displayMapPins.find((pin) => pin.id === selectedMapPinId) ?? null)
    : null;
  // develop 방식: selectedMapPlace prop으로 장소 결과 관리
  // 피드 진입(말풍선)일 때는 장소 검색 InfoWindow(흰 카드)를 띄우지 않는다.
  const isFeedMapEntry = Boolean(selectedMapPlace?.mapFocusPin ?? selectedMapPlace?.focusedFeedPin);
  const placeResults = useMemo<MapPlace[]>(
    () => (selectedMapPlace && !isFeedMapEntry ? [selectedMapPlace] : []),
    [isFeedMapEntry, selectedMapPlace],
  );
  const selectedPlaceId = selectedMapPlace && !isFeedMapEntry ? selectedMapPlace.id : null;
  const isPlaceSheetOpen = selectedMapPlace !== null && isUiActive;
  const viewerSelectedMapPinId = focusedMapPinId ?? (selectedMapPlace ? null : displayedMapPinId);
  // 검색 장소든 핀 클릭이든, 피드 진입이 아닐 때만 등록하기 버튼을 보여준다.
  const isRegisterButtonVisible =
    isUiActive && ((isPlaceSheetOpen && !isFeedMapEntry) || selectedMapPin !== null);
  // 아직 장소 정보가 안 왔거나(로딩 중), 500m 밖이거나, 본인 핀이면 등록할 수 없다.
  const isRegisterButtonDisabled =
    !resolvedActivePlace || resolvedActivePlace.isMine || !resolvedActivePlace.withinAccessRange;
  const resetPinCreation = usePinCreationStore((state) => state.reset);
  const setPinCreationCurrentLocation = usePinCreationStore((state) => state.setCurrentLocation);
  const setPinCreationPlace = usePinCreationStore((state) => state.setPlace);

  const mapViewerRef = useRef<MapViewerHandle>(null);
  const wasCoveredRef = useRef(isCovered);
  const {
    playingKey,
    toggle: toggleClipPlayback,
    stop: stopClipPlayback,
  } = useYouTubeClipPlayer({
    enabled: isUiActive,
  });

  useLayoutEffect(() => {
    const wasCovered = wasCoveredRef.current;
    wasCoveredRef.current = isCovered;

    if (!wasCovered && isCovered) {
      const liveViewport = mapViewerRef.current?.captureViewport();
      if (liveViewport) onSaveViewport(liveViewport);
      return;
    }

    if (!wasCovered || isCovered || !savedViewport || mapLoadStatus !== 'ready') return;

    mapViewerRef.current?.restoreViewport(savedViewport);
  }, [isCovered, mapLoadStatus, onSaveViewport, savedViewport]);

  const handlePlayMapPin = useCallback(
    (pinId: string) => {
      const pin = displayMapPins.find((candidate) => candidate.id === pinId);
      if (!pin?.youtubeVideoId) return;

      toggleClipPlayback(pinId, {
        videoId: pin.youtubeVideoId,
        clipStartMs: pin.clipStartMs ?? 0,
      });
    },
    [displayMapPins, toggleClipPlayback],
  );

  // 말풍선을 띄우는 핀이 바뀌면(선택·자동 포커스 포함) 재생 중인 클립을 멈춘다.
  useEffect(() => {
    stopClipPlayback();
  }, [viewerSelectedMapPinId, stopClipPlayback]);

  useEffect(() => {
    if (!isUiActive) stopClipPlayback();
  }, [isUiActive, stopClipPlayback]);

  // 목표 좌표 근처 핀을 찾으면(mapPins가 새로 도착할 때마다 재계산) 부모에게 선택을
  // 알린다. 부모 콜백은 렌더 중이 아니라 커밋 이후(effect)에 호출하고, 같은 핀을
  // 중복 호출하지 않도록 ref로 막는다.
  const pendingClusterNearestPin = pendingClusterPinPosition
    ? (displayMapPins.find(
        (pin) =>
          calculateDistanceMeters(pendingClusterPinPosition, { lat: pin.lat, lng: pin.lng }) <=
          SINGLE_CLUSTER_MATCH_RADIUS_METERS,
      ) ?? null)
    : null;
  const lastClusterSelectedIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!pendingClusterNearestPin) return;
    if (lastClusterSelectedIdRef.current === pendingClusterNearestPin.id) return;

    lastClusterSelectedIdRef.current = pendingClusterNearestPin.id;
    onSelectMapPinChange(pendingClusterNearestPin.id);
  }, [pendingClusterNearestPin, onSelectMapPinChange]);

  // 부모의 선택이 실제로 반영되면(selectedMapPinId가 갱신되면) 목표 좌표를 정리한다.
  if (pendingClusterPinPosition && selectedMapPinId === pendingClusterNearestPin?.id) {
    setPendingClusterPinPosition(null);
  }

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

  useEffect(() => {
    if (mapLoadStatus !== 'ready') return;
    preloadYouTubeIframeApi();
  }, [mapLoadStatus]);

  // 선택된 장소가 있으면 해당 위도·경도로 지도를 이동한다.
  // 피드 말풍선(mapFocusPin/focusedFeedPin)이 있으면 줌 21까지 올려 말풍선이 보이게 한다.
  useEffect(() => {
    if (mapLoadStatus !== 'ready' || !selectedMapPlace) return;

    const coordinate = selectedMapPlace.coordinates;
    const shouldShowFeedBubble = Boolean(
      selectedMapPlace.mapFocusPin ?? selectedMapPlace.focusedFeedPin,
    );
    const frameId = window.requestAnimationFrame(() => {
      if (shouldShowFeedBubble) {
        mapViewerRef.current?.flyTo(coordinate, PIN_FOCUS_ZOOM);
        return;
      }
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
    onCurrentLocationChange(coordinate);
  };

  const handleViewportChanged = (nextViewport: MapViewport) => {
    setViewport(nextViewport);
    if (!isCovered) onSaveViewport(nextViewport);
  };

  // 지도 빈 영역 탭/드래그 시작: 시트를 닫지 않고 가장 작은 스냅으로만 축소한다.
  const handleMapClick = () => {
    setSheetCollapseSignal((signal) => signal + 1);
  };

  // 두 플로우 모두 PinListSheet가 조회해 알려준 resolvedActivePlace 기준으로 등록한다.
  const handleRegisterActivePlace = () => {
    if (!resolvedActivePlace) return;

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
      placeId: resolvedActivePlace.placeId,
      placeName: resolvedActivePlace.placeName,
      address: resolvedActivePlace.address,
      roadAddress: resolvedActivePlace.roadAddress,
      source: selectedMapPlace?.source ?? 'PLACE_SEARCH',
      coordinates: { lat: resolvedActivePlace.latitude, lng: resolvedActivePlace.longitude },
      distanceMeters: resolvedActivePlace.distance,
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

  if (!hasInitialPosition) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-pli-black-100 p-6 text-center">
        <div
          aria-hidden
          className="size-8 animate-spin rounded-full border-2 border-grayscale-700 border-t-neon"
        />
        <p className="body-15-r text-grayscale-500">현재 위치를 확인하고 있어요</p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {/* 상단 장소 검색 바(또는 뒤로가기) + 북마크/현재 위치 버튼 */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-col">
        <div className="pointer-events-auto shrink-0 px-[15px] pt-[calc(env(safe-area-inset-top)+16px)]">
          {selectedMapPlace?.showMapBackButton ? (
            <button
              type="button"
              onClick={() => {
                onClearMapPlace?.();
                navigate(-1);
              }}
              className="cursor-pointer body-15-m text-grayscale-100"
            >
              뒤로가기
            </button>
          ) : (
            <SearchLauncher
              className="map-search-hero"
              value={selectedMapPlace?.placeName}
              placeholder="장소를 검색하세요"
              onClick={() => {
                // 선택된 장소가 검색어로 찾은 것이면 그 검색어를 그대로 복원해 검색
                // 결과 화면으로, 최근 검색에서 바로 고른 것이면 검색어 없이 최근
                // 검색 목록으로 들어간다.
                navigate('/app/pin/search', {
                  state: { fromMap: true, initialQuery: selectedMapPlace?.searchQuery ?? '' },
                });
              }}
              onClear={() => onClearMapPlace?.()}
            />
          )}
        </div>

        {!selectedMapPlace?.showMapBackButton ? (
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
        ) : null}
      </div>

      {isRegisterButtonVisible ? (
        <ToastProvider duration={REGISTRATION_TOAST_DURATION_MS}>
          <div
            className="pointer-events-none fixed inset-x-0 z-[60] mx-auto flex w-full max-w-[402px] justify-end px-4"
            style={{ bottom: `${activeSheetSnap * viewportInnerHeight + 16}px` }}
          >
            <Button
              type="button"
              variant="pin"
              size="pin"
              className="pointer-events-auto"
              onClick={handleRegisterActivePlace}
              disabled={isRegisterButtonDisabled}
            >
              등록하기
            </Button>
          </div>

          <ToastPortal>
            <div className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+23px)] z-[90] flex justify-center">
              {registrationToast ? (
                <Toast
                  key={`${registrationToast.message}:${registrationToast.attempt}`}
                  defaultOpen
                >
                  {registrationToast.message}
                </Toast>
              ) : null}
              <ToastViewport />
            </div>
          </ToastPortal>
        </ToastProvider>
      ) : null}

      {selectedMapPlace ? (
        <PinListSheet
          open={isPlaceSheetOpen}
          onClose={() => onClearMapPlace?.()}
          place={toPlaceInfo(selectedMapPlace)}
          focusedFeedPin={selectedMapPlace.focusedFeedPin}
          allowTrackDetailAccess={Boolean(selectedMapPlace.allowTrackDetailAccess)}
          detailLocation={{
            latitude:
              selectedMapPlace.selectionLocation?.latitude ??
              currentLocation?.lat ??
              selectedMapPlace.coordinates.lat,
            longitude:
              selectedMapPlace.selectionLocation?.longitude ??
              currentLocation?.lng ??
              selectedMapPlace.coordinates.lng,
          }}
          detailLocationError={currentLocationError}
          onPinClick={(pin) => {
            const latitude =
              currentLocation?.lat ??
              selectedMapPlace.selectionLocation?.latitude ??
              selectedMapPlace.coordinates.lat;
            const longitude =
              currentLocation?.lng ??
              selectedMapPlace.selectionLocation?.longitude ??
              selectedMapPlace.coordinates.lng;
            onClearMapPlace?.();
            navigate(`/app/pins/${pin.placeTrackId}`, {
              state: {
                userLatitude: latitude,
                userLongitude: longitude,
                placeAccessToken: selectedMapPlace.placeAccessToken,
              },
            });
          }}
          onFocusedTrackClick={(placeTrackId) => {
            const latitude =
              currentLocation?.lat ??
              selectedMapPlace.selectionLocation?.latitude ??
              selectedMapPlace.coordinates.lat;
            const longitude =
              currentLocation?.lng ??
              selectedMapPlace.selectionLocation?.longitude ??
              selectedMapPlace.coordinates.lng;
            onClearMapPlace?.();
            navigate(`/app/pins/${placeTrackId}`, {
              state: {
                userLatitude: latitude,
                userLongitude: longitude,
                placeAccessToken: selectedMapPlace.placeAccessToken,
              },
            });
          }}
          resetKey={selectedMapPlace.id}
          collapseToSmallestSignal={sheetCollapseSignal}
          onActiveSnapChange={setActiveSheetSnap}
          onResolvedPlaceChange={setResolvedActivePlace}
          // 검색으로 들어온 장소만 "<"를 누르면 검색 화면으로 돌아간다(피드 진입은 기본 접기).
          onFullPageBack={
            isFeedMapEntry
              ? undefined
              : () =>
                  navigate('/app/pin/search', {
                    state: { fromMap: true, initialQuery: selectedMapPlace.searchQuery ?? '' },
                  })
          }
        />
      ) : selectedMapPin ? (
        <PinListSheet
          open={isUiActive}
          onClose={() => onSelectMapPinChange(null)}
          place={mapPinToPlaceInfo(selectedMapPin)}
          allowTrackDetailAccess={false}
          resetKey={selectedMapPin.id}
          collapseToSmallestSignal={sheetCollapseSignal}
          onActiveSnapChange={setActiveSheetSnap}
          onResolvedPlaceChange={setResolvedActivePlace}
          detailLocation={{
            latitude: currentLocation?.lat ?? selectedMapPin.lat,
            longitude: currentLocation?.lng ?? selectedMapPin.lng,
          }}
          detailLocationError={currentLocationError}
          onPinClick={(pin) => {
            const latitude = currentLocation?.lat ?? selectedMapPin.lat;
            const longitude = currentLocation?.lng ?? selectedMapPin.lng;
            onSelectMapPinChange(null);
            navigate(`/app/pins/${pin.placeTrackId}`, {
              state: { userLatitude: latitude, userLongitude: longitude },
            });
          }}
        />
      ) : null}

      <MapViewer
        ref={mapViewerRef}
        isLoaded={mapLoadStatus === 'ready'}
        isInteractionDisabled={!isUiActive}
        isLocationTrackingDisabled={isCovered}
        zoom={zoom}
        initialCenter={
          savedViewport?.center ??
          (initialPositionQuery.data
            ? { lat: initialPositionQuery.data.latitude, lng: initialPositionQuery.data.longitude }
            : undefined)
        }
        placeResults={placeResults}
        selectedPlaceId={selectedPlaceId}
        mapPins={displayMapPins}
        mapClusters={mapClusters}
        selectedMapPinId={viewerSelectedMapPinId}
        centerOnFirstLocation={
          !selectedMapPlace && !savedViewport && !initialPositionQuery.isSuccess
        }
        onZoomChanged={handleZoomChange}
        onCurrentLocationChanged={handleCurrentLocationChanged}
        onCurrentLocationError={setCurrentLocationError}
        onViewportChanged={handleViewportChanged}
        onSelectMapPin={onSelectMapPinChange}
        onPlayPin={handlePlayMapPin}
        playingMapPinId={playingKey}
        onMapClick={handleMapClick}
        onMapDragStart={handleMapClick}
        onSingleClusterArrive={setPendingClusterPinPosition}
      />
    </div>
  );
};

export default MapPage;

import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from 'react';

import { isApiRequestCanceled } from '@/api/client';
import { SearchInput } from '@/components/ui/SearchInput';
import { PlaceSearchSkeleton } from '@/components/skeletons/PlaceSearchSkeleton';
import { PlaceResultRow } from '@/features/pin/components/PlaceResultRow';
import {
  useDeleteRecentSearchPlace,
  usePlaceSearch,
  useRecentSearchPlaces,
  useSelectSearchPlace,
} from '@/features/pin/queries/usePlaceSearch';
import type { PinSearchPlace } from '@/features/pin/types';
import type { MapCoordinate } from '@/features/map/types';
import { useCurrentPosition } from '@/hooks/useCurrentPosition';
import type { PlaceSearchHistoryRequest } from '@/types/place.type';

const PLACE_SEARCH_SKELETON_COUNT = 5;

export type PinPlaceSearchProps = {
  initialQuery?: string;
  showRecentPlaces?: boolean;
  isReturningToMap?: boolean;
  onCloseAnimationEnd?: () => void;
  onPlaceSelect: (place: PinSearchPlace) => void;
  validatePlace?: (place: PinSearchPlace) => string | null;
  onValidationError?: (message: string) => void;
  onCurrentLocationChanged?: (coordinate: MapCoordinate) => void;
  onBack?: () => void;
  currentLocationOverride?: PlaceSearchHistoryRequest;
  autoFocus?: boolean;
  placeholder?: string;
  headerContent?: ReactNode;
};

export function PinPlaceSearch({
  initialQuery = '',
  showRecentPlaces = true,
  isReturningToMap = false,
  onCloseAnimationEnd,
  onPlaceSelect,
  validatePlace,
  onValidationError,
  onCurrentLocationChanged,
  onBack,
  currentLocationOverride,
  autoFocus = true,
  placeholder = '장소를 검색하세요',
  headerContent,
}: PinPlaceSearchProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const selectionControllerRef = useRef<AbortController | null>(null);
  const [query, setQuery] = useState(initialQuery);
  const [selectionConstraintError, setSelectionConstraintError] = useState<string | null>(null);
  const currentPositionQuery = useCurrentPosition({
    enabled: !currentLocationOverride,
    options: {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 10_000,
    },
  });
  const currentLocation = currentLocationOverride ?? currentPositionQuery.data ?? null;
  const locationError =
    !currentLocationOverride && currentPositionQuery.isError && !currentPositionQuery.data
      ? '현재 위치를 확인할 수 없어요. 위치 권한을 확인해주세요.'
      : null;
  const normalizedQuery = query.trim();
  const recentSearchQuery = useRecentSearchPlaces(currentLocation, showRecentPlaces);
  const deleteRecentPlaceMutation = useDeleteRecentSearchPlace();
  const selectPlaceMutation = useSelectSearchPlace();
  const isSelectionLocked = isReturningToMap || selectPlaceMutation.isPending;
  const placeSearchQuery = usePlaceSearch({
    keyword: query,
    location: currentLocation,
    enabled: !isSelectionLocked,
  });
  const isSearchQueryCurrent =
    placeSearchQuery.isDebounced && placeSearchQuery.debouncedKeyword === normalizedQuery;
  const searchResults = isSearchQueryCurrent ? (placeSearchQuery.data ?? []) : [];
  const recentPlaces = recentSearchQuery.data ?? [];
  const isSearching =
    normalizedQuery.length > 0 &&
    Boolean(currentLocation) &&
    !isSelectionLocked &&
    (!placeSearchQuery.isDebounced || placeSearchQuery.isPending);
  const isSelectingPlace = selectPlaceMutation.isPending;
  const searchError =
    selectPlaceMutation.error instanceof Error && !isApiRequestCanceled(selectPlaceMutation.error)
      ? selectPlaceMutation.error.message
      : isSearchQueryCurrent && placeSearchQuery.error instanceof Error
        ? placeSearchQuery.error.message
        : selectionConstraintError;
  const recentPlacesError =
    deleteRecentPlaceMutation.error instanceof Error
      ? deleteRecentPlaceMutation.error.message
      : recentSearchQuery.error instanceof Error
        ? recentSearchQuery.error.message
        : null;

  useEffect(() => {
    if (!autoFocus) return;

    let isCancelled = false;
    const focusSearchInput = () => {
      if (!isCancelled) searchInputRef.current?.focus({ preventScroll: true });
    };
    const activeViewTransition = (
      document as Document & { activeViewTransition?: { finished: Promise<void> } | null }
    ).activeViewTransition;

    if (!activeViewTransition) {
      focusSearchInput();
      return;
    }

    void activeViewTransition.finished.then(focusSearchInput, focusSearchInput);

    return () => {
      isCancelled = true;
    };
  }, [autoFocus]);

  useEffect(() => {
    return () => selectionControllerRef.current?.abort();
  }, []);

  useEffect(() => {
    if (!currentLocation) return;

    onCurrentLocationChanged?.({
      lat: currentLocation.latitude,
      lng: currentLocation.longitude,
    });
  }, [currentLocation, onCurrentLocationChanged]);

  const visiblePlaces = isSelectionLocked ? [] : normalizedQuery ? searchResults : recentPlaces;
  const isShowingRecentPlaces = showRecentPlaces && !normalizedQuery && !isSelectionLocked;

  const resetSearch = () => {
    selectionControllerRef.current?.abort();
    selectionControllerRef.current = null;
    setQuery('');
    setSelectionConstraintError(null);
    selectPlaceMutation.reset();
  };

  const handleQueryChange = (event: ChangeEvent<HTMLInputElement>) => {
    selectionControllerRef.current?.abort();
    selectionControllerRef.current = null;
    setQuery(event.target.value);
    setSelectionConstraintError(null);
    selectPlaceMutation.reset();
  };

  const handlePlaceSelect = (place: PinSearchPlace) => {
    if (isSelectionLocked) return;

    const reportConstraintError = (message: string) => {
      if (onValidationError) {
        setSelectionConstraintError(null);
        onValidationError(message);
        return;
      }

      setSelectionConstraintError(message);
    };

    if (!place.searchSource || !currentLocation) {
      const selectedPlace = currentLocation
        ? { ...place, selectionLocation: currentLocation }
        : place;
      const constraintError = validatePlace?.(selectedPlace) ?? null;
      if (constraintError) {
        reportConstraintError(constraintError);
        return;
      }

      setQuery(place.placeName);
      onPlaceSelect(selectedPlace);
      return;
    }

    const controller = new AbortController();
    selectionControllerRef.current?.abort();
    selectionControllerRef.current = controller;
    selectPlaceMutation.mutate(
      {
        place,
        userLatitude: currentLocation.latitude,
        userLongitude: currentLocation.longitude,
        signal: controller.signal,
      },
      {
        onSuccess: (selectedPlaceResult) => {
          setQuery(selectedPlaceResult.placeName);
          const selectedPlace = {
            ...selectedPlaceResult,
            selectionLocation: currentLocation,
          };
          const constraintError = validatePlace?.(selectedPlace) ?? null;
          if (constraintError) {
            reportConstraintError(constraintError);
            return;
          }
          onPlaceSelect(selectedPlace);
        },
        onSettled: () => {
          if (selectionControllerRef.current === controller) {
            selectionControllerRef.current = null;
          }
        },
      },
    );
  };

  const handleRecentPlaceDelete = (place: PinSearchPlace) => {
    if (place.searchHistoryId === undefined || deleteRecentPlaceMutation.isPending) return;

    deleteRecentPlaceMutation.mutate(place.searchHistoryId);
  };

  const isWaitingForLocation = normalizedQuery.length > 0 && !currentLocation && !locationError;
  // 검색 결과와 최근 검색 목록이 같은 자리에 렌더링되므로 두 로딩 상태를 함께 본다.
  const isLoadingPlaceList =
    isSearching || (isShowingRecentPlaces && recentSearchQuery.isPending && !locationError);
  const hasNoResults =
    normalizedQuery.length > 0 &&
    !isSearching &&
    !searchError &&
    !locationError &&
    !isSelectionLocked &&
    isSearchQueryCurrent &&
    placeSearchQuery.isSuccess &&
    searchResults.length === 0;

  return (
    <main
      data-page="pin-place-search"
      className={`flex h-full flex-col bg-pli-black-85 ${
        isReturningToMap ? 'map-search-overlay-closing pointer-events-none' : ''
      }`}
      onAnimationEnd={(event) => {
        if (
          event.target === event.currentTarget &&
          event.animationName === 'map-search-circle-conceal'
        ) {
          onCloseAnimationEnd?.();
        }
      }}
    >
      <h1 className="sr-only">핀 조회 장소 검색</h1>

      <div className="shrink-0 px-[15px] pt-[calc(env(safe-area-inset-top)+16px)]">
        <SearchInput
          ref={searchInputRef}
          containerClassName="map-search-hero"
          value={query}
          onChange={handleQueryChange}
          onClear={resetSearch}
          onBack={onBack}
          placeholder={placeholder}
          aria-label="핀 조회 장소 검색"
          leadingIcon="back"
        />
      </div>

      {headerContent}

      {isShowingRecentPlaces ? (
        <h2 className="mt-3 shrink-0 px-[18px] body-15-m text-grayscale-600">최근 검색</h2>
      ) : null}

      <section
        aria-label={isShowingRecentPlaces ? '최근 검색' : '장소 검색 결과'}
        aria-live="polite"
        className="flex min-h-0 flex-1 flex-col overflow-y-auto scrollbar-hide"
      >
        {visiblePlaces.length > 0 ? (
          <ul>
            {visiblePlaces.map((place) => (
              <li key={place.id} className="mx-2">
                <PlaceResultRow
                  place={place}
                  variant={isShowingRecentPlaces ? 'recent-search' : 'search-result'}
                  onClick={() => handlePlaceSelect(place)}
                  onDelete={
                    isShowingRecentPlaces && place.searchHistoryId !== undefined
                      ? () => handleRecentPlaceDelete(place)
                      : undefined
                  }
                  isDeleteDisabled={deleteRecentPlaceMutation.isPending}
                  isDeletePending={
                    deleteRecentPlaceMutation.isPending &&
                    deleteRecentPlaceMutation.variables === place.searchHistoryId
                  }
                />
              </li>
            ))}
          </ul>
        ) : isLoadingPlaceList ? (
          <ul role="status" aria-label="장소 목록을 불러오는 중">
            {Array.from({ length: PLACE_SEARCH_SKELETON_COUNT }).map((_, index) => (
              <li key={index} className="mx-2">
                <PlaceSearchSkeleton
                  variant={isShowingRecentPlaces ? 'recent-search' : 'search-result'}
                />
              </li>
            ))}
          </ul>
        ) : null}

        {hasNoResults ? (
          <p className="m-auto whitespace-nowrap body-15-r text-grayscale-600">
            검색 결과가 없어요.
          </p>
        ) : null}

        {isWaitingForLocation ? (
          <p className="m-auto whitespace-nowrap body-15-r text-grayscale-600">
            현재 위치를 확인하고 있어요.
          </p>
        ) : null}

        {isSelectingPlace ? (
          <p className="m-auto whitespace-nowrap body-15-r text-grayscale-600">
            장소를 선택하고 있어요.
          </p>
        ) : null}

        {isShowingRecentPlaces && recentPlacesError ? (
          <p className="m-auto px-6 text-center body-15-r text-grayscale-600">
            {recentPlacesError}
          </p>
        ) : null}

        {locationError || searchError ? (
          <p className="m-auto px-6 text-center body-15-r text-grayscale-600">
            {locationError || searchError}
          </p>
        ) : null}
      </section>
    </main>
  );
}

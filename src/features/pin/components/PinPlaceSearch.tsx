import { useEffect, useRef, useState, type ChangeEvent } from 'react';

import { SearchInput } from '@/components/ui/SearchInput';
import { getRecentSearchPlaces, searchPlaces, selectSearchPlace } from '@/features/pin/api/place';
import { PlaceResultRow } from '@/features/pin/components/PlaceResultRow';
import type { PinSearchPlace } from '@/features/pin/types';

export type PinPlaceSearchProps = {
  isReturningToMap?: boolean;
  onCloseAnimationEnd?: () => void;
  onPlaceSelect?: (place: PinSearchPlace) => void;
  onBack?: () => void;
};

type CurrentLocation = {
  latitude: number;
  longitude: number;
};

export function PinPlaceSearch({
  isReturningToMap = false,
  onCloseAnimationEnd,
  onPlaceSelect,
  onBack,
}: PinPlaceSearchProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const selectionControllerRef = useRef<AbortController | null>(null);
  const [query, setQuery] = useState('');
  const [selectedPlace, setSelectedPlace] = useState<PinSearchPlace | null>(null);
  const [currentLocation, setCurrentLocation] = useState<CurrentLocation | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<PinSearchPlace[]>([]);
  const [recentPlaces, setRecentPlaces] = useState<PinSearchPlace[]>([]);
  const [isLoadingRecentPlaces, setIsLoadingRecentPlaces] = useState(true);
  const [recentPlacesError, setRecentPlacesError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [completedSearchQuery, setCompletedSearchQuery] = useState<string | null>(null);
  const [isSelectingPlace, setIsSelectingPlace] = useState(false);
  const normalizedQuery = query.trim();

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    return () => selectionControllerRef.current?.abort();
  }, []);

  useEffect(() => {
    if (!currentLocation) return;

    const controller = new AbortController();
    void getRecentSearchPlaces({
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      signal: controller.signal,
    })
      .then(setRecentPlaces)
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setRecentPlaces([]);
        setRecentPlacesError(
          error instanceof Error
            ? error.message
            : '최근 검색 장소를 불러오지 못했어요. 잠시 후 다시 시도해주세요.',
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoadingRecentPlaces(false);
      });

    return () => controller.abort();
  }, [currentLocation]);

  useEffect(() => {
    if (!navigator.geolocation) {
      const timeoutId = window.setTimeout(() => {
        setLocationError('현재 위치를 확인할 수 없어요. 위치 권한을 확인해주세요.');
      }, 0);

      return () => window.clearTimeout(timeoutId);
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setIsLoadingRecentPlaces(true);
        setRecentPlacesError(null);
        setCurrentLocation({ latitude: coords.latitude, longitude: coords.longitude });
        setLocationError(null);
      },
      () => {
        setLocationError('현재 위치를 확인할 수 없어요. 위치 권한을 확인해주세요.');
      },
      { enableHighAccuracy: true, maximumAge: 300_000, timeout: 10_000 },
    );
  }, []);

  useEffect(() => {
    if (!normalizedQuery || selectedPlace || !currentLocation) return;

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      setIsSearching(true);

      void searchPlaces({
        keyword: normalizedQuery,
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        signal: controller.signal,
      })
        .then((places) => {
          setSearchResults(places);
          setCompletedSearchQuery(normalizedQuery);
        })
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === 'AbortError') return;
          setSearchResults([]);
          setSearchError(
            error instanceof Error
              ? error.message
              : '장소를 검색하지 못했어요. 잠시 후 다시 시도해주세요.',
          );
        })
        .finally(() => {
          if (!controller.signal.aborted) setIsSearching(false);
        });
    }, 300);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [currentLocation, normalizedQuery, selectedPlace]);

  const visiblePlaces =
    selectedPlace || isSelectingPlace ? [] : normalizedQuery ? searchResults : recentPlaces;
  const isShowingRecentPlaces = !normalizedQuery && !selectedPlace;

  const resetSearch = () => {
    selectionControllerRef.current?.abort();
    selectionControllerRef.current = null;
    setQuery('');
    setSelectedPlace(null);
    setSearchResults([]);
    setSearchError(null);
    setIsSearching(false);
    setCompletedSearchQuery(null);
    setIsSelectingPlace(false);
  };

  const handleQueryChange = (event: ChangeEvent<HTMLInputElement>) => {
    selectionControllerRef.current?.abort();
    selectionControllerRef.current = null;
    setQuery(event.target.value);
    setSelectedPlace(null);
    setSearchResults([]);
    setSearchError(null);
    setIsSearching(false);
    setCompletedSearchQuery(null);
    setIsSelectingPlace(false);
  };

  const handlePlaceSelect = (place: PinSearchPlace) => {
    if (isSelectingPlace) return;

    if (!place.searchSource || !currentLocation) {
      setQuery(place.placeName);
      setSelectedPlace(place);
      onPlaceSelect?.(place);
      return;
    }

    const controller = new AbortController();
    selectionControllerRef.current?.abort();
    selectionControllerRef.current = controller;
    setIsSelectingPlace(true);
    setSearchError(null);

    void selectSearchPlace({
      place,
      userLatitude: currentLocation.latitude,
      userLongitude: currentLocation.longitude,
      signal: controller.signal,
    })
      .then((selectedPlaceResult) => {
        setQuery(selectedPlaceResult.placeName);
        setSelectedPlace(selectedPlaceResult);
        onPlaceSelect?.(selectedPlaceResult);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setSearchError(
          error instanceof Error
            ? error.message
            : '장소를 선택하지 못했어요. 잠시 후 다시 시도해주세요.',
        );
      })
      .finally(() => {
        if (selectionControllerRef.current !== controller) return;
        selectionControllerRef.current = null;
        setIsSelectingPlace(false);
      });
  };

  const isWaitingForLocation = normalizedQuery.length > 0 && !currentLocation && !locationError;
  const hasNoResults =
    normalizedQuery.length > 0 &&
    !isSearching &&
    !searchError &&
    !locationError &&
    !isSelectingPlace &&
    completedSearchQuery === normalizedQuery &&
    searchResults.length === 0 &&
    !selectedPlace;

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
          placeholder="장소를 검색하세요"
          aria-label="핀 조회 장소 검색"
          leadingIcon="back"
        />
      </div>

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
                <PlaceResultRow place={place} onClick={() => handlePlaceSelect(place)} />
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

        {isSearching ? (
          <p className="m-auto whitespace-nowrap body-15-r text-grayscale-600">
            장소를 검색하고 있어요.
          </p>
        ) : null}

        {isSelectingPlace ? (
          <p className="m-auto whitespace-nowrap body-15-r text-grayscale-600">
            장소를 선택하고 있어요.
          </p>
        ) : null}

        {isShowingRecentPlaces && isLoadingRecentPlaces && !locationError ? (
          <p className="m-auto px-6 text-center body-15-r text-grayscale-600">
            최근 검색 장소를 불러오고 있어요.
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

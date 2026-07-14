import { useMemo, useState, type ChangeEvent } from 'react';

import { SearchInput } from '@/components/ui/SearchInput';
import { PlaceResultRow } from '@/features/pin/components/PlaceResultRow';
import {
  MOCK_PIN_SEARCH_PLACES,
  MOCK_RECENT_PIN_SEARCH_PLACES,
} from '@/features/pin/data/mockPinSearchPlaces';
import type { PinSearchPlace } from '@/features/pin/types';

export type PinPlaceSearchProps = {
  onPlaceSelect?: (place: PinSearchPlace) => void;
};

const normalizeSearchText = (value: string) => value.trim().toLowerCase();

const matchesQuery = (place: PinSearchPlace, query: string) => {
  const normalizedQuery = normalizeSearchText(query);
  const searchableText = normalizeSearchText(
    `${place.placeName} ${place.category} ${place.creatorName ?? ''}`,
  );

  return searchableText.includes(normalizedQuery);
};

export function PinPlaceSearch({ onPlaceSelect }: PinPlaceSearchProps) {
  const [query, setQuery] = useState('');
  const [selectedPlace, setSelectedPlace] = useState<PinSearchPlace | null>(null);
  const normalizedQuery = normalizeSearchText(query);

  const filteredPlaces = useMemo(() => {
    if (!normalizedQuery || selectedPlace) return [];

    return MOCK_PIN_SEARCH_PLACES.filter((place) => matchesQuery(place, normalizedQuery));
  }, [normalizedQuery, selectedPlace]);

  const visiblePlaces = selectedPlace
    ? []
    : normalizedQuery
      ? filteredPlaces
      : MOCK_RECENT_PIN_SEARCH_PLACES;
  const isShowingRecentPlaces = !normalizedQuery && !selectedPlace;

  const resetSearch = () => {
    setQuery('');
    setSelectedPlace(null);
  };

  const handleQueryChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
    setSelectedPlace(null);
  };

  const handlePlaceSelect = (place: PinSearchPlace) => {
    setQuery(place.placeName);
    setSelectedPlace(place);
    onPlaceSelect?.(place);
  };

  const hasNoResults = normalizedQuery.length > 0 && filteredPlaces.length === 0 && !selectedPlace;

  return (
    <main className="flex h-full min-h-0 w-full flex-col bg-pli-black-85">
      <h1 className="sr-only">핀 조회 장소 검색</h1>

      <div className="shrink-0 px-[15px] pt-[calc(env(safe-area-inset-top)+16px)]">
        <SearchInput
          autoFocus
          value={query}
          onChange={handleQueryChange}
          onClear={resetSearch}
          onBack={resetSearch}
          placeholder="장소를 검색하세요"
          aria-label="핀 조회 장소 검색"
          leadingIcon="back"
          containerClassName="mx-auto"
        />
      </div>

      {isShowingRecentPlaces ? (
        <h2 className="mt-5 shrink-0 px-[18px] body-15-m text-grayscale-600">최근 검색</h2>
      ) : null}

      <section
        aria-label={isShowingRecentPlaces ? '최근 검색' : '장소 검색 결과'}
        aria-live="polite"
        className="min-h-0 flex-1 overflow-y-auto scrollbar-hide"
      >
        {visiblePlaces.length > 0 ? (
          <ul>
            {visiblePlaces.map((place) => (
              <li key={place.id}>
                <PlaceResultRow place={place} onClick={() => handlePlaceSelect(place)} />
              </li>
            ))}
          </ul>
        ) : null}

        {hasNoResults ? (
          <p className="mx-auto mt-[300px] h-[21px] w-[116px] whitespace-nowrap text-center body-15-r text-grayscale-600">
            검색 결과가 없어요.
          </p>
        ) : null}
      </section>
    </main>
  );
}

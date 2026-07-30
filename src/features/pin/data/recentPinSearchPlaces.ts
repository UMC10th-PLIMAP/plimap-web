import type { PinSearchPlace } from '@/features/pin/types';

const RECENT_SEARCH_STORAGE_KEY = 'plimap.recent-pin-search-places';
const MAX_RECENT_SEARCHES = 10;

const isPinSearchPlace = (value: unknown): value is PinSearchPlace => {
  if (!value || typeof value !== 'object') return false;

  const place = value as Partial<PinSearchPlace>;
  return (
    typeof place.id === 'string' &&
    typeof place.category === 'string' &&
    typeof place.placeName === 'string' &&
    typeof place.address === 'string' &&
    typeof place.distance === 'number' &&
    typeof place.coordinates?.lat === 'number' &&
    typeof place.coordinates.lng === 'number'
  );
};

export const getRecentPinSearchPlaces = (): PinSearchPlace[] => {
  try {
    const storedValue = window.localStorage.getItem(RECENT_SEARCH_STORAGE_KEY);
    if (!storedValue) return [];

    const places: unknown = JSON.parse(storedValue);
    return Array.isArray(places)
      ? places.filter(isPinSearchPlace).slice(0, MAX_RECENT_SEARCHES)
      : [];
  } catch {
    return [];
  }
};

export const saveRecentPinSearchPlace = (place: PinSearchPlace): PinSearchPlace[] => {
  const recentPlaces = [
    place,
    ...getRecentPinSearchPlaces().filter((recentPlace) => recentPlace.id !== place.id),
  ].slice(0, MAX_RECENT_SEARCHES);

  try {
    window.localStorage.setItem(RECENT_SEARCH_STORAGE_KEY, JSON.stringify(recentPlaces));
  } catch {
    // Recent searches are a convenience feature; search and selection still work if storage is unavailable.
  }

  return recentPlaces;
};

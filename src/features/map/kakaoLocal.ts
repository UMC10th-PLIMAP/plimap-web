import type { MapPlace } from './types';

const KAKAO_LOCAL_BASE_URL = 'https://dapi.kakao.com/v2/local';
const KAKAO_LOCAL_REQUEST_TIMEOUT_MS = 8000;

type KakaoKeywordDocument = {
  id: string;
  place_name: string;
  category_name: string;
  category_group_name: string;
  phone: string;
  address_name: string;
  road_address_name: string;
  x: string;
  y: string;
  place_url: string;
  distance?: string;
};

type KakaoAddressDocument = {
  address_name: string;
  address_type: string;
  x: string;
  y: string;
  address?: {
    address_name: string;
  } | null;
  road_address?: {
    address_name: string;
  } | null;
};

type KakaoLocalResponse<TDocument> = {
  documents: TDocument[];
};

type KakaoLocalPlace = {
  id: string;
  placeName: string;
  categoryName: string;
  categoryGroupName: string;
  phone: string;
  addressName: string;
  roadAddressName: string;
  placeUrl: string;
  x: number;
  y: number;
  distance?: number;
};

type SearchKakaoLocalParams = {
  query: string;
  x?: number;
  y?: number;
};

const CIVIC_OFFICE_KEYWORDS = ['시청', '구청', '군청', '도청'];

const toFiniteNumber = (value: string) => {
  const trimmedValue = value.trim();
  if (!trimmedValue) return null;

  const parsed = Number(trimmedValue);
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeSearchText = (value: string) => value.replace(/\s/g, '').toLowerCase();

const isCivicOfficeQuery = (query: string) => {
  const normalizedQuery = normalizeSearchText(query);
  return CIVIC_OFFICE_KEYWORDS.some((keyword) => normalizedQuery === keyword);
};

const isPublicOffice = (place: KakaoLocalPlace) => {
  const category = `${place.categoryGroupName} ${place.categoryName}`;
  return category.includes('공공기관') || category.includes('행정기관');
};

const getPlaceRankingScore = (place: KakaoLocalPlace, query: string) => {
  const normalizedQuery = normalizeSearchText(query);
  const normalizedName = normalizeSearchText(place.placeName);
  let score = 0;

  if (normalizedName === normalizedQuery) score += 1000;
  if (normalizedName.includes(normalizedQuery)) score += 100;

  if (isCivicOfficeQuery(query)) {
    if (isPublicOffice(place)) score += 600;
    if (normalizedName.endsWith(normalizedQuery)) score += 250;
    if (normalizedName.includes(`${normalizedQuery}역`)) score -= 300;
  }

  if (place.distance !== undefined) {
    score -= Math.min(place.distance / 1000, 50);
  }

  return score;
};

const rankPlaces = (places: KakaoLocalPlace[], query: string) => {
  return [...places].sort((placeA, placeB) => {
    const scoreDiff = getPlaceRankingScore(placeB, query) - getPlaceRankingScore(placeA, query);
    if (scoreDiff !== 0) return scoreDiff;
    return (
      (placeA.distance ?? Number.MAX_SAFE_INTEGER) - (placeB.distance ?? Number.MAX_SAFE_INTEGER)
    );
  });
};

const toMapPlace = (place: KakaoLocalPlace): MapPlace => ({
  id: place.id,
  placeName: place.placeName,
  category: place.categoryGroupName || place.categoryName || '장소',
  address: place.roadAddressName || place.addressName,
  coordinates: {
    lat: place.y,
    lng: place.x,
  },
  distance: place.distance,
});

// TODO: 운영 환경에서는 REST API 키가 클라이언트 번들에 노출되지 않도록 Kakao Local 요청을 백엔드에서 프록시한다.
const getKakaoRestApiKey = () => import.meta.env.VITE_KAKAO_REST_API_KEY?.trim() ?? '';

const requestKakaoLocal = async <TDocument>(
  path: string,
  params: Record<string, string>,
): Promise<KakaoLocalResponse<TDocument>> => {
  const apiKey = getKakaoRestApiKey();

  if (!apiKey) {
    throw new Error('VITE_KAKAO_REST_API_KEY is missing in environment variables');
  }

  const url = new URL(`${KAKAO_LOCAL_BASE_URL}${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), KAKAO_LOCAL_REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `KakaoAK ${apiKey}`,
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Kakao Local API request failed (${response.status})`);
    }

    return (await response.json()) as KakaoLocalResponse<TDocument>;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('Kakao Local API request timed out', { cause: error });
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

const isKakaoLocalPlace = (place: KakaoLocalPlace | null): place is KakaoLocalPlace => {
  return place !== null;
};

const mapKeywordDocument = (document: KakaoKeywordDocument): KakaoLocalPlace | null => {
  const x = toFiniteNumber(document.x);
  const y = toFiniteNumber(document.y);

  if (x === null || y === null) return null;

  return {
    id: document.id,
    placeName: document.place_name,
    categoryName: document.category_name,
    categoryGroupName: document.category_group_name,
    phone: document.phone,
    addressName: document.address_name,
    roadAddressName: document.road_address_name,
    placeUrl: document.place_url,
    x,
    y,
    distance: document.distance ? (toFiniteNumber(document.distance) ?? undefined) : undefined,
  };
};

const mapAddressDocument = (
  document: KakaoAddressDocument,
  index: number,
): KakaoLocalPlace | null => {
  const x = toFiniteNumber(document.x);
  const y = toFiniteNumber(document.y);

  if (x === null || y === null) return null;

  return {
    id: `address-${document.x}-${document.y}-${index}`,
    placeName:
      document.road_address?.address_name ??
      document.address?.address_name ??
      document.address_name,
    categoryName: document.address_type || '주소',
    categoryGroupName: '주소',
    phone: '',
    addressName: document.address?.address_name ?? document.address_name,
    roadAddressName: document.road_address?.address_name ?? '',
    placeUrl: '',
    x,
    y,
  };
};

export const searchKakaoLocal = async ({
  query,
  x,
  y,
}: SearchKakaoLocalParams): Promise<MapPlace[]> => {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) return [];

  const keywordParams: Record<string, string> = {
    query: trimmedQuery,
    size: '15',
    sort: x !== undefined && y !== undefined ? 'distance' : 'accuracy',
  };

  if (x !== undefined && y !== undefined) {
    keywordParams.x = String(x);
    keywordParams.y = String(y);
    keywordParams.radius = '20000';
  }

  const keywordResponse = await requestKakaoLocal<KakaoKeywordDocument>(
    '/search/keyword.json',
    keywordParams,
  );
  const keywordPlaces = rankPlaces(
    keywordResponse.documents.map(mapKeywordDocument).filter(isKakaoLocalPlace),
    trimmedQuery,
  );

  if (keywordPlaces.length > 0) {
    return keywordPlaces.map(toMapPlace);
  }

  const addressResponse = await requestKakaoLocal<KakaoAddressDocument>('/search/address.json', {
    query: trimmedQuery,
    size: '15',
  });

  return rankPlaces(
    addressResponse.documents.map(mapAddressDocument).filter(isKakaoLocalPlace),
    trimmedQuery,
  ).map(toMapPlace);
};

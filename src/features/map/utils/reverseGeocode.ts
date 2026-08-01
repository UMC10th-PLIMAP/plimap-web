import type { MapCoordinate } from '@/features/map/types';

export async function reverseGeocode(coordinate: MapCoordinate): Promise<string> {
  const mapsApi = window.google?.maps;
  if (!mapsApi) throw new Error('지도를 아직 불러오지 못했어요.');

  const geocoder = new mapsApi.Geocoder();
  try {
    const response = await geocoder.geocode({ location: coordinate });
    const address = response.results[0]?.formatted_address.trim();

    if (!address) throw new Error();
    return address;
  } catch {
    throw new Error('선택한 위치의 주소를 확인하지 못했어요. 잠시 후 다시 시도해 주세요');
  }
}

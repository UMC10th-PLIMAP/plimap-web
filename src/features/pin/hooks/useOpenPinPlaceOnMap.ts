import { useCallback, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';

import { getPlaceDetail } from '@/api/place';
import { getPinDetail, getPlaceTrackPins } from '@/api/pin';
import { getPlaceTracks } from '@/api/track';
import type { FocusedFeedPin, PinDetailResponse, PinSearchPlace } from '@/features/pin/types';
import type { AppOutletContext } from '@/layouts/RootLayout';
import { getCurrentPosition } from '@/utils/geolocation';

type OpenPinPlaceOptions = {
  pinId: number | string;
  fallbackPlaceName?: string;
  isMine?: boolean;
  /** 프로필 피드 등에서 진입 시 ‘등록한 곡 상세 보기’ CTA 표시 */
  showMyRegisteredTrackCta?: boolean;
};

type OpenPlaceTrackOptions = {
  placeTrackId: number | string;
  fallbackPlaceName?: string;
};

async function resolvePlace(params: {
  pinDetail: PinDetailResponse;
  fallbackPlaceName: string;
  isMine: boolean;
  focusedFeedPin?: FocusedFeedPin;
  mapFocusPin?: FocusedFeedPin;
}) {
  const { pinDetail } = params;
  const positionResult = await getCurrentPosition();
  const userCoordinate = positionResult.ok
    ? positionResult.coordinate
    : { lat: pinDetail.latitude, lng: pinDetail.longitude };

  const placeDetail = await getPlaceDetail({
    placeId: pinDetail.placeId,
    latitude: userCoordinate.lat,
    longitude: userCoordinate.lng,
  });

  const place: PinSearchPlace = {
    id: `place:${placeDetail.placeId}`,
    placeId: placeDetail.placeId,
    placeName: placeDetail.placeName || params.fallbackPlaceName,
    category: placeDetail.category ?? '',
    address: placeDetail.address,
    distance: placeDetail.distanceMeters,
    creatorName: pinDetail.writerNickname,
    bookmarkedByMe: placeDetail.bookmarkedByMe,
    isMine: params.isMine || placeDetail.pinnedByMe,
    selectionLocation: {
      latitude: userCoordinate.lat,
      longitude: userCoordinate.lng,
    },
    coordinates: {
      lat: pinDetail.latitude,
      lng: pinDetail.longitude,
    },
    focusedFeedPin: params.focusedFeedPin,
    mapFocusPin: params.mapFocusPin,
  };

  return { place, userCoordinate };
}

async function resolvePlaceTrackId(params: {
  placeId: number;
  pinId: number;
  latitude: number;
  longitude: number;
}) {
  const pageSize = 50;
  let page = 0;

  while (true) {
    const tracks = await getPlaceTracks(
      String(params.placeId),
      String(page),
      pageSize,
      params.latitude,
      params.longitude,
      'POPULAR',
    );

    for (const track of tracks.tracks) {
      let cursor: string | undefined;

      while (true) {
        const pins = await getPlaceTrackPins(String(track.placeTrackId), pageSize, cursor);
        if (pins.data.some((pin) => pin.pinId === params.pinId)) {
          return track.placeTrackId;
        }
        if (!pins.hasNext) break;
        cursor = pins.nextCursor;
      }
    }

    if (!tracks.hasNext) break;
    page += 1;
  }

  return null;
}

type PlaceTrackPinItem = Awaited<ReturnType<typeof getPlaceTrackPins>>['data'][number];

/** 해당 장소 곡에서 내가 등록한 PIN을 찾는다. */
async function findMyPlaceTrackPin(placeTrackId: string | number) {
  const pageSize = 50;
  let cursor: string | undefined;

  while (true) {
    const pins = await getPlaceTrackPins(String(placeTrackId), pageSize, cursor, 'POPULAR');
    const myPin = pins.data.find((pin) => pin.pinByMe);
    if (myPin) return myPin;
    if (!pins.hasNext) break;
    cursor = pins.nextCursor;
  }

  return null;
}

function toFocusedFeedPin(
  pin: PlaceTrackPinItem,
  placeTrackId: number,
  albumImageUrl: string,
): FocusedFeedPin {
  return {
    pinId: pin.pinId,
    placeTrackId,
    nickname: pin.writerNickname,
    avatarUrl: pin.writerProfileImage || undefined,
    albumImageUrl,
    introduction: pin.introduction,
  };
}

/** pinId로 상세/장소 조회 후 지도 PinListSheet를 연다. */
export function useOpenPinPlaceOnMap() {
  const navigate = useNavigate();
  const { selectMapPlace } = useOutletContext<AppOutletContext>();
  const [isNavigating, setIsNavigating] = useState(false);

  const openPinPlaceOnMap = useCallback(
    async ({
      pinId,
      fallbackPlaceName = '',
      isMine = false,
      showMyRegisteredTrackCta = false,
    }: OpenPinPlaceOptions) => {
      if (isNavigating) return;

      setIsNavigating(true);
      try {
        const resolvedPinId = Number(pinId);
        const pinDetail = await getPinDetail(String(pinId));
        const { place, userCoordinate } = await resolvePlace({
          pinDetail,
          fallbackPlaceName,
          isMine,
        });

        const placeTrackId = showMyRegisteredTrackCta
          ? await resolvePlaceTrackId({
              placeId: pinDetail.placeId,
              pinId: resolvedPinId,
              latitude: userCoordinate.lat,
              longitude: userCoordinate.lng,
            })
          : null;

        if (placeTrackId != null) {
          place.focusedFeedPin = {
            pinId: resolvedPinId,
            placeTrackId,
            nickname: pinDetail.writerNickname,
            avatarUrl: pinDetail.writerProfileImage || undefined,
            albumImageUrl: pinDetail.albumImageUrl,
            introduction: pinDetail.introduction,
          };
        }

        selectMapPlace(place);
        navigate('/app');
      } catch (error) {
        console.error(error);
        setIsNavigating(false);
      }
    },
    [isNavigating, navigate, selectMapPlace],
  );

  /** 찜한 노래(placeTrackId)로 대표 PIN을 찾아 지도 PinListSheet를 연다. */
  const openPlaceTrackOnMap = useCallback(
    async ({ placeTrackId, fallbackPlaceName = '' }: OpenPlaceTrackOptions) => {
      if (isNavigating) return;

      setIsNavigating(true);
      try {
        const resolvedPlaceTrackId = Number(placeTrackId);
        const trackPins = await getPlaceTrackPins(String(placeTrackId), 1, undefined, 'POPULAR');
        const popularPin = trackPins.data[0];
        if (!popularPin) {
          setIsNavigating(false);
          return;
        }

        const pinDetail = await getPinDetail(String(popularPin.pinId));
        const myPin = popularPin.pinByMe ? popularPin : await findMyPlaceTrackPin(placeTrackId);
        const mapFocusPin = toFocusedFeedPin(
          popularPin,
          resolvedPlaceTrackId,
          pinDetail.albumImageUrl,
        );

        const { place } = await resolvePlace({
          pinDetail,
          fallbackPlaceName,
          isMine: Boolean(myPin),
          mapFocusPin,
          // 내가 등록한 곡이 있을 때만 바텀시트 CTA 표시
          focusedFeedPin: myPin
            ? toFocusedFeedPin(myPin, resolvedPlaceTrackId, pinDetail.albumImageUrl)
            : undefined,
        });

        selectMapPlace(place);
        navigate('/app');
      } catch (error) {
        console.error(error);
        setIsNavigating(false);
      }
    },
    [isNavigating, navigate, selectMapPlace],
  );

  return { openPinPlaceOnMap, openPlaceTrackOnMap, isNavigating };
}

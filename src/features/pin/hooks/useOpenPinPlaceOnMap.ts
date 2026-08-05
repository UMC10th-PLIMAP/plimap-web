import { useCallback, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';

import { getPlaceDetail } from '@/api/place';
import { getPinDetail, getPlaceTrackPins } from '@/api/pin';
import type { FocusedFeedPin, PinDetailResponse, PinSearchPlace } from '@/features/pin/types';
import type { AppOutletContext } from '@/layouts/RootLayout';
import { getCurrentPosition } from '@/utils/geolocation';

type OpenPinPlaceOptions = {
  pinId: number | string;
  placeTrackId?: number | string;
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

type PlaceTrackPinItem = Awaited<ReturnType<typeof getPlaceTrackPins>>['data'][number];

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
      placeTrackId,
      fallbackPlaceName = '',
      isMine = false,
      showMyRegisteredTrackCta = false,
    }: OpenPinPlaceOptions) => {
      if (isNavigating) return;

      setIsNavigating(true);
      try {
        const resolvedPinId = Number(pinId);
        const pinDetail = await getPinDetail(String(pinId));
        const { place } = await resolvePlace({
          pinDetail,
          fallbackPlaceName,
          isMine,
        });

        const resolvedPlaceTrackId =
          showMyRegisteredTrackCta && placeTrackId != null ? Number(placeTrackId) : null;

        if (resolvedPlaceTrackId != null) {
          place.focusedFeedPin = {
            pinId: resolvedPinId,
            placeTrackId: resolvedPlaceTrackId,
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
        const trackPins = await getPlaceTrackPins(String(placeTrackId), 50, undefined, 'POPULAR');
        const popularPin = trackPins.data[0];
        if (!popularPin) {
          setIsNavigating(false);
          return;
        }

        const pinDetail = await getPinDetail(String(popularPin.pinId));
        const myPin = trackPins.data.find((pin) => pin.pinByMe) ?? null;
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

import { useCallback, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';

import { getPlaceDetail } from '@/api/place';
import { getPinDetail, getPlaceTrackPins, postFeedPlaceAccessRequest } from '@/api/pin';
import type { FocusedFeedPin, PinDetailResponse, PinSearchPlace } from '@/features/pin/types';
import type { AppOutletContext } from '@/layouts/RootLayout';
import { useFeedPlaceAccessStore } from '@/store/feedPlaceAccessStore';
import { getCurrentPosition, getGeolocationErrorMessage } from '@/utils/geolocation';

type OpenPinPlaceOptions = {
  pinId: number | string;
  placeTrackId?: number | string;
  fallbackPlaceName?: string;
  isMine?: boolean;
  /** 프로필 피드 등에서 진입 시 ‘등록한 곡 상세 보기’ CTA 표시 */
  showMyRegisteredTrackCta?: boolean;
  /** 친구 피드 장소 접근 토큰 발급 (팔로잉한 친구 핀 진입 시) */
  requestFeedPlaceAccess?: boolean;
};

type OpenPlaceTrackOptions = {
  placeTrackId: number | string;
  fallbackPlaceName?: string;
};

export type OpenPlaceTrackResult = { ok: true } | { ok: false; message: string };

async function resolvePlace(params: {
  pinDetail: PinDetailResponse;
  fallbackPlaceName: string;
  isMine: boolean;
  focusedFeedPin?: FocusedFeedPin;
  mapFocusPin?: FocusedFeedPin;
  allowTrackDetailAccess?: boolean;
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
    allowTrackDetailAccess: params.allowTrackDetailAccess,
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
  pinDetail: PinDetailResponse,
): FocusedFeedPin {
  return {
    pinId: pin.pinId,
    placeTrackId,
    nickname: pin.writerNickname,
    avatarUrl: pin.writerProfileImage || undefined,
    albumImageUrl: pinDetail.albumImageUrl,
    introduction: pin.introduction,
    youtubeVideoId: pinDetail.youtubeVideoId,
    clipStartMs: pin.clipStartMs,
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
      requestFeedPlaceAccess = false,
    }: OpenPinPlaceOptions) => {
      if (isNavigating) return;

      setIsNavigating(true);
      try {
        const resolvedPinId = Number(pinId);
        const pinDetail = await getPinDetail(String(pinId));

        let placeAccessToken: string | undefined;
        if (requestFeedPlaceAccess && !isMine) {
          const access = await postFeedPlaceAccessRequest(String(pinDetail.placeId));
          useFeedPlaceAccessStore.getState().setToken(pinDetail.placeId, access.placeAccessToken);
          if (access.placeId !== pinDetail.placeId) {
            useFeedPlaceAccessStore.getState().setToken(access.placeId, access.placeAccessToken);
          }
          placeAccessToken = access.placeAccessToken;
        }

        const { place } = await resolvePlace({
          pinDetail,
          fallbackPlaceName,
          isMine,
          // 내/친구 피드 → 지도 진입이므로 곡 상세 열람 허용
          allowTrackDetailAccess: true,
        });
        place.placeAccessToken = placeAccessToken;

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
            youtubeVideoId: pinDetail.youtubeVideoId,
            clipStartMs: pinDetail.clipStartMs,
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
    async ({
      placeTrackId,
      fallbackPlaceName = '',
    }: OpenPlaceTrackOptions): Promise<OpenPlaceTrackResult> => {
      if (isNavigating) {
        return { ok: false, message: '이미 지도를 여는 중이에요. 잠시만 기다려 주세요.' };
      }

      setIsNavigating(true);
      try {
        const resolvedPlaceTrackId = Number(placeTrackId);
        const positionResult = await getCurrentPosition();
        if (!positionResult.ok) {
          setIsNavigating(false);
          return {
            ok: false,
            message: getGeolocationErrorMessage(positionResult.reason),
          };
        }
        const trackPins = await getPlaceTrackPins({
          placeTrackId: String(placeTrackId),
          pageSize: 50,
          pinSortType: 'POPULAR',
          userLatitude: positionResult.coordinate.lat,
          userLongitude: positionResult.coordinate.lng,
        });
        const popularPin = trackPins.data[0];
        if (!popularPin) {
          setIsNavigating(false);
          return { ok: false, message: '이 곡에 등록된 핀을 찾지 못했어요.' };
        }

        const pinDetail = await getPinDetail(String(popularPin.pinId));
        const myPin = trackPins.data.find((pin) => pin.pinByMe) ?? null;

        const { place } = await resolvePlace({
          pinDetail,
          fallbackPlaceName,
          isMine: Boolean(myPin),
          mapFocusPin: toFocusedFeedPin(popularPin, resolvedPlaceTrackId, pinDetail),
          // 내가 등록한 곡이 있을 때만 바텀시트 CTA 표시
          focusedFeedPin: myPin
            ? toFocusedFeedPin(myPin, resolvedPlaceTrackId, pinDetail)
            : undefined,
          // 찜한 곡(내 PLIMAP) → 지도 진입이므로 곡 상세 열람 허용
          allowTrackDetailAccess: true,
        });

        selectMapPlace(place);
        navigate('/app');
        return { ok: true };
      } catch (error) {
        console.error(error);
        setIsNavigating(false);
        return {
          ok: false,
          message:
            error instanceof Error
              ? error.message
              : '지도를 열지 못했어요. 잠시 후 다시 시도해 주세요.',
        };
      }
    },
    [isNavigating, navigate, selectMapPlace],
  );

  return { openPinPlaceOnMap, openPlaceTrackOnMap, isNavigating };
}

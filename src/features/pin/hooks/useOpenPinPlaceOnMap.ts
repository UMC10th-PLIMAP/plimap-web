import { useCallback, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';

import { getPlaceDetail } from '@/api/place';
import { getPinDetail, getPlaceTrackPins, postFeedPlaceAccessRequest } from '@/api/pin';
import { getPlaceTracks } from '@/api/track';
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
  /** 지도 상단을 검색창 대신 뒤로가기로 표시 (내 PLIMAP 등) */
  showMapBackButton?: boolean;
};

type OpenPlaceTrackOptions = {
  placeTrackId: number | string;
  fallbackPlaceName?: string;
  /** 지도 상단을 검색창 대신 뒤로가기로 표시 (내 PLIMAP 등) */
  showMapBackButton?: boolean;
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
  const queryCoordinate = positionResult.ok
    ? positionResult.coordinate
    : { lat: pinDetail.latitude, lng: pinDetail.longitude };

  const placeDetail = await getPlaceDetail({
    placeId: pinDetail.placeId,
    latitude: queryCoordinate.lat,
    longitude: queryCoordinate.lng,
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
    selectionLocation: positionResult.ok
      ? {
          latitude: positionResult.coordinate.lat,
          longitude: positionResult.coordinate.lng,
        }
      : undefined,
    coordinates: {
      lat: pinDetail.latitude,
      lng: pinDetail.longitude,
    },
    focusedFeedPin: params.focusedFeedPin,
    mapFocusPin: params.mapFocusPin,
  };

  return {
    place,
    userCoordinate: positionResult.ok ? positionResult.coordinate : null,
  };
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
      showMapBackButton = false,
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
          // 내/친구 피드 → 지도 진입이므로 곡 상세 열람 허용
          allowTrackDetailAccess: true,
        });
        place.showMapBackButton = showMapBackButton;

        // resolvePlace 최종 isMine( pinnedByMe 반영 ) 기준으로 토큰 발급
        if (requestFeedPlaceAccess && !place.isMine && place.placeId != null) {
          const access = await postFeedPlaceAccessRequest(String(place.placeId));
          useFeedPlaceAccessStore.getState().setToken(place.placeId, access.placeAccessToken);
          if (access.placeId !== place.placeId) {
            useFeedPlaceAccessStore.getState().setToken(access.placeId, access.placeAccessToken);
          }
          place.placeAccessToken = access.placeAccessToken;
        }

        let resolvedPlaceTrackId = (() => {
          if (placeTrackId == null) return undefined;
          const parsed = Number(placeTrackId);
          return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
        })();

        // 내 모든 핀 등에서 placeTrackId가 목록에 없으면, 해당 장소의 내 등록 곡으로 보완한다.
        if (showMyRegisteredTrackCta && resolvedPlaceTrackId == null && place.placeId != null) {
          const lookupCoordinate = userCoordinate ?? place.coordinates;
          try {
            const placeTracks = await getPlaceTracks(
              String(place.placeId),
              '0',
              50,
              lookupCoordinate.lat,
              lookupCoordinate.lng,
              'LATEST',
            );
            const myTrack = placeTracks.tracks.find((track) => track.pinByMe);
            if (myTrack?.placeTrackId != null) {
              resolvedPlaceTrackId = myTrack.placeTrackId;
            }
          } catch (error) {
            console.error(error);
          }
        }

        // 피드 진입 시 지도 핀 말풍선(MapPinMessageBox)용 데이터
        place.mapFocusPin = {
          pinId: resolvedPinId,
          placeTrackId: resolvedPlaceTrackId,
          nickname: pinDetail.writerNickname,
          avatarUrl: pinDetail.writerProfileImage || undefined,
          albumImageUrl: pinDetail.albumImageUrl,
          introduction: pinDetail.introduction,
          youtubeVideoId: pinDetail.youtubeVideoId,
          clipStartMs: pinDetail.clipStartMs,
        };

        // 내 등록 곡 상세 CTA (내 모든 핀·내 프로필 피드 진입)
        if (showMyRegisteredTrackCta) {
          place.focusedFeedPin = place.mapFocusPin;
        }

        selectMapPlace(place);
        navigate('/app');
        setIsNavigating(false);
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
      showMapBackButton = false,
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
        place.showMapBackButton = showMapBackButton;

        selectMapPlace(place);
        navigate('/app');
        setIsNavigating(false);
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

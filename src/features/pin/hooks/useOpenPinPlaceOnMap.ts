import { useCallback, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';

import { getPlaceDetail } from '@/api/place';
import { getPinDetail } from '@/api/pin';
import type { PinSearchPlace } from '@/features/pin/types';
import type { AppOutletContext } from '@/layouts/RootLayout';
import { getCurrentPosition } from '@/utils/geolocation';

type OpenPinPlaceOptions = {
  pinId: number | string;
  fallbackPlaceName?: string;
  isMine?: boolean;
  /** 프로필 피드 등에서 진입 시 ‘등록한 곡 상세 보기’ CTA 표시 */
  showMyRegisteredTrackCta?: boolean;
};

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
        const pinDetail = await getPinDetail(String(pinId));
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
          placeName: placeDetail.placeName || fallbackPlaceName,
          category: placeDetail.category ?? '',
          address: placeDetail.address,
          distance: placeDetail.distanceMeters,
          creatorName: pinDetail.writerNickname,
          bookmarkedByMe: placeDetail.bookmarkedByMe,
          isMine: isMine || placeDetail.pinnedByMe,
          coordinates: {
            lat: pinDetail.latitude,
            lng: pinDetail.longitude,
          },
          focusedFeedPin: showMyRegisteredTrackCta
            ? {
                pinId: Number(pinId),
                nickname: pinDetail.writerNickname,
                avatarUrl: pinDetail.writerProfileImage || undefined,
                albumImageUrl: pinDetail.albumImageUrl,
              }
            : undefined,
        };

        selectMapPlace(place);
        navigate('/app');
      } catch (error) {
        console.error(error);
        setIsNavigating(false);
      }
    },
    [isNavigating, navigate, selectMapPlace],
  );

  return { openPinPlaceOnMap, isNavigating };
}

import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';

import { getPlaceDetail } from '@/api/place';
import { getPinDetail } from '@/api/pin';
import { TopBar } from '@/components/ui/TopBar';
import { MyAllPinsCard } from '@/features/profile/components/MyAllPinsCard';
import { MyPlimapTabs } from '@/features/profile/components/MyPlimapTabs';
import { PinCard } from '@/features/pin/components/PinCard';
import { useLikeTrack } from '@/features/pin/queries/useLikeTrack';
import { useInfiniteMyPins } from '@/features/pin/queries/useMyPins';
import type { PinSearchPlace } from '@/features/pin/types';
import type { MyPlimapTab } from '@/features/profile/types';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { getCurrentPosition } from '@/utils/geolocation';
import type { AppOutletContext } from '@/layouts/RootLayout';

export default function MyPlimapPage() {
  const navigate = useNavigate();
  const { selectMapPlace } = useOutletContext<AppOutletContext>();
  const [tab, setTab] = useState<MyPlimapTab>('liked');
  const [isNavigatingToMap, setIsNavigatingToMap] = useState(false);
  const { data: myPins } = useInfiniteMyPins();
  const {
    data: likedTracks,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
  } = useLikeTrack({
    enabled: tab === 'liked',
  });

  const pins = myPins?.pages.flatMap((page) => page.data) ?? [];
  const tracks = likedTracks?.pages.flatMap((page) => page.tracks) ?? [];

  const loadMoreRef = useInfiniteScroll(
    () => {
      if (hasNextPage && !isFetchingNextPage && !isFetchNextPageError) fetchNextPage();
    },
    {
      enabled: tab === 'liked' && Boolean(hasNextPage) && !isFetchNextPageError,
      reconnectKey: isFetchingNextPage,
    },
  );

  const handlePlaceClick = async (pinId: number, fallbackPlaceName: string) => {
    if (isNavigatingToMap) return;

    setIsNavigatingToMap(true);
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
        isMine: true,
        coordinates: {
          lat: pinDetail.latitude,
          lng: pinDetail.longitude,
        },
      };

      selectMapPlace(place);
      navigate('/app');
    } catch (error) {
      console.error(error);
      setIsNavigatingToMap(false);
    }
  };

  return (
    <div className="flex min-h-full flex-col">
      <TopBar onBack={() => navigate(-1)} title="내 PLIMAP" titleWeight="medium" />

      <div className="flex flex-1 flex-col px-4 pt-3">
        <MyPlimapTabs value={tab} onChange={setTab} />

        <div className="flex flex-1 flex-col gap-3 pt-5">
          {tab === 'all' ? (
            pins.map((pin) => (
              <MyAllPinsCard
                key={pin.pinId}
                pin={{
                  id: String(pin.pinId),
                  placeName: pin.placeName,
                  albumImageUrl: pin.albumImageUrl,
                  trackName: pin.trackTitle,
                  artistName: pin.artist,
                  content: pin.introduction,
                  tags: pin.tags,
                  createdAtLabel: pin.staticCreatedAt,
                }}
                onPlaceClick={() => {
                  void handlePlaceClick(pin.pinId, pin.placeName);
                }}
                onMoreClick={() => {
                  // TODO: 더보기 메뉴 연결
                }}
              />
            ))
          ) : tracks.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-[2px] text-center">
              <p className="body-17-m text-grayscale-300">아직 찜한 노래가 없어요</p>
              <p className="body-15-m text-grayscale-700">
                마음에 드는 노래에 하트를 누르면 여기에 표시돼요
              </p>
            </div>
          ) : (
            <>
              {tracks.map((track) => (
                <PinCard
                  key={track.placeTrackId}
                  pin={{ ...track, liked: true }}
                  onClick={() => {
                    // TODO: 맵으로 이동 연결
                  }}
                />
              ))}
              {isFetchNextPageError ? (
                <div className="flex flex-col items-center gap-2 py-4">
                  <p className="body-15-m text-grayscale-500">더 불러오지 못했어요</p>
                  <button
                    type="button"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="body-15-m text-grayscale-300 underline disabled:opacity-50 cursor-pointer"
                  >
                    다시 시도
                  </button>
                </div>
              ) : (
                <div ref={loadMoreRef} className="h-4" aria-hidden />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

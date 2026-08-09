import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { TopBar } from '@/components/ui/TopBar';
import { Toast, ToastProvider, ToastViewport } from '@/components/ui/Toast';
import { MyAllPinsCard } from '@/features/profile/components/MyAllPinsCard';
import { MyPlimapTabs } from '@/features/profile/components/MyPlimapTabs';
import { PinCard } from '@/features/pin/components/PinCard';
import { useOpenPinPlaceOnMap } from '@/features/pin/hooks/useOpenPinPlaceOnMap';
import { useLikeTrack } from '@/features/pin/queries/useLikeTrack';
import { useInfiniteMyPins } from '@/features/pin/queries/useMyPins';
import type { MyPlimapTab } from '@/features/profile/types';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

const LOCATION_TOAST_DURATION_MS = 2_500;

type FeedbackToast = {
  attempt: number;
  message: string;
};

export default function MyPlimapPage() {
  const navigate = useNavigate();
  const { openPinPlaceOnMap, openPlaceTrackOnMap, isNavigating } = useOpenPinPlaceOnMap();
  const [tab, setTab] = useState<MyPlimapTab>('liked');
  const [feedbackToast, setFeedbackToast] = useState<FeedbackToast | null>(null);
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

  const showFeedbackToast = (message: string) => {
    setFeedbackToast((currentToast) => ({
      attempt: (currentToast?.attempt ?? 0) + 1,
      message,
    }));
  };

  return (
    <ToastProvider duration={LOCATION_TOAST_DURATION_MS}>
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
                  onClick={() => {
                    void openPinPlaceOnMap({
                      pinId: pin.pinId,
                      placeTrackId: pin.placeTrackId,
                      fallbackPlaceName: pin.placeName,
                      isMine: true,
                      showMyRegisteredTrackCta: true,
                      showMapBackButton: true,
                    });
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
                      if (isNavigating) return;
                      void openPlaceTrackOnMap({
                        placeTrackId: track.placeTrackId,
                        showMapBackButton: true,
                      }).then((result) => {
                        if (!result.ok) showFeedbackToast(result.message);
                      });
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

      <div className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+23px)] z-[70] flex justify-center">
        {feedbackToast ? (
          <Toast key={`${feedbackToast.message}:${feedbackToast.attempt}`} defaultOpen>
            {feedbackToast.message}
          </Toast>
        ) : null}
        <ToastViewport />
      </div>
    </ToastProvider>
  );
}

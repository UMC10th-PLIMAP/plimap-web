import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { TopBar } from '@/components/ui/TopBar';
import { MyAllPinsCard } from '@/features/profile/components/MyAllPinsCard';
import { MyPlimapTabs } from '@/features/profile/components/MyPlimapTabs';
import { PinCard } from '@/features/pin/components/PinCard';
import { useLikeTrack } from '@/features/pin/queries/useLikeTrack';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import type { MyAllPin, MyPlimapTab } from '@/features/profile/types';

const MOCK_MY_ALL_PINS: MyAllPin[] = [
  {
    id: '1',
    placeName: '서울특별시 강남구 영동대로 513',
    albumImageUrl: 'https://picsum.photos/seed/plimap-pin-1/200',
    trackName: '밤편지',
    artistName: '아이유',
    content: '지우고 널 지우려 해봐도\n가슴 한켠에 남아서\n자꾸 니가 떠올라\n또 하루를 넘겨',
    tags: ['감성'],
    createdAtLabel: '방금',
  },
  {
    id: '2',
    placeName: '뚝섬 한강공원',
    albumImageUrl: 'https://picsum.photos/seed/plimap-pin-2/200',
    trackName: '밤편지',
    artistName: '아이유',
    content: '지우고 널 지우려 해봐도\n가슴 한켠에 남아서\n자꾸 니가 떠올라\n또 하루를 넘겨',
    tags: ['감성'],
    createdAtLabel: '방금',
  },
];

export default function MyPlimapPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<MyPlimapTab>('all');
  const {
    data: likedTracks,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
  } = useLikeTrack({
    enabled: tab === 'liked',
  });

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

  return (
    <div className="flex min-h-full flex-col">
      <TopBar onBack={() => navigate(-1)} title="내 PLIMAP" titleWeight="medium" />

      <div className="flex flex-1 flex-col px-4 pt-3">
        <MyPlimapTabs value={tab} onChange={setTab} />

        <div className="flex flex-1 flex-col gap-3 pt-5">
          {tab === 'all' ? (
            MOCK_MY_ALL_PINS.map((pin) => (
              <MyAllPinsCard
                key={pin.id}
                pin={pin}
                onPlaceClick={() => {
                  // TODO: 장소 상세/맵 이동 연결
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

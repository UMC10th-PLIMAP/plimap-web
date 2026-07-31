import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { TopBar } from '@/components/ui/TopBar';
import { MyAllPinsCard } from '@/features/profile/components/MyAllPinsCard';
import { MyPlimapTabs } from '@/features/profile/components/MyPlimapTabs';
import { PinCard } from '@/features/pin/components/PinCard';
import { useLikeTrack } from '@/features/pin/queries/useLikeTrack';
import { useInfiniteMyPins } from '@/features/pin/queries/useMyPins';
import type { MyPlimapTab } from '@/features/profile/types';

export default function MyPlimapPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<MyPlimapTab>('liked');
  const { data: myPins } = useInfiniteMyPins();
  const { data: likedTracks } = useLikeTrack({
    enabled: tab === 'liked',
  });

  const pins = myPins?.pages.flatMap((page) => page.data) ?? [];
  const tracks = likedTracks?.tracks ?? [];

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
            tracks.map((track) => (
              <PinCard
                key={track.placeTrackId}
                pin={{ ...track, liked: true }}
                onClick={() => {
                  // TODO: 맵으로 이동 연결
                }}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

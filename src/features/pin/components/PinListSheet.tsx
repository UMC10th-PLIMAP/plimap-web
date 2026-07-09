import { useState } from 'react';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { PinCard } from '@/features/pin/components/PinCard';
import { SortTabs } from '@/features/pin/components/SortTabs';
import BookmarkIcon from '@/assets/icons/bookmark.svg?react';
import type { PinSong, PinSort, PlaceInfo } from '@/types/pin';

type PinListSheetProps = {
  place?: PlaceInfo;
  pins?: PinSong[];
  onPinClick?: (pin: PinSong) => void;
};

const MOCK_PLACE: PlaceInfo = {
  id: '1',
  name: '물빛무대 앞 광장',
  creatorName: '냥코',
  distance: 100,
};

const MOCK_PINS: PinSong[] = [
  {
    id: '1',
    title: 'LOVE ATTACK',
    artist: 'RESCENE',
    pinCount: 1,
    likeCount: 1,
    liked: true,
  },
];

export function PinListSheet({
  place = MOCK_PLACE,
  pins = MOCK_PINS,
  onPinClick,
}: PinListSheetProps) {
  const [open, setOpen] = useState(false);
  const [sort, setSort] = useState<PinSort>('popular');

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-6">
      {/* 지도 부분 onclick시 바텀시트 열기 */}
      <p className="body-15-r text-grayscale-400">PIN 목록 바텀시트 미리보기</p>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full bg-neon px-6 py-3 body-15-sb text-grayscale-1250"
      >
        PIN 목록 시트 열기
      </button>

      <BottomSheet open={open} onClose={() => setOpen(false)}>
        <BottomSheet.FullPageNav />

        <BottomSheet.Header className="mt-[26.75px] px-4 ">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <h2 className="head-24-sb text-grayscale-100">{place.name}</h2>
              <p className="body-15-m text-grayscale-500">
                <span className="body-15-r text-grayscale-200">{place.creatorName}</span> 님이
                생성한 PIN · <span className="text-red">{place.distance}</span>m
              </p>
            </div>

            <button
              type="button"
              aria-label="북마크"
              className="flex size-11 items-center justify-center rounded-full bg-pli-black-75"
            >
              <BookmarkIcon className="size-7" />
            </button>
          </div>
          <div className="mt-6">
            <SortTabs value={sort} onChange={setSort} />
          </div>
        </BottomSheet.Header>

        <BottomSheet.Content className="mt-5">
          <ul className="flex flex-col gap-4.5">
            {pins.map((pin) => (
              <li key={pin.id}>
                <PinCard pin={pin} onClick={() => onPinClick?.(pin)} />
              </li>
            ))}
          </ul>
        </BottomSheet.Content>
      </BottomSheet>
    </div>
  );
}

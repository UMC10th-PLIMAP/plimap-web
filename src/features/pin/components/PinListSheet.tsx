import { useMemo, useState } from 'react';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { PinCard } from '@/features/pin/components/PinCard';
import { SortTabs } from '@/features/pin/components/SortTabs';
import BookmarkIcon from '@/assets/icons/bookmark.svg?react';
import type { Pin, PinSort, PlaceInfo } from '@/features/pin/types';

type PinListSheetProps = {
  open: boolean;
  onClose: () => void;
  place: PlaceInfo;
  pins: Pin[];
  onPinClick?: (pin: Pin) => void;
};

export function PinListSheet({ open, onClose, place, pins, onPinClick }: PinListSheetProps) {
  const [sort, setSort] = useState<PinSort>('popular');

  // Pin에는 생성 시각이 없어 latest는 원본 배열(등록 순)을 역순으로 처리한다.
  const sortedPins = useMemo(() => {
    if (sort === 'latest') {
      return [...pins].reverse();
    }
    return [...pins].sort((a, b) => (b.likeCount ?? 0) - (a.likeCount ?? 0));
  }, [pins, sort]);

  return (
    <BottomSheet open={open} onClose={onClose}>
      <BottomSheet.FullPageNav />

      <BottomSheet.Header className="mt-[26.75px] px-4 ">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <BottomSheet.Title className="head-24-sb text-grayscale-100">
              {place.name}
            </BottomSheet.Title>
            <p className="body-15-m text-grayscale-500">
              <span className="body-15-r text-grayscale-200">{place.creatorName}</span> 님이 생성한
              PIN · <span className="text-red">{place.distance}</span>m
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
          {sortedPins.map((pin) => (
            <li key={pin.id}>
              <PinCard pin={pin} onClick={() => onPinClick?.(pin)} />
            </li>
          ))}
        </ul>
      </BottomSheet.Content>
    </BottomSheet>
  );
}

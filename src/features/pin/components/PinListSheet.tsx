import { useMemo, useState } from 'react';

import BookmarkIcon from '@/assets/icons/bookmark.svg?react';
import { BottomSheet, useBottomSheet } from '@/components/ui/BottomSheet';
import { PinCard } from '@/features/pin/components/PinCard';
import { SortTabs } from '@/features/pin/components/SortTabs';
import type { Pin, PinSort, PlaceInfo } from '@/features/pin/types';
import { cn } from '@/lib/utils';

type PinListSheetProps = {
  open: boolean;
  onClose: () => void;
  place: PlaceInfo;
  pins: Pin[];
  onPinClick?: (pin: Pin) => void;
};

function formatDistance(distance: number) {
  const normalizedDistance = Math.max(0, distance);

  if (normalizedDistance >= 1000) {
    const kilometers = normalizedDistance / 1000;
    return {
      value: Number.isInteger(kilometers) ? String(kilometers) : kilometers.toFixed(1),
      unit: 'km',
    };
  }

  return { value: String(Math.round(normalizedDistance)), unit: 'm' };
}

type PinListContentProps = {
  place: PlaceInfo;
  pins: Pin[];
  sort: PinSort;
  onSortChange: (sort: PinSort) => void;
  onPinClick?: (pin: Pin) => void;
};

function PinListContent({ place, pins, sort, onSortChange, onPinClick }: PinListContentProps) {
  const { isFullPage } = useBottomSheet();
  const distance = formatDistance(place.distance);
  const hasPins = pins.length > 0;

  return (
    <>
      <BottomSheet.Header className={cn('px-4', isFullPage ? 'mt-0' : 'mt-[26.75px]')}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex flex-col items-start gap-2">
              {place.isMine ? (
                <div className="flex items-center justify-center gap-1.5 rounded-[25px] bg-pli-black-75 px-2 py-1">
                  <span className="size-1.5 rounded-full bg-neon-2" aria-hidden />
                  <span className="etc-13-r text-neon-2">MY</span>
                </div>
              ) : null}

              <div className="min-w-0">
                <BottomSheet.Title className="block truncate head-24-sb text-grayscale-100">
                  {place.name}
                </BottomSheet.Title>
                {place.address ? (
                  <p className="truncate body-15-r text-grayscale-500">{place.address}</p>
                ) : null}
              </div>
            </div>

            <p className="truncate body-15-m text-grayscale-400">
              {place.creatorName ? (
                <>
                  <span className="body-15-r text-grayscale-200">{place.creatorName}</span> 님이
                  생성한 핀 · <span className="text-grayscale-300">{distance.value}</span>
                  {distance.unit}
                </>
              ) : (
                <>
                  생성되지 않음 · <span className="text-grayscale-300">{distance.value}</span>
                  {distance.unit}
                </>
              )}
            </p>
          </div>

          <button
            type="button"
            aria-label="북마크"
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-pli-black-75"
          >
            <BookmarkIcon className="size-7" />
          </button>
        </div>

        {hasPins ? (
          <div className="mt-6">
            <SortTabs value={sort} onChange={onSortChange} />
          </div>
        ) : null}
      </BottomSheet.Header>

      <BottomSheet.Content className={cn('mt-5 px-4', !hasPins && 'flex flex-col')}>
        {hasPins ? (
          <ul className="flex flex-col gap-4">
            {pins.map((pin) => (
              <li key={pin.placeTrackId}>
                <PinCard pin={pin} onClick={() => onPinClick?.(pin)} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col h-[131px] items-center justify-center rounded-[12px] bg-pli-black-85  text-center">
            <p className="body-18-r text-grayscale-300">생성된 핀이 없어요</p>
            <p className="body-15-r text-grayscale-600">첫번째 등록자가 되어보세요!</p>
          </div>
        )}
      </BottomSheet.Content>
    </>
  );
}

export function PinListSheet({ open, onClose, place, pins, onPinClick }: PinListSheetProps) {
  const [sort, setSort] = useState<PinSort>('popular');

  const sortedPins = useMemo(() => {
    if (sort === 'latest') {
      return [...pins].reverse();
    }
    return [...pins].sort((a, b) => (b.likeCount ?? 0) - (a.likeCount ?? 0));
  }, [pins, sort]);

  return (
    <BottomSheet open={open} onClose={onClose}>
      <BottomSheet.FullPageNav />
      <PinListContent
        place={place}
        pins={sortedPins}
        sort={sort}
        onSortChange={setSort}
        onPinClick={onPinClick}
      />
    </BottomSheet>
  );
}

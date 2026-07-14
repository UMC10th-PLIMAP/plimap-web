import { cn } from '@/lib/utils';
import type { Pin } from '@/features/pin/types';

import NextIcon from '@/assets/icons/next.svg?react';
import HeartIcon from '@/assets/icons/heart.svg?react';

type PinCardProps = {
  pin: Pin;
  onClick?: () => void;
};

export function PinCard({ pin, onClick }: PinCardProps) {
  const { title, artist, pinCount, likeCount, liked } = pin;

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full rounded-xl bg-pli-black-85 p-4.5 justify-between"
    >
      <div className="flex flex-col gap-4">
        <div className="flex gap-4">
          <div className="size-13 rounded-lg bg-grayscale-0" />

          <div className="flex flex-col gap-[3px] items-start">
            <p className="truncate body-17-m text-grayscale-100">{title}</p>
            <p className="truncate etc-15-r text-grayscale-400">{artist}</p>
          </div>
        </div>

        <div className="flex items-center gap-1 body-15-r text-grayscale-400">
          <HeartIcon
            className={cn('size-4', liked ? 'fill-red text-red' : 'text-grayscale-400')}
            aria-hidden
          />
          {likeCount ?? 0}
        </div>
      </div>

      <div className="flex items-center gap-1 etc-13-r text-grayscale-400">
        {pinCount}명이 PIN
        <NextIcon className="size-4" aria-hidden />
      </div>
    </button>
  );
}

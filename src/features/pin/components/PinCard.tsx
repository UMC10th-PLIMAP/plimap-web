import HeartIcon from '@/assets/icons/heart.svg?react';
import NextIcon from '@/assets/icons/next.svg?react';
import type { Pin } from '@/features/pin/types';
import { cn } from '@/lib/utils';

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
      className="flex w-full items-center justify-between rounded-xl bg-pli-black-85 p-4.5 text-left"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <div className="size-13 shrink-0 rounded-lg bg-grayscale-0" aria-hidden />

          <div className="flex min-w-0 flex-col items-start gap-[3px]">
            <p className="w-full truncate body-15-sb text-grayscale-100">{title}</p>
            <p className="w-full truncate body-15-r text-grayscale-500">{artist}</p>
          </div>
        </div>

        {likeCount !== undefined ? (
          <div className="flex items-center gap-1 body-15-r text-grayscale-300">
            <HeartIcon
              className={cn(
                'size-[18px] shrink-0',
                liked ? 'fill-red text-red' : 'text-grayscale-300',
              )}
              aria-hidden
            />
            <span>{likeCount}</span>
          </div>
        ) : null}
      </div>

      <div className="ml-3 flex shrink-0 items-center gap-1 etc-13-r text-grayscale-300">
        {pinCount}명이 등록
        <NextIcon className="size-5" aria-hidden />
      </div>
    </button>
  );
}

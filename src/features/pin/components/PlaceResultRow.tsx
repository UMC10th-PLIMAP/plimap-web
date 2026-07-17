import type { ComponentProps } from 'react';

import type { PlaceResult } from '@/features/pin/types';
import { cn } from '@/lib/utils';

type PlaceResultRowProps = ComponentProps<'button'> & {
  place: PlaceResult;
};

export function PlaceResultRow({ place, className, ...props }: PlaceResultRowProps) {
  const { creatorName, category, placeName, address, distance } = place;

  return (
    <button
      type="button"
      className={cn(
        'flex w-full flex-col items-start justify-center rounded-xl px-4 py-2 text-left transition-colors hover:bg-pli-black-75 focus-visible:bg-pli-black-75 focus-visible:outline-none',
        className,
      )}
      {...props}
    >
      <div className="flex w-full min-w-0 flex-col items-start gap-[6px] whitespace-nowrap pb-3 pt-4">
        <div className="flex w-full min-w-0 items-center gap-[6px]">
          <span className="min-w-0 truncate body-17-r text-grayscale-100">{placeName}</span>
          <span className="shrink-0 etc-13-r text-grayscale-400">{category}</span>
        </div>

        <span className="w-full truncate etc-13-r text-grayscale-500">{address}</span>

        <div className="flex w-full min-w-0 items-start gap-1 text-grayscale-500">
          {creatorName ? (
            <>
              <span className="min-w-0 truncate body-15-r text-grayscale-200">{creatorName}</span>
              <span className="shrink-0 body-15-m">님이 생성한 PIN</span>
            </>
          ) : (
            <span className="shrink-0 body-15-m">생성되지 않음</span>
          )}
          <span className="shrink-0 body-15-m">∙ {distance}m</span>
        </div>
      </div>
    </button>
  );
}

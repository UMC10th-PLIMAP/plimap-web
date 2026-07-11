import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';
import type { PlaceResult } from '@/types/place';

type PlaceResultRowProps = ComponentProps<'button'> & {
  place: PlaceResult;
};

export function PlaceResultRow({ place, className, ...props }: PlaceResultRowProps) {
  const { creatorName, category, placeName, distance } = place;

  return (
    <button
      type="button"
      className={cn(
        'flex w-full max-w-[402px] flex-col items-start justify-center px-6 py-2 text-left',
        className,
      )}
      {...props}
    >
      <div className="flex w-full max-w-[342px] items-center justify-between pb-3 pt-4">
        <div className="flex w-[189px] max-w-full flex-col items-start gap-[6px] whitespace-nowrap">
          <div className="flex w-full items-center gap-[6px]">
            <span className="shrink-0 body-17-r text-grayscale-100">{placeName}</span>
            <span className="shrink-0 etc-13-r text-grayscale-400">{category}</span>
          </div>

          <div className="flex items-start gap-1 text-grayscale-500">
            {creatorName ? (
              <>
                <span className="body-15-r text-grayscale-200">{creatorName}</span>
                <span className="body-15-m">님이 생성한 PIN</span>
              </>
            ) : (
              <span className="body-15-m">생성되지 않음</span>
            )}
            <span className="body-15-m">∙ {distance}m</span>
          </div>
        </div>
      </div>
    </button>
  );
}

import type { ComponentProps } from 'react';

import RecentSearchDeleteIcon from '@/assets/icons/recent-search-delete.svg?react';
import RecentSearchIcon from '@/assets/icons/recent-search.svg?react';
import type { PlaceResult } from '@/features/pin/types';
import { cn } from '@/lib/utils';

type PlaceResultRowProps = Omit<ComponentProps<'button'>, 'type'> & {
  place: PlaceResult;
  variant?: 'search-result' | 'recent-search';
};

export function PlaceResultRow({
  place,
  className,
  variant = 'search-result',
  ...props
}: PlaceResultRowProps) {
  const { address, category, creatorName, distance, placeName } = place;
  const isRecentSearch = variant === 'recent-search';

  return (
    <div className="py-2">
      <button
        type="button"
        className={cn(
          'flex w-full min-w-0 items-start gap-4 rounded-xl px-4 text-left transition-colors hover:bg-pli-black-75 focus-visible:bg-pli-black-75 focus-visible:outline-none',
          className,
        )}
        {...props}
      >
        {isRecentSearch ? (
          <span className="mt-4 flex size-7 shrink-0 items-center justify-center rounded-full bg-pli-black-75">
            <RecentSearchIcon className="size-5" aria-hidden />
          </span>
        ) : null}

        <span className="flex min-w-0 flex-1 flex-col items-start gap-[6px] whitespace-nowrap pb-3 pt-4">
          <span className="flex w-full min-w-0 items-center gap-[6px]">
            <span className="min-w-0 truncate body-17-r text-grayscale-100">{placeName}</span>
            <span className="shrink-0 etc-13-r text-grayscale-400">{category}</span>
          </span>

          <span className="w-full truncate body-15-r text-grayscale-500">{address}</span>

          <span className="flex w-full min-w-0 items-start gap-1 text-grayscale-500">
            {creatorName ? (
              <>
                <span className="min-w-0 truncate body-15-r text-grayscale-200">{creatorName}</span>
                <span className="shrink-0 body-15-m">님이 생성한 PIN</span>
              </>
            ) : (
              <span className="shrink-0 body-15-m">생성되지 않음</span>
            )}
            <span className="shrink-0 body-15-m">∙ {distance}m</span>
          </span>
        </span>

        {isRecentSearch ? (
          <span className="mt-4 flex size-6 shrink-0 items-center justify-center" aria-hidden>
            <RecentSearchDeleteIcon className="size-3" aria-hidden />
          </span>
        ) : null}
      </button>
    </div>
  );
}

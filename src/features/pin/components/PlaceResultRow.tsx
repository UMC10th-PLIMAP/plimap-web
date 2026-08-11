import type { ComponentProps } from 'react';

import LocationIcon from '@/assets/icons/location.svg?react';
import RecentSearchDeleteIcon from '@/assets/icons/recent-search-delete.svg?react';
import RecentSearchIcon from '@/assets/icons/recent-search.svg?react';
import type { PlaceResult } from '@/features/pin/types';
import { cn } from '@/lib/utils';

type PlaceResultRowProps = Omit<ComponentProps<'button'>, 'type'> & {
  place: PlaceResult;
  variant?: 'search-result' | 'recent-search';
  isOutOfRange?: boolean;
  onDelete?: () => void;
  isDeleteDisabled?: boolean;
  isDeletePending?: boolean;
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

export function PlaceResultRow({
  place,
  className,
  variant = 'search-result',
  isOutOfRange = false,
  onDelete,
  isDeleteDisabled = false,
  isDeletePending = false,
  disabled,
  ...props
}: PlaceResultRowProps) {
  const { address, category, creatorName, distance, placeName } = place;
  const isRecentSearch = variant === 'recent-search';
  const showDeleteButton = isRecentSearch && onDelete;
  const formattedDistance = formatDistance(distance);
  const isSelectionDisabled = disabled || isOutOfRange;

  return (
    <div
      className={cn(
        'py-2',
        showDeleteButton && 'flex w-full items-start gap-4 pr-4',
        isOutOfRange && 'opacity-40',
      )}
    >
      <button
        type="button"
        className={cn(
          'flex min-w-0 items-start gap-4 rounded-xl text-left transition-colors hover:bg-pli-black-75 focus-visible:bg-pli-black-75 focus-visible:outline-none',
          showDeleteButton ? 'flex-1 pl-4' : 'w-full px-4',
          isSelectionDisabled &&
            'cursor-not-allowed hover:bg-transparent focus-visible:bg-transparent',
          className,
        )}
        disabled={isSelectionDisabled}
        {...props}
      >
        <span className="mt-4 flex size-7 shrink-0 items-center justify-center rounded-full bg-pli-black-75">
          {isRecentSearch ? (
            <RecentSearchIcon className="size-5" aria-hidden />
          ) : (
            <LocationIcon className="size-[18px] text-grayscale-600" aria-hidden />
          )}
        </span>

        <span className="flex min-w-0 flex-1 flex-col items-start gap-[6px] whitespace-nowrap pb-3 pt-4">
          <span className="flex w-full min-w-0 items-center gap-[6px]">
            <span className="min-w-0 truncate body-17-r text-grayscale-100">{placeName}</span>
            <span className="shrink-0 etc-13-r text-grayscale-400">{category}</span>
          </span>

          <span className="w-full truncate body-15-r text-grayscale-500">{address}</span>

          <span className="flex w-full min-w-0 items-start gap-1">
            {creatorName ? (
              <>
                <span className="min-w-0 truncate body-15-r text-grayscale-200">{creatorName}</span>
                <span className="shrink-0 body-15-m text-grayscale-400">님이 생성한 핀</span>
              </>
            ) : (
              <span className="shrink-0 body-15-m text-grayscale-400">생성되지 않음</span>
            )}
            <span className="shrink-0 body-15-m text-grayscale-300">∙</span>
            <span className="flex shrink-0 body-15-m">
              <span className={cn(isOutOfRange ? 'text-red' : 'text-grayscale-300')}>
                {formattedDistance.value}
              </span>
              <span className="text-grayscale-300">{formattedDistance.unit}</span>
            </span>
          </span>
        </span>
      </button>

      {showDeleteButton ? (
        <button
          type="button"
          className="mt-4 flex size-6 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-pli-black-75 focus-visible:bg-pli-black-75 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          onClick={onDelete}
          disabled={isDeleteDisabled}
          aria-label={`최근 검색에서 ${placeName} 삭제`}
          aria-busy={isDeletePending || undefined}
        >
          <RecentSearchDeleteIcon className="size-3" aria-hidden />
        </button>
      ) : null}
    </div>
  );
}

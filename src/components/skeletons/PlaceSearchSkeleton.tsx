import { Skeleton } from '@/components/ui/Skeleton';
import LocationIcon from '@/assets/icons/location.svg?react';
import RecentSearchIcon from '@/assets/icons/recent-search.svg?react';

export type PlaceSearchSkeletonProps = {
  variant?: 'search-result' | 'recent-search';
};

export function PlaceSearchSkeleton({ variant = 'search-result' }: PlaceSearchSkeletonProps) {
  const isRecentSearch = variant === 'recent-search';

  return (
    <div className="flex w-full items-start gap-4 px-4 py-2">
      <div className="mt-4 flex size-7 shrink-0 items-center justify-center rounded-full bg-pli-black-75">
        {isRecentSearch ? (
          <RecentSearchIcon className="size-5" aria-hidden />
        ) : (
          <LocationIcon className="size-[18px] text-grayscale-600" aria-hidden />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-[6px] pb-3 pt-4">
        <div className="flex h-6 items-center gap-1.5">
          <Skeleton className="h-4 w-25 rounded-sm" />
          <Skeleton className="h-4 w-6 rounded-sm" />
        </div>
        <div className="flex h-[21px] items-center">
          <Skeleton className="h-4 w-[252px] max-w-full rounded-sm" />
        </div>
        <div className="flex h-[21px] items-center gap-1">
          <Skeleton className="h-4 w-30 rounded-sm" />
          <Skeleton className="h-4 w-13 rounded-sm" />
        </div>
      </div>
    </div>
  );
}

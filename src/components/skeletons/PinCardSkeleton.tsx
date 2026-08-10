import NextIcon from '@/assets/icons/next.svg?react';
import { Skeleton } from '@/components/ui/Skeleton';

export function PinCardSkeleton() {
  return (
    <div className="flex w-full items-center justify-between rounded-xl bg-pli-black-85 p-4.5">
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <Skeleton className="size-13 rounded-lg" />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <Skeleton className="h-[21px] w-[132px] rounded-sm" />
            <Skeleton className="h-4 w-17 rounded-sm" />
          </div>
        </div>
        <Skeleton className="h-[21px] w-[36px] rounded-sm" />
      </div>

      <div className="flex items-center gap-1">
        <Skeleton className="h-[21px] w-[52px] rounded-sm" />
        <NextIcon className="size-5 text-pli-black-50" aria-hidden />
      </div>
    </div>
  );
}

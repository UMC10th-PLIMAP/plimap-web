import BackIcon from '@/assets/icons/back.svg?react';
import { Skeleton } from '@/components/ui/Skeleton';
import { PinFeedCardSkeleton } from './PinFeedCardSkeleton';

export function PinDetailSkeleton() {
  return (
    <div
      role="status"
      aria-label="곡 상세 불러오는 중"
      className="flex min-h-full flex-col bg-pli-black-100"
    >
      <div className="flex flex-col items-center px-4">
        <div className="grid h-15 w-full grid-cols-[28px_1fr_28px] items-center">
          <div className="flex size-7 items-center justify-center text-grayscale-100">
            <BackIcon aria-hidden />
          </div>
        </div>

        <Skeleton className="size-[112px] rounded-lg" />
        <Skeleton className="mt-3 h-7 w-[183px] rounded-sm" />
        <Skeleton className="mt-[11px] h-4 w-[64px] rounded-sm" />
        <Skeleton className="mt-[14px] h-[41px] w-[183px] rounded-lg" />
      </div>

      <div className="flex items-center justify-between px-4 pt-6">
        <Skeleton className="h-4 w-[64px] rounded-sm" />
        <Skeleton className="h-4 w-[64px] rounded-sm" />
      </div>

      <div className="flex flex-col gap-2 mx-[11px] mt-4">
        {Array.from({ length: 2 }).map((_, index) => (
          <PinFeedCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

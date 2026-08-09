import { Skeleton } from '@/components/ui/Skeleton';
import { TopBar } from '@/components/ui/TopBar';
import { PinFeedCardSkeleton } from './PinFeedCardSkeleton';

type PinDetailSkeletonProps = {
  onBack?: () => void;
};

export function PinDetailSkeleton({ onBack }: PinDetailSkeletonProps) {
  return (
    <div
      role="status"
      aria-label="핀 상세 불러오는 중"
      className="flex min-h-full flex-col bg-pli-black-100"
    >
      <TopBar onBack={onBack} />

      <div className="flex flex-col items-center px-4">
        <Skeleton className="size-[112px] rounded-lg" />
        <Skeleton className="mt-3 h-7 w-[183px] rounded-sm" />
        <Skeleton className="mt-[11px] h-4 w-[72px] rounded-sm" />
        <Skeleton className="mt-[14px] h-[41px] w-[183px] rounded-lg" />
      </div>

      <div className="flex items-center justify-between px-4 pt-6">
        <Skeleton className="h-4 w-[64px] rounded-sm" />
        <Skeleton className="h-4 w-[58px] rounded-sm" />
      </div>

      <div className="flex flex-col gap-2 mx-[11px] mt-4">
        {Array.from({ length: 2 }).map((_, index) => (
          <PinFeedCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

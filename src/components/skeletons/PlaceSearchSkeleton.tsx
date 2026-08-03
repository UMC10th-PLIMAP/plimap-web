import { Skeleton } from '@/components/ui/Skeleton';
import LocationIcon from '@/assets/icons/location.svg?react';

export function PlaceSearchSkeleton() {
  return (
    <div className="w-[342px] h-25 pt-4 pb-3 flex gap-4 mx-6">
      <div className="flex w-8 h-7 items-center justify-center rounded-full bg-pli-black-50">
        <LocationIcon className="h-[15px] w-4 text-grayscale-600" />
      </div>
      <div className="w-full flex flex-col">
        <div className="flex items-center gap-1.5 py-1">
          <Skeleton className="w-25 h-4 rounded-sm" />
          <Skeleton className="w-6 h-4 rounded-sm" />
        </div>
        <div className="py-[2.5px]">
          <Skeleton className="w-[252px] h-4 rounded-sm " />
        </div>
        <div className="flex items-center gap-1 pt-[6px]">
          <Skeleton className="w-30 h-4 rounded-sm" />
          <Skeleton className="w-13 h-4 rounded-sm" />
        </div>
      </div>
    </div>
  );
}

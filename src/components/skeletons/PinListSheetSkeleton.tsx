import BookmarkIcon from '@/assets/icons/bookmark.svg?react';
import NextIcon from '@/assets/icons/next.svg?react';
import { Skeleton } from '@/components/ui/Skeleton';

export function PinListSheetSkeleton() {
  return (
    <div
      role="status"
      aria-label="장소 핀 목록 불러오는 중"
      className="flex w-full flex-col rounded-t-[20px] bg-pli-black-100 px-4 pt-[10.25px]"
    >
      <div className="mx-auto h-1 w-[41px] rounded-full bg-[#8A8A8A]" aria-hidden />

      <div className="mt-7 flex w-full items-center justify-between">
        <div className="flex flex-col">
          <Skeleton className="h-[21px] w-12 rounded-[25px]" />
          <Skeleton className="h-8 w-[180px] rounded-sm mt-2" />
          <Skeleton className="h-3 w-[154px] rounded-sm mt-[11px]" />
          <div className="flex items-center gap-1 mt-[6px]">
            <Skeleton className="h-3 w-[119px] rounded-sm" />
            <Skeleton className="h-3 w-11 rounded-sm" />
          </div>
        </div>
        <div className="flex size-11 items-center justify-center rounded-full bg-pli-black-75">
          <BookmarkIcon className="size-7 text-grayscale-200" aria-hidden />
        </div>
      </div>

      <div className="mt-6 h-10 bg-pli-black-75 rounded-xl  py-1 px-[4.5px]">
        <Skeleton className="h-8 w-[178px] rounded-[10px]" />
      </div>

      <div className="mt-6 flex w-full items-center justify-between rounded-xl bg-pli-black-85 p-4.5">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <Skeleton className="size-13 rounded-lg" />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <Skeleton className="h-[21px] w-[110px] rounded-sm" />
              <Skeleton className="h-4 w-13 rounded-sm" />
            </div>
          </div>
          <Skeleton className="h-[21px] w-[36px] rounded-sm" />
        </div>

        <div className="flex items-center gap-1">
          <Skeleton className="h-[21px] w-[52px] rounded-sm" />
          <NextIcon className="size-5 text-pli-black-50" aria-hidden />
        </div>
      </div>
    </div>
  );
}

import BookmarkIcon from '@/assets/icons/bookmark.svg?react';
import CloseIcon from '@/assets/icons/close.svg?react';
import { Skeleton } from '@/components/ui/Skeleton';
import { useBottomSheet } from '@/components/ui/BottomSheet';
import { PinCardSkeleton } from '@/components/skeletons/PinCardSkeleton';

export function PinListSheetSkeleton() {
  const { isFullPage } = useBottomSheet();

  return (
    <div
      role="status"
      aria-label="장소 핀 목록 불러오는 중"
      className="flex w-full flex-col px-4 mt-[26.75px]"
    >
      <div className="flex w-full items-center justify-between">
        <div className="flex flex-col">
          <Skeleton className="h-[21px] w-12 rounded-[25px]" />
          <Skeleton className="h-8 w-[180px] rounded-sm mt-2" />
          <Skeleton className="h-3 w-[154px] rounded-sm mt-[11px]" />
          <div className="flex items-center gap-1 mt-[6px]">
            <Skeleton className="h-3 w-[119px] rounded-sm" />
            <Skeleton className="h-3 w-18 rounded-sm" />
          </div>
        </div>
        {/* 풀페이지 상태에선 아이콘 숨김 */}
        {!isFullPage ? (
          <div className="flex shrink-0 items-center gap-2">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-pli-black-75">
              <BookmarkIcon className="size-7 text-grayscale-200" aria-hidden />
            </div>
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-pli-black-75">
              <CloseIcon className="size-6 text-grayscale-200" aria-hidden />
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-6 h-10 bg-pli-black-75 rounded-xl  py-1 px-[4.5px]">
        <Skeleton className="h-8 w-[178px] rounded-[10px]" />
      </div>

      <div className="mt-6">
        <PinCardSkeleton />
      </div>
    </div>
  );
}

import BellIcon from '@/assets/home/bell.svg?react';
import NextIcon from '@/assets/icons/next.svg?react';
import PlimapLogo from '@/assets/logo/plimap-logo.svg?react';
import { Skeleton } from '@/components/ui/Skeleton';

const FRIEND_PIN_SKELETON_COUNT = 3;
const HOT_PLACE_SKELETON_COUNT = 2;
const SAVED_PLACE_SKELETON_COUNT = 3;

function PaginationSkeleton() {
  return (
    <div className="flex items-center justify-center gap-2" aria-hidden>
      <span className="size-1.5 rounded-full bg-grayscale-100" />
      <span className="size-1.5 rounded-full bg-grayscale-700" />
      <span className="size-1.5 rounded-full bg-grayscale-700" />
    </div>
  );
}

export function HomeSkeleton() {
  return (
    <main
      className="relative min-h-full shrink-0 bg-pli-black-100 pb-[calc(env(safe-area-inset-bottom)+148px)]"
      role="status"
      aria-label="홈 화면 불러오는 중"
    >
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[calc(env(safe-area-inset-top)+331px)] bg-pli-black-85"
      />

      <div className="relative flex flex-col gap-[30px] pt-[calc(env(safe-area-inset-top)+2px)]">
        <section>
          <header className="flex h-14 items-center justify-between px-4">
            <PlimapLogo aria-label="PLIMAP" className="h-[30px] w-auto" />
            <div
              aria-hidden
              className="flex size-11 items-center justify-center rounded-full bg-pli-black-75"
            >
              <BellIcon className="h-[22px] w-[18px]" />
            </div>
          </header>

          <div className="flex h-[88px] flex-col gap-1 px-4 py-4">
            <Skeleton className="h-7 w-[217px] rounded-sm" />
            <div className="flex h-6 items-center gap-2">
              <Skeleton className="h-4 w-16 rounded-sm" />
              <Skeleton className="h-4 w-[155px] rounded-sm" />
              <NextIcon aria-hidden className="size-4 text-grayscale-300" />
            </div>
          </div>

          <div className="flex h-44 gap-3 overflow-hidden px-4 pt-3 pb-10">
            {Array.from({ length: FRIEND_PIN_SKELETON_COUNT }, (_, index) => (
              <Skeleton key={index} className="size-[124px] shrink-0 rounded-xl" />
            ))}
          </div>
        </section>

        <Skeleton className="mx-4 h-[86px] rounded-xl" />

        <section className="flex flex-col gap-4">
          <Skeleton className="ml-4 h-7 w-[217px] rounded-sm" />
          <div className="flex gap-4 px-[19px]">
            <Skeleton className="h-[41px] w-[101px] rounded-full" />
            <Skeleton className="h-[41px] w-[101px] rounded-full" />
          </div>
          <div className="flex flex-col gap-4 px-[19px]">
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: HOT_PLACE_SKELETON_COUNT }, (_, index) => (
                <Skeleton key={index} className="aspect-square w-full rounded-xl" />
              ))}
            </div>
            <PaginationSkeleton />
          </div>
        </section>

        <section className="flex flex-col gap-5 px-4">
          <Skeleton className="h-7 w-[217px] rounded-sm" />
          <div className="flex flex-col gap-4">
            {Array.from({ length: SAVED_PLACE_SKELETON_COUNT }, (_, index) => (
              <Skeleton key={index} className="h-[88px] w-full rounded-xl" />
            ))}
          </div>
          <PaginationSkeleton />
        </section>
      </div>
    </main>
  );
}

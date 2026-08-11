import { Skeleton } from '@/components/ui/Skeleton';

export function MyAllPinsCardSkeleton() {
  return (
    <article
      className="flex w-full flex-col rounded-[20px] bg-pli-black-85 px-4 pt-4 pb-3"
      aria-hidden
    >
      <div className="flex items-center gap-1">
        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          <Skeleton className="size-5 shrink-0 rounded-sm" />
          <Skeleton className="h-6 w-[226px]  rounded-sm" />
          <Skeleton className="size-6 shrink-0 rounded-sm" />
        </div>
        <Skeleton className="size-6 shrink-0 rounded-sm" />
      </div>

      <div className="flex items-center gap-[17px] pt-[13px]">
        <Skeleton className="size-[59px] shrink-0 rounded-lg" />
        <div className="flex min-w-0 flex-col gap-1">
          <Skeleton className="h-6 w-[133px] max-w-full rounded-sm" />
          <Skeleton className="h-[21px] w-[117px] max-w-full rounded-sm" />
        </div>
      </div>

      <div className="flex w-full flex-col gap-0.5 pt-[13px]">
        <Skeleton className="h-[21px] w-full rounded-sm" />
        <Skeleton className="h-[21px] w-full rounded-sm" />
        <Skeleton className="h-[21px] w-full rounded-sm" />
      </div>

      <div className="flex items-center gap-2 pt-1">
        <Skeleton className="h-[29px] w-9 rounded-lg" />
        <Skeleton className="h-[29px] w-9 rounded-lg" />
      </div>

      <div className="mt-1 border-b border-pli-black-75" />
      <Skeleton className="mt-2 h-[21px] w-[26px] self-end rounded-sm" />
    </article>
  );
}

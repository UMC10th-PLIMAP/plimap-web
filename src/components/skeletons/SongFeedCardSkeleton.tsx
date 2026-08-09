import { Skeleton } from '@/components/ui/Skeleton';

export function SongFeedCardSkeleton() {
  return (
    <article className="rounded-[20px] bg-pli-black-85 px-4 pt-4 pb-3">
      <header className="flex items-center gap-2.5">
        <Skeleton className="size-7 rounded-full" />
        <div className="flex flex-1 items-center gap-1.5">
          <Skeleton className="h-[21px] w-25 rounded-sm" />
          <Skeleton className="h-[21px] w-9 rounded-sm" />
        </div>
        <Skeleton className="size-6 rounded-sm" />
      </header>

      <div className="flex flex-col pt-4">
        <Skeleton className="h-[21px] w-full rounded-sm" />
        <div className="flex items-center h-[29px] gap-2 pt-1 items-center justify-start">
          <Skeleton className="h-4 w-9 rounded-sm" />
          <Skeleton className="h-4 w-9 rounded-sm" />
          <Skeleton className="h-4 w-9 rounded-sm" />
        </div>
      </div>

      <div className="h-px bg-pli-black-75 my-2.5" />

      <footer className="flex items-center justify-between">
        <Skeleton className="h-[21px] w-9 rounded-sm" />
        <div className="flex items-center gap-2.5">
          <Skeleton className="size-6 rounded-sm" />
          <Skeleton className="size-[30px] rounded-full" />
        </div>
      </footer>
    </article>
  );
}

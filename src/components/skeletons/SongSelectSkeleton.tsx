import { Skeleton } from '@/components/ui/Skeleton';

const SONG_ROW_SKELETON_COUNT = 10;

export function SongSelectSkeleton() {
  return (
    <ul role="status" aria-label="노래 검색 결과 불러오는 중">
      {Array.from({ length: SONG_ROW_SKELETON_COUNT }, (_, index) => (
        <li key={index} className="flex h-[70px] items-center gap-[14px]" aria-hidden>
          <Skeleton className="size-[52px] shrink-0 rounded-sm" />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <Skeleton className="h-6 w-[177px] max-w-full rounded-sm" />
            <Skeleton className="h-[21px] w-[104px] max-w-full rounded-sm" />
          </div>
        </li>
      ))}
    </ul>
  );
}

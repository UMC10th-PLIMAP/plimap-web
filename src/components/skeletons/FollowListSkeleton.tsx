import { Skeleton } from '@/components/ui/Skeleton';

const FOLLOW_ROW_SKELETON_COUNT = 7;

type FollowListSkeletonProps = {
  count?: number;
};

export function FollowListSkeleton({ count = FOLLOW_ROW_SKELETON_COUNT }: FollowListSkeletonProps) {
  return (
    <ul
      className="flex flex-col gap-5 px-4 pt-5"
      role="status"
      aria-label="팔로우 목록 불러오는 중"
    >
      {Array.from({ length: count }, (_, index) => (
        <li key={index} className="flex h-11 items-center gap-[14px]" aria-hidden>
          <Skeleton className="size-11 shrink-0 rounded-full" />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <Skeleton className="h-[18px] w-[120px] max-w-full rounded-sm" />
            <Skeleton className="h-4 w-[72px] max-w-full rounded-sm" />
          </div>
          <Skeleton className="h-8 w-[102px] shrink-0 rounded-lg" />
        </li>
      ))}
    </ul>
  );
}

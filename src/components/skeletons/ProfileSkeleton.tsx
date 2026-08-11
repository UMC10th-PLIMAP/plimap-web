import { ProfilePinGridSkeleton } from '@/components/skeletons/ProfilePinGridSkeleton';
import { Skeleton } from '@/components/ui/Skeleton';

export function ProfileSkeleton() {
  return (
    <div role="status" aria-label="프로필 불러오는 중" className="flex flex-col">
      <section className="flex flex-col items-center">
        <Skeleton className="size-22 rounded-full" />

        <div className="pt-2.5 flex flex-col items-center">
          <Skeleton className="h-6 w-[88px] rounded-sm" />
        </div>

        <div className="pt-4 flex w-full max-w-[236px] items-center justify-between">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex flex-col items-center gap-1.5">
              <Skeleton className="w-11 h-[25px] rounded-sm" />
              <Skeleton className="w-[56px] h-[15px] rounded-sm" />
            </div>
          ))}
        </div>
      </section>
      <div className="py-5 flex items-center justify-center">
        <Skeleton className="h-[21px] w-[356px] rounded-sm" />
      </div>

      <div className="flex items-center gap-2 px-[21px] pb-3">
        <Skeleton className="h-[37px] flex-1 rounded-lg" />
        <Skeleton className="h-[37px] flex-1 rounded-lg" />
      </div>

      <div className="mt-4 mb-4 h-px bg-pli-black-50" />

      <ProfilePinGridSkeleton />
    </div>
  );
}

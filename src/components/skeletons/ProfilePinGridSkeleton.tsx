import { Skeleton } from '@/components/ui/Skeleton';

const PIN_SKELETON_COUNT = 12;

export function ProfilePinGridSkeleton() {
  return (
    <ul role="status" aria-label="핀 목록 불러오는 중" className="grid grid-cols-3 gap-1 px-[17px]">
      {Array.from({ length: PIN_SKELETON_COUNT }).map((_, index) => (
        <li key={index} className="aspect-square">
          <Skeleton className="size-full rounded-[4.5px]" />
        </li>
      ))}
    </ul>
  );
}

import { cn } from '@/lib/utils';

type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className }: SkeletonProps) {
  return <div aria-hidden className={cn('animate-pulse bg-pli-black-50', className)} />;
}

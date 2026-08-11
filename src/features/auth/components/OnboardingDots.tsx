import { cn } from '@/lib/utils';

type OnboardingDotsProps = {
  total: number;
  current: number;
  className?: string;
};

export function OnboardingDots({ total, current, className }: OnboardingDotsProps) {
  return (
    <div className={cn('flex flex-col items-center gap-0', className)}>
      <div aria-hidden className="flex h-2 items-center gap-1.5">
        {Array.from({ length: total }, (_, index) => (
          <span
            key={index}
            className={cn(
              'h-2 rounded-full transition-all duration-300 ease-out',
              index === current ? 'w-5 bg-[#d9d9d9]' : 'w-2 bg-grayscale-800',
            )}
          />
        ))}
      </div>
      <span className="sr-only" role="status">
        총 {total}페이지 중 {current + 1}페이지
      </span>
    </div>
  );
}

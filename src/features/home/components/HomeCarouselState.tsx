import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { cn } from '@/lib/utils';

type HomeCarouselStateProps = {
  description: ReactNode;
  actionLabel: string;
  actionAriaLabel?: string;
  className?: string;
  contentClassName?: string;
  role?: 'alert' | 'status';
} & ({ actionTo: string; onAction?: never } | { actionTo?: never; onAction: () => void });

export function HomeCarouselState({
  description,
  actionLabel,
  actionAriaLabel,
  actionTo,
  onAction,
  className,
  contentClassName,
  role,
}: HomeCarouselStateProps) {
  return (
    <div
      role={role}
      className={cn(
        'flex w-full items-center justify-center rounded-[20px] px-4 text-center',
        className,
      )}
    >
      <div className={cn('flex flex-col items-center gap-3', contentClassName)}>
        <p className="body-15-m text-grayscale-300">{description}</p>
        {actionTo ? (
          <Link
            to={actionTo}
            aria-label={actionAriaLabel}
            className="inline-flex min-h-6 items-center body-15-m text-white underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neon"
          >
            {actionLabel}
          </Link>
        ) : (
          <button
            type="button"
            onClick={onAction}
            aria-label={actionAriaLabel}
            className="inline-flex min-h-6 items-center body-15-m text-white underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neon"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}

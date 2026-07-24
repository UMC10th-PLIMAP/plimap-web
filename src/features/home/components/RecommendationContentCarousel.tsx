import type { Key, ReactNode } from 'react';

import { cn } from '@/lib/utils';

type RecommendationContentCarouselProps<T> = {
  items: readonly T[];
  getItemKey: (item: T) => Key;
  renderItem: (item: T) => ReactNode;
  title?: ReactNode;
  ariaLabel?: string;
  className?: string;
  titleClassName?: string;
  listClassName?: string;
  itemClassName?: string;
};

/**
 * Renders a titled, horizontally scrollable recommendation card section.
 * Consumers own the surrounding section inset and each card's intrinsic width.
 */
export function RecommendationContentCarousel<T>({
  items,
  getItemKey,
  renderItem,
  title,
  ariaLabel = '추천 콘텐츠',
  className,
  titleClassName,
  listClassName,
  itemClassName,
}: RecommendationContentCarouselProps<T>) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className={cn('flex w-full min-w-0 flex-col gap-5', className)}>
      {title ? (
        <h2
          className={cn('min-w-0 truncate text-[22px] leading-[1.4] font-medium', titleClassName)}
        >
          {title}
        </h2>
      ) : null}

      <ul
        aria-label={ariaLabel}
        className={cn(
          'flex w-full min-w-0 snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain scroll-smooth scrollbar-hide',
          listClassName,
        )}
      >
        {items.map((item) => (
          <li key={getItemKey(item)} className={cn('min-w-0 shrink-0 snap-start', itemClassName)}>
            {renderItem(item)}
          </li>
        ))}
      </ul>
    </section>
  );
}

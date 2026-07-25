import { useEffect, useRef, useState } from 'react';
import type { Key, PointerEvent, ReactNode } from 'react';

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
  showPagination?: boolean;
  itemsPerPage?: number;
};

type DragState = {
  pointerId: number;
  startX: number;
  startY: number;
  scrollLeft: number;
  isHorizontal: boolean | null;
};

const SWIPE_ANIMATION_DURATION = 360;

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
  showPagination = false,
  itemsPerPage = 1,
}: RecommendationContentCarouselProps<T>) {
  const pageSize = Math.max(1, Math.floor(itemsPerPage));
  const pageCount = Math.ceil(items.length / pageSize);
  const pages = Array.from({ length: pageCount }, (_, index) =>
    items.slice(index * pageSize, (index + 1) * pageSize),
  );
  const dragStateRef = useRef<DragState | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [activePage, setActivePage] = useState(0);

  const stopSwipeAnimation = () => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  if (items.length === 0) {
    return null;
  }

  const handlePointerDown = (event: PointerEvent<HTMLUListElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    stopSwipeAnimation();
    event.currentTarget.style.scrollSnapType = 'none';
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      scrollLeft: event.currentTarget.scrollLeft,
      isHorizontal: null,
    };
  };

  const handlePointerMove = (event: PointerEvent<HTMLUListElement>) => {
    const dragState = dragStateRef.current;
    if (dragState?.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - dragState.startX;
    const deltaY = event.clientY - dragState.startY;

    if (dragState.isHorizontal === null && Math.hypot(deltaX, deltaY) >= 4) {
      dragState.isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);
    }

    if (!dragState.isHorizontal) return;

    event.preventDefault();
    event.currentTarget.scrollLeft = dragState.scrollLeft - deltaX;
  };

  const handlePointerEnd = (event: PointerEvent<HTMLUListElement>) => {
    const dragState = dragStateRef.current;
    if (dragState?.pointerId !== event.pointerId) return;

    const list = event.currentTarget;

    if (list.hasPointerCapture(event.pointerId)) {
      list.releasePointerCapture(event.pointerId);
    }

    if (dragState.isHorizontal) {
      const maxScrollLeft = list.scrollWidth - list.clientWidth;
      const pagePositions = Array.from(list.children).map((page, index) => ({
        page: index,
        position: Math.min(
          page.getBoundingClientRect().left - list.getBoundingClientRect().left + list.scrollLeft,
          maxScrollLeft,
        ),
      }));
      const targetPage = pagePositions.reduce((nearestPage, page) =>
        Math.abs(page.position - list.scrollLeft) < Math.abs(nearestPage.position - list.scrollLeft)
          ? page
          : nearestPage,
      );

      const startScrollLeft = list.scrollLeft;
      const scrollDistance = targetPage.position - startScrollLeft;
      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const progress = Math.min((currentTime - startTime) / SWIPE_ANIMATION_DURATION, 1);
        const easedProgress = 1 - (1 - progress) ** 3;

        list.scrollLeft = startScrollLeft + scrollDistance * easedProgress;

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animate);
          return;
        }

        list.style.scrollSnapType = '';
        animationFrameRef.current = null;
        setActivePage(targetPage.page);
      };

      animationFrameRef.current = requestAnimationFrame(animate);
    } else {
      list.style.scrollSnapType = '';
    }

    dragStateRef.current = null;
  };

  return (
    <section className={cn('flex w-full min-w-0 flex-col gap-5', className)}>
      {title ? (
        <h2
          className={cn('min-w-0 truncate text-[22px] leading-[1.4] font-medium', titleClassName)}
        >
          {title}
        </h2>
      ) : null}

      <div className={cn('flex min-w-0 flex-col', showPagination && 'gap-4')}>
        <ul
          aria-label={ariaLabel}
          className={cn(
            'flex w-full min-w-0 snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain scrollbar-hide',
            'cursor-grab touch-pan-y active:cursor-grabbing',
            listClassName,
          )}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
        >
          {pages.map((page, pageIndex) => (
            <li key={pageIndex} className="w-full shrink-0 snap-start">
              <div className="flex w-full min-w-0 gap-3">
                {page.map((item) => (
                  <div key={getItemKey(item)} className={cn('min-w-0', itemClassName)}>
                    {renderItem(item)}
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ul>

        {showPagination && pageCount > 1 ? (
          <div
            aria-label={`총 ${pageCount}페이지 중 ${Math.min(activePage, pageCount - 1) + 1}페이지`}
            className="mx-auto flex h-1.5 items-center gap-2"
          >
            {Array.from({ length: pageCount }, (_, index) => (
              <span
                key={index}
                aria-hidden
                className={cn(
                  'size-1.5 rounded-full',
                  index === Math.min(activePage, pageCount - 1)
                    ? 'bg-[#d9d9d9]'
                    : 'bg-grayscale-800',
                )}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

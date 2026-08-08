import { useCallback, useEffect, useRef, useState } from 'react';
import type { Key, ReactNode } from 'react';

import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { cn } from '@/lib/utils';

type RecommendationContentCarouselProps<T> = {
  items: readonly T[];
  getItemKey: (item: T) => Key;
  renderItem: (item: T) => ReactNode;
  title?: ReactNode;
  ariaLabel?: string;
  className?: string;
  pageClassName?: string;
  itemClassName?: string;
  showPagination?: boolean;
  itemsPerPage?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
};

export function RecommendationContentCarousel<T>({
  items,
  getItemKey,
  renderItem,
  title,
  ariaLabel = '추천 콘텐츠',
  className,
  pageClassName,
  itemClassName,
  showPagination = false,
  itemsPerPage = 1,
  currentPage,
  onPageChange,
}: RecommendationContentCarouselProps<T>) {
  const pageSize = Math.max(1, Math.floor(itemsPerPage));
  const pageCount = Math.ceil(items.length / pageSize);
  const pages = Array.from({ length: pageCount }, (_, index) =>
    items.slice(index * pageSize, (index + 1) * pageSize),
  );
  const [uncontrolledPage, setUncontrolledPage] = useState(0);
  const activePage = Math.min(
    Math.max(currentPage ?? uncontrolledPage, 0),
    Math.max(pageCount - 1, 0),
  );
  const lastPageRef = useRef(activePage);
  const [initialPage] = useState(activePage);
  const initialTrackStyle =
    initialPage > 0
      ? {
          transform: `translate3d(calc(-${initialPage * 100}% - ${initialPage * 0.75}rem), 0, 0)`,
        }
      : undefined;

  if (currentPage === undefined && uncontrolledPage !== activePage) {
    setUncontrolledPage(activePage);
  }

  useEffect(() => {
    lastPageRef.current = activePage;
  }, [activePage]);

  const updateActivePage = useCallback(
    (page: number) => {
      const nextPage = Math.min(Math.max(page, 0), pageCount - 1);
      const pageChanged = lastPageRef.current !== nextPage;
      const needsUncontrolledSync = currentPage === undefined && uncontrolledPage !== nextPage;
      const needsControlledSync = currentPage !== undefined && currentPage !== nextPage;

      if (!pageChanged && !needsUncontrolledSync && !needsControlledSync) return;

      lastPageRef.current = nextPage;
      if (needsUncontrolledSync) {
        setUncontrolledPage(nextPage);
      }
      if (pageChanged || needsControlledSync) onPageChange?.(nextPage);
    },
    [currentPage, onPageChange, pageCount, uncontrolledPage],
  );

  if (items.length === 0) {
    return null;
  }

  return (
    <section className={cn('flex w-full min-w-0 flex-col gap-5', className)}>
      {title ? (
        <h2 className="min-w-0 truncate text-[22px] leading-[1.4] font-medium">{title}</h2>
      ) : null}

      <div className={cn('flex min-w-0 flex-col', showPagination && 'gap-4')}>
        <Carousel
          selectedIndex={activePage}
          onSelectedIndexChange={updateActivePage}
          snapAlignment="start"
          containScroll
          aria-label={ariaLabel}
          className="w-full min-w-0"
        >
          <CarouselContent className="ml-0 gap-3 touch-pan-y" style={initialTrackStyle}>
            {pages.map((page, pageIndex) => (
              <CarouselItem key={pageIndex} className="basis-full pl-0">
                <div className={cn('flex w-full min-w-0 gap-3', pageClassName)}>
                  {page.map((item) => (
                    <div key={getItemKey(item)} className={cn('min-w-0', itemClassName)}>
                      {renderItem(item)}
                    </div>
                  ))}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {showPagination && pageCount > 1 ? (
          <div className="flex flex-col items-center gap-0">
            <div aria-hidden className="flex h-1.5 items-center gap-2">
              {Array.from({ length: pageCount }, (_, index) => (
                <span
                  key={index}
                  className={cn(
                    'size-1.5 rounded-full',
                    index === activePage ? 'bg-[#d9d9d9]' : 'bg-grayscale-800',
                  )}
                />
              ))}
            </div>
            <span className="sr-only" role="status">
              총 {pageCount}페이지 중 {activePage + 1}페이지
            </span>
          </div>
        ) : null}
      </div>
    </section>
  );
}

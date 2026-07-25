import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Key, ReactNode } from 'react';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
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
  currentPage?: number;
  onPageChange?: (page: number) => void;
};

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener('change', updatePreference);

    return () => mediaQuery.removeEventListener('change', updatePreference);
  }, []);

  return prefersReducedMotion;
}

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
  currentPage,
  onPageChange,
}: RecommendationContentCarouselProps<T>) {
  const pageSize = Math.max(1, Math.floor(itemsPerPage));
  const pageCount = Math.ceil(items.length / pageSize);
  const pages = Array.from({ length: pageCount }, (_, index) =>
    items.slice(index * pageSize, (index + 1) * pageSize),
  );
  const [api, setApi] = useState<CarouselApi>();
  const [uncontrolledPage, setUncontrolledPage] = useState(0);
  const lastPageRef = useRef(0);
  const prefersReducedMotion = usePrefersReducedMotion();
  const activePage = Math.min(
    Math.max(currentPage ?? uncontrolledPage, 0),
    Math.max(pageCount - 1, 0),
  );
  const carouselOptions = useMemo(
    () => ({ align: 'start', containScroll: 'trimSnaps' as const }),
    [],
  );

  useEffect(() => {
    lastPageRef.current = activePage;
  }, [activePage]);

  const updateActivePage = useCallback(
    (page: number) => {
      const nextPage = Math.min(Math.max(page, 0), pageCount - 1);
      if (lastPageRef.current === nextPage) return;

      lastPageRef.current = nextPage;
      if (currentPage === undefined) {
        setUncontrolledPage(nextPage);
      }
      onPageChange?.(nextPage);
    },
    [currentPage, onPageChange, pageCount],
  );

  useEffect(() => {
    if (!api || currentPage === undefined || api.selectedScrollSnap() === activePage) return;

    api.scrollTo(activePage, prefersReducedMotion);
  }, [activePage, api, currentPage, prefersReducedMotion]);

  useEffect(() => {
    if (!api) return;

    const handleSelect = () => updateActivePage(api.selectedScrollSnap());

    handleSelect();
    api.on('reInit', handleSelect);
    api.on('select', handleSelect);

    return () => {
      api.off('reInit', handleSelect);
      api.off('select', handleSelect);
    };
  }, [api, updateActivePage]);

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

      <div className={cn('flex min-w-0 flex-col', showPagination && 'gap-4')}>
        <Carousel
          setApi={setApi}
          opts={carouselOptions}
          aria-label={ariaLabel}
          className="w-full min-w-0"
        >
          <CarouselContent className={cn('ml-0 gap-3 touch-pan-y', listClassName)}>
            {pages.map((page, pageIndex) => (
              <CarouselItem key={pageIndex} className="basis-full pl-0">
                <div className="flex w-full min-w-0 gap-3">
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

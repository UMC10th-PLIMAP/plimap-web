import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useSyncExternalStore,
} from 'react';
import type { ComponentProps, KeyboardEvent, MouseEvent } from 'react';
import useEmblaCarousel, { type UseEmblaCarouselType } from 'embla-carousel-react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

import { cn } from '@/lib/utils';

export type CarouselApi = UseEmblaCarouselType[1];

type CarouselOptions = Parameters<typeof useEmblaCarousel>[0];
type CarouselPlugins = Parameters<typeof useEmblaCarousel>[1];
type CarouselOrientation = 'horizontal' | 'vertical';

type CarouselContextValue = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: CarouselApi;
  orientation: CarouselOrientation;
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
};

type CarouselProps = ComponentProps<'div'> & {
  opts?: CarouselOptions;
  plugins?: CarouselPlugins;
  orientation?: CarouselOrientation;
  setApi?: (api: CarouselApi) => void;
};

const CarouselContext = createContext<CarouselContextValue | null>(null);

function useCarousel() {
  const context = useContext(CarouselContext);

  if (!context) {
    throw new Error('useCarousel must be used within a Carousel.');
  }

  return context;
}

function Carousel({
  orientation = 'horizontal',
  opts,
  plugins,
  setApi,
  className,
  children,
  onKeyDownCapture,
  ...props
}: CarouselProps) {
  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === 'horizontal' ? 'x' : 'y',
    },
    plugins,
  );
  const subscribeToScrollState = useCallback(
    (onStoreChange: () => void) => {
      if (!api) return () => {};

      api.on('reInit', onStoreChange);
      api.on('select', onStoreChange);

      return () => {
        api.off('reInit', onStoreChange);
        api.off('select', onStoreChange);
      };
    },
    [api],
  );
  const getScrollState = useCallback(() => {
    if (!api) return 'false:false';

    return `${api.canScrollPrev()}:${api.canScrollNext()}`;
  }, [api]);
  const scrollState = useSyncExternalStore(
    subscribeToScrollState,
    getScrollState,
    () => 'false:false',
  );
  const canScrollPrev = scrollState.startsWith('true:');
  const canScrollNext = scrollState.endsWith(':true');

  const scrollPrev = useCallback(() => api?.scrollPrev(), [api]);
  const scrollNext = useCallback(() => api?.scrollNext(), [api]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const previousKey = orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp';
      const nextKey = orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown';

      if (event.key === previousKey) {
        event.preventDefault();
        scrollPrev();
      }

      if (event.key === nextKey) {
        event.preventDefault();
        scrollNext();
      }
    },
    [orientation, scrollNext, scrollPrev],
  );
  const handleKeyDownCapture = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      onKeyDownCapture?.(event);
      if (!event.defaultPrevented) handleKeyDown(event);
    },
    [handleKeyDown, onKeyDownCapture],
  );

  useEffect(() => {
    if (api) setApi?.(api);
  }, [api, setApi]);

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api,
        orientation,
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
      }}
    >
      <div
        data-slot="carousel"
        role="region"
        aria-roledescription="carousel"
        className={cn('relative', className)}
        {...props}
        onKeyDownCapture={handleKeyDownCapture}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
}

const CarouselContent = forwardRef<HTMLDivElement, ComponentProps<'div'>>(
  ({ className, ...props }, ref) => {
    const { carouselRef, orientation } = useCarousel();

    return (
      <div ref={carouselRef} className="overflow-hidden" data-slot="carousel-content">
        <div
          ref={ref}
          className={cn('flex', orientation === 'horizontal' ? '' : 'flex-col', className)}
          {...props}
        />
      </div>
    );
  },
);

CarouselContent.displayName = 'CarouselContent';

const CarouselItem = forwardRef<HTMLDivElement, ComponentProps<'div'>>(
  ({ className, ...props }, ref) => {
    const { orientation } = useCarousel();

    return (
      <div
        ref={ref}
        role="group"
        aria-roledescription="slide"
        data-slot="carousel-item"
        className={cn(
          'min-w-0 shrink-0 grow-0 basis-full',
          orientation === 'horizontal' ? '' : 'pt-4',
          className,
        )}
        {...props}
      />
    );
  },
);

CarouselItem.displayName = 'CarouselItem';

const CarouselPrevious = forwardRef<HTMLButtonElement, ComponentProps<'button'>>(
  ({ className, type = 'button', onClick, ...props }, ref) => {
    const { orientation, scrollPrev, canScrollPrev } = useCarousel();
    const handleClick = useCallback(
      (event: MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (!event.defaultPrevented) scrollPrev();
      },
      [onClick, scrollPrev],
    );

    return (
      <button
        ref={ref}
        type={type}
        aria-label="이전 슬라이드"
        disabled={!canScrollPrev}
        className={cn(
          'absolute flex size-8 items-center justify-center rounded-full border border-grayscale-700 disabled:opacity-50',
          orientation === 'horizontal'
            ? 'top-1/2 -left-12 -translate-y-1/2'
            : '-top-12 left-1/2 -translate-x-1/2 rotate-90',
          className,
        )}
        {...props}
        onClick={handleClick}
      >
        <ArrowLeft className="size-4" aria-hidden />
      </button>
    );
  },
);

CarouselPrevious.displayName = 'CarouselPrevious';

const CarouselNext = forwardRef<HTMLButtonElement, ComponentProps<'button'>>(
  ({ className, type = 'button', onClick, ...props }, ref) => {
    const { orientation, scrollNext, canScrollNext } = useCarousel();
    const handleClick = useCallback(
      (event: MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (!event.defaultPrevented) scrollNext();
      },
      [onClick, scrollNext],
    );

    return (
      <button
        ref={ref}
        type={type}
        aria-label="다음 슬라이드"
        disabled={!canScrollNext}
        className={cn(
          'absolute flex size-8 items-center justify-center rounded-full border border-grayscale-700 disabled:opacity-50',
          orientation === 'horizontal'
            ? 'top-1/2 -right-12 -translate-y-1/2'
            : '-bottom-12 left-1/2 -translate-x-1/2 rotate-90',
          className,
        )}
        {...props}
        onClick={handleClick}
      >
        <ArrowRight className="size-4" aria-hidden />
      </button>
    );
  },
);

CarouselNext.displayName = 'CarouselNext';

export {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselOptions,
  type CarouselPlugins,
};

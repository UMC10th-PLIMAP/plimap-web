import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

import NextIcon from '@/assets/icons/next.svg?react';
import tutorialImage1 from '@/assets/images/onboarding/tutorial-1.png';
import tutorialImage2 from '@/assets/images/onboarding/tutorial-2.png';
import tutorialImage3 from '@/assets/images/onboarding/tutorial-3.png';
import tutorialImage4 from '@/assets/images/onboarding/tutorial-4.png';
import tutorialImage5 from '@/assets/images/onboarding/tutorial-5.png';
import { Carousel, CarouselContent, CarouselItem, useCarousel } from '@/components/ui/carousel';
import { OnboardingDots } from '@/features/auth/components/OnboardingDots';
import { cn } from '@/lib/utils';

type TutorialSlide = {
  heading: string;
  image: string;
};

export const TUTORIAL_SLIDES: TutorialSlide[] = [
  { heading: '지도로 연결되는 우리들의 음악 취향', image: tutorialImage1 },
  { heading: '지도 위에 등록된 노래를 한눈에', image: tutorialImage2 },
  { heading: '지금 내 감정을 담아 핀을 남겨보세요', image: tutorialImage3 },
  {
    heading: '500m 반경 내에 핀을 등록하고,\n다른 사람들의 핀도 확인해보세요',
    image: tutorialImage4,
  },
  { heading: '취향이 비슷한 사람을 발견하고\n친구를 맺어볼까요?', image: tutorialImage5 },
];

const IMAGE_ASPECT_WIDTH = 402;
const IMAGE_ASPECT_HEIGHT = 547;
const NAV_BUTTON_BOTTOM_OFFSET = 255;
const NAV_BUTTON_SIDE_OFFSET = -5;
const BOTTOM_GRADIENT_HEIGHT = 64;

type FittedImageBox = {
  containerWidth: number;
  renderedWidth: number;
  renderedHeight: number;
};

const INITIAL_FITTED_IMAGE_BOX: FittedImageBox = {
  containerWidth: IMAGE_ASPECT_WIDTH,
  renderedWidth: IMAGE_ASPECT_WIDTH,
  renderedHeight: IMAGE_ASPECT_HEIGHT,
};

function useFittedImageBox(containerRef: RefObject<HTMLDivElement | null>) {
  const [box, setBox] = useState<FittedImageBox>(INITIAL_FITTED_IMAGE_BOX);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateBox = (containerWidth: number, containerHeight: number) => {
      if (containerWidth <= 0 || containerHeight <= 0) return;
      const aspect = IMAGE_ASPECT_WIDTH / IMAGE_ASPECT_HEIGHT;
      let renderedWidth = Math.min(containerWidth, IMAGE_ASPECT_WIDTH);
      let renderedHeight = renderedWidth / aspect;
      if (renderedHeight > containerHeight) {
        renderedHeight = containerHeight;
        renderedWidth = renderedHeight * aspect;
      }
      setBox({ containerWidth, renderedWidth, renderedHeight });
    };

    updateBox(el.clientWidth, el.clientHeight);

    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      updateBox(entry.contentRect.width, entry.contentRect.height);
    });
    observer.observe(el);

    return () => observer.disconnect();
  }, [containerRef]);

  return box;
}

type TutorialNavButtonProps = {
  direction: 'prev' | 'next';
  bottomOffset: number;
  sideOffset: number;
};

function TutorialNavButton({ direction, bottomOffset, sideOffset }: TutorialNavButtonProps) {
  const { scrollPrev, scrollNext, canScrollPrev, canScrollNext } = useCarousel();
  const isPrev = direction === 'prev';

  return (
    <button
      type="button"
      aria-label={isPrev ? '이전 화면' : '다음 화면'}
      disabled={isPrev ? !canScrollPrev : !canScrollNext}
      onClick={isPrev ? scrollPrev : scrollNext}
      style={{ bottom: bottomOffset, [isPrev ? 'left' : 'right']: sideOffset }}
      className="absolute flex size-7 items-center justify-center text-grayscale-100 disabled:pointer-events-none"
    >
      <NextIcon className={cn('size-7', isPrev && 'scale-x-[-1]')} aria-hidden />
    </button>
  );
}

type TutorialSlideshowProps = {
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
  className?: string;
};

/** 온보딩 튜토리얼(로그인 전)과 설정 > 서비스 이용 가이드가 공유하는 스와이프 슬라이드쇼. */
export function TutorialSlideshow({
  activeIndex,
  onActiveIndexChange,
  className,
}: TutorialSlideshowProps) {
  const carouselBoxRef = useRef<HTMLDivElement>(null);
  const { containerWidth, renderedWidth, renderedHeight } = useFittedImageBox(carouselBoxRef);
  const imageScale = renderedHeight / IMAGE_ASPECT_HEIGHT;
  const navSideOffset = (containerWidth - renderedWidth) / 2 + NAV_BUTTON_SIDE_OFFSET * imageScale;
  const navBottomOffset = NAV_BUTTON_BOTTOM_OFFSET * imageScale;
  const bottomGradientHeight = BOTTOM_GRADIENT_HEIGHT * imageScale;

  return (
    <div className={cn('flex min-h-0 flex-1 flex-col overflow-hidden', className)}>
      <div className="flex shrink-0 flex-col items-center gap-6 pt-[38px]">
        <OnboardingDots total={TUTORIAL_SLIDES.length} current={activeIndex} />
        <div className="flex min-h-[102px] items-center px-3.5">
          <p className="whitespace-pre-line text-center body-24-m text-grayscale-0">
            {TUTORIAL_SLIDES[activeIndex].heading}
          </p>
        </div>
      </div>

      <div ref={carouselBoxRef} className="mt-[24px] min-h-0 w-full max-h-[547px] min-w-0 flex-1">
        <Carousel
          selectedIndex={activeIndex}
          onSelectedIndexChange={onActiveIndexChange}
          snapAlignment="start"
          containScroll
          aria-label="서비스 이용 가이드"
          className="h-full w-full"
        >
          <CarouselContent className="h-full ml-0 touch-pan-y">
            {TUTORIAL_SLIDES.map((slide, index) => (
              <CarouselItem
                key={index}
                className="flex h-full basis-full items-end justify-center pl-0"
              >
                <img
                  src={slide.image}
                  alt=""
                  width={IMAGE_ASPECT_WIDTH}
                  height={IMAGE_ASPECT_HEIGHT}
                  className="h-auto max-h-full w-auto max-w-full"
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-b from-pli-black-85/0 to-pli-black-85 to-[74.219%]"
            style={{ height: bottomGradientHeight }}
          />
          <TutorialNavButton
            direction="prev"
            bottomOffset={navBottomOffset}
            sideOffset={navSideOffset}
          />
          <TutorialNavButton
            direction="next"
            bottomOffset={navBottomOffset}
            sideOffset={navSideOffset}
          />
        </Carousel>
      </div>
    </div>
  );
}

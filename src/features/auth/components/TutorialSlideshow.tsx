import type { CSSProperties } from 'react';

import NextIcon from '@/assets/icons/next.svg?react';
import tutorialImage1 from '@/assets/images/onboarding/tutorial-1.webp';
import tutorialImage2 from '@/assets/images/onboarding/tutorial-2.webp';
import tutorialImage3 from '@/assets/images/onboarding/tutorial-3.webp';
import tutorialImage4 from '@/assets/images/onboarding/tutorial-4.webp';
import tutorialImage5 from '@/assets/images/onboarding/tutorial-5.webp';
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
const NAV_BUTTON_HALF_SIZE = '0.875rem';
const BOTTOM_GRADIENT_HEIGHT = 64;
const TUTORIAL_IMAGE_WIDTH_EXPR = `min(100cqw, ${IMAGE_ASPECT_WIDTH}px, calc(100cqh * ${IMAGE_ASPECT_WIDTH} / ${IMAGE_ASPECT_HEIGHT}))`;
const NAV_BUTTON_BOTTOM_EXPR = `calc(var(--tutorial-image-w) * ${NAV_BUTTON_BOTTOM_OFFSET / IMAGE_ASPECT_WIDTH})`;
const NAV_BUTTON_SIDE_EXPR = `max(0px, calc((100cqw - var(--tutorial-image-w)) / 4 - ${NAV_BUTTON_HALF_SIZE}))`;
const BOTTOM_GRADIENT_HEIGHT_EXPR = `calc(var(--tutorial-image-w) * ${BOTTOM_GRADIENT_HEIGHT / IMAGE_ASPECT_WIDTH})`;

type TutorialNavButtonProps = {
  direction: 'prev' | 'next';
};

function TutorialNavButton({ direction }: TutorialNavButtonProps) {
  const { scrollPrev, scrollNext, canScrollPrev, canScrollNext } = useCarousel();
  const isPrev = direction === 'prev';

  return (
    <button
      type="button"
      aria-label={isPrev ? '이전 화면' : '다음 화면'}
      disabled={isPrev ? !canScrollPrev : !canScrollNext}
      onClick={isPrev ? scrollPrev : scrollNext}
      style={{ bottom: NAV_BUTTON_BOTTOM_EXPR, [isPrev ? 'left' : 'right']: NAV_BUTTON_SIDE_EXPR }}
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

export function TutorialSlideshow({
  activeIndex,
  onActiveIndexChange,
  className,
}: TutorialSlideshowProps) {
  return (
    <div className={cn('flex min-h-0 flex-1 flex-col overflow-hidden', className)}>
      <div className="flex shrink-0 flex-col items-center gap-[clamp(8px,3dvh,24px)] pt-[clamp(12px,5dvh,38px)]">
        <OnboardingDots total={TUTORIAL_SLIDES.length} current={activeIndex} />
        <div className="flex min-h-[68px] items-end px-3.5">
          <p className="whitespace-pre-line text-center body-24-m text-grayscale-0">
            {TUTORIAL_SLIDES[activeIndex].heading}
          </p>
        </div>
      </div>

      <div
        className="mt-4 min-h-0 w-full min-w-0 flex-1 [container-type:size]"
        style={
          {
            '--tutorial-image-w': TUTORIAL_IMAGE_WIDTH_EXPR,
            maxHeight: `min(${IMAGE_ASPECT_HEIGHT}px, calc(100vw * ${IMAGE_ASPECT_HEIGHT} / ${IMAGE_ASPECT_WIDTH}))`,
          } as CSSProperties
        }
      >
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
                  className="block h-auto"
                  style={{
                    width: 'var(--tutorial-image-w)',
                    aspectRatio: `${IMAGE_ASPECT_WIDTH} / ${IMAGE_ASPECT_HEIGHT}`,
                  }}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-b from-pli-black-85/0 to-pli-black-85 to-[74.219%]"
            style={{ height: BOTTOM_GRADIENT_HEIGHT_EXPR }}
          />
          <TutorialNavButton direction="prev" />
          <TutorialNavButton direction="next" />
        </Carousel>
      </div>
    </div>
  );
}

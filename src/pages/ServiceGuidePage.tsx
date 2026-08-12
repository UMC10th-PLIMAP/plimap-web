import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { useNavigate } from 'react-router-dom';

import { TopBar } from '@/components/ui/TopBar';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { OnboardingDots } from '@/features/auth/components/OnboardingDots';
import { TUTORIAL_SLIDES } from '@/features/auth/components/TutorialSlideshow';

const IMAGE_ASPECT_WIDTH = 402;
const IMAGE_ASPECT_HEIGHT = 547;

type FittedImageBox = {
  renderedWidth: number;
  renderedHeight: number;
};

const INITIAL_FITTED_IMAGE_BOX: FittedImageBox = {
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
      setBox({ renderedWidth, renderedHeight });
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

export default function ServiceGuidePage() {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselBoxRef = useRef<HTMLDivElement>(null);
  useFittedImageBox(carouselBoxRef);

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-pli-black-85 pt-[env(safe-area-inset-top)]">
      <TopBar title="서비스 이용 가이드" titleWeight="medium" onBack={() => navigate(-1)} />

      <div className="flex min-h-0 flex-1 flex-col gap-8 overflow-hidden pt-[38px]">
        <div ref={carouselBoxRef} className="min-h-0 w-full max-h-[547px] min-w-0 flex-1">
          <Carousel
            selectedIndex={activeIndex}
            onSelectedIndexChange={setActiveIndex}
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
          </Carousel>
        </div>

        <div className="flex shrink-0 flex-col items-center gap-2 pb-[calc(env(safe-area-inset-bottom)+24px)]">
          <OnboardingDots total={TUTORIAL_SLIDES.length} current={activeIndex} />
          <div className="flex min-h-[70px] items-center px-3.5">
            <p className="whitespace-pre-line text-center body-24-m text-grayscale-0">
              {TUTORIAL_SLIDES[activeIndex].heading}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

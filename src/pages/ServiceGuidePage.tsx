import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { TopBar } from '@/components/ui/TopBar';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { OnboardingDots } from '@/features/auth/components/OnboardingDots';
import { TUTORIAL_SLIDES } from '@/features/auth/components/TutorialSlideshow';

const IMAGE_ASPECT_WIDTH = 402;
const IMAGE_ASPECT_HEIGHT = 547;

export default function ServiceGuidePage() {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-pli-black-85 pt-[env(safe-area-inset-top)]">
      <TopBar title="서비스 이용 가이드" titleWeight="medium" onBack={() => navigate(-1)} />

      <div className="flex min-h-0 flex-1 flex-col gap-8 overflow-hidden pt-[38px]">
        <div className="min-h-0 w-full max-h-[547px] min-w-0 flex-1">
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

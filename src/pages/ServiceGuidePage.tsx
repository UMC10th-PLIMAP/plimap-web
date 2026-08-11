import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { TopBar } from '@/components/ui/TopBar';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { OnboardingDots } from '@/features/auth/components/OnboardingDots';
import { TUTORIAL_SLIDES } from '@/features/auth/components/TutorialSlideshow';

export default function ServiceGuidePage() {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="flex min-h-screen flex-col bg-pli-black-85 pt-[env(safe-area-inset-top)]">
      <TopBar
        title="서비스 이용 가이드"
        titleWeight="medium"
        onBack={() => navigate(-1)}
        onClose={() => navigate(-1)}
      />

      <div className="relative mx-auto mt-[70px] aspect-[296/494] w-full max-w-[296px] overflow-hidden rounded-t-3xl">
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
              <CarouselItem key={index} className="h-full basis-full pl-0">
                <img src={slide.image} alt="" className="h-full w-full object-cover object-top" />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-pli-black-85/0 to-pli-black-85"
        />
      </div>

      <div className="mt-7 flex flex-col items-center gap-6 px-3.5 pb-10">
        <OnboardingDots total={TUTORIAL_SLIDES.length} current={activeIndex} />
        <p className="whitespace-pre-line text-center body-24-m text-grayscale-0">
          {TUTORIAL_SLIDES[activeIndex].heading}
        </p>
      </div>
    </div>
  );
}

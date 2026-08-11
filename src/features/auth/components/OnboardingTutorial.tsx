import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { TutorialSlideshow } from '@/features/auth/components/TutorialSlideshow';

type OnboardingTutorialProps = {
  onFinish: () => void;
};

export function OnboardingTutorial({ onFinish }: OnboardingTutorialProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="flex h-full flex-col overflow-hidden bg-pli-black-85 pt-[env(safe-area-inset-top)]">
      <TutorialSlideshow activeIndex={activeIndex} onActiveIndexChange={setActiveIndex} />

      <div className="sticky bottom-0 mt-auto flex shrink-0 flex-col items-center px-[10px] pb-[52px]">
        <Button
          variant="cta"
          size="cta"
          type="button"
          onClick={onFinish}
          className="w-full bg-gradient-neon"
        >
          <span className="head-20-sb text-grayscale-1200">바로 시작하기</span>
        </Button>
      </div>
    </div>
  );
}

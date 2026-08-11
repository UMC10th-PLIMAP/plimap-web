import { useEffect } from 'react';

import PlimapLogo from '@/assets/logo/plimap-logo.svg?react';
import PlimapSymbol from '@/assets/logo/plimap-symbol.svg?react';

const SPLASH_DURATION_MS = 1200;

type OnboardingSplashProps = {
  onComplete: () => void;
};

export function OnboardingSplash({ onComplete }: OnboardingSplashProps) {
  useEffect(() => {
    const timer = setTimeout(onComplete, SPLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="flex h-full min-h-screen flex-col items-center justify-center gap-[42px] bg-pli-black-100 pt-[env(safe-area-inset-top)]">
      <PlimapSymbol />
      <PlimapLogo />
    </div>
  );
}

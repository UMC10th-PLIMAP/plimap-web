import { useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import lottie from 'lottie-web/build/player/lottie_svg';

import { completeOnboarding } from '@/api/auth';
import ArrowRightIcon from '@/assets/icons/arrow-right.svg?react';
import UserPlaceholderIcon from '@/assets/icons/user-placeholder.svg?react';
import confettiRaw from '@/assets/lottie/welcome-confetti.json?raw';
import { Button } from '@/components/ui/button';
import { RequestErrorScreen } from '@/components/ui/RequestErrorScreen';
import { memberQueryKeys } from '@/features/profile/queries/memberQueryKeys';
import { useOnboardingStore } from '@/store/onboardingStore';

const CONFETTI_PRESERVE_ASPECT_RATIO = 'xMidYMid slice';
const CONFETTI_FADE_OUT_MS = 1000;
function ConfettiLottie({ data }: { data: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const animation = lottie.loadAnimation({
      container,
      renderer: 'svg',
      loop: false,
      autoplay: true,
      animationData: JSON.parse(data),
      rendererSettings: { preserveAspectRatio: CONFETTI_PRESERVE_ASPECT_RATIO },
    });

    const fadeTimer = window.setTimeout(() => setIsFadingOut(true), CONFETTI_FADE_OUT_MS);

    return () => {
      window.clearTimeout(fadeTimer);
      animation.destroy();
    };
  }, [data]);

  return (
    <div
      ref={containerRef}
      className="size-full transition-opacity duration-500 ease-out"
      style={{ opacity: isFadingOut ? 0 : 1 }}
    />
  );
}

export default function WelcomePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const nickname = useOnboardingStore((state) => state.nickname);
  const profileImageFile = useOnboardingStore((state) => state.profileImageFile);
  const profileImageUrl = useOnboardingStore((state) => state.profileImageUrl);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestError, setRequestError] = useState<unknown>(null);
  const localImageUrl = useMemo(
    () => (profileImageFile ? URL.createObjectURL(profileImageFile) : null),
    [profileImageFile],
  );
  // 방금 업로드한 File이 메모리에 있으면 즉시 표시하고, 새로고침 이후엔 서버 URL로 대체
  const profileImageSrc = localImageUrl ?? profileImageUrl;

  useEffect(() => {
    return () => {
      if (localImageUrl) URL.revokeObjectURL(localImageUrl);
    };
  }, [localImageUrl]);

  const handleStart = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await completeOnboarding(nickname);
      await queryClient.invalidateQueries({ queryKey: memberQueryKeys.me() });
      useOnboardingStore.getState().reset();
      navigate('/app', { replace: true });
    } catch (error) {
      setRequestError(error);
      setIsSubmitting(false);
    }
  };

  if (requestError) {
    return (
      <RequestErrorScreen
        error={requestError}
        onRetry={() => {
          setRequestError(null);
          void handleStart();
        }}
      />
    );
  }

  return (
    <div className="relative flex h-full min-h-screen flex-col overflow-hidden bg-pli-black-100">
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        <ConfettiLottie data={confettiRaw} />
      </div>

      <div className="relative z-10 flex flex-1 flex-col items-center px-4 pt-[110px]">
        <h1 className="head-28-m text-grayscale-0">환영합니다!</h1>
        <p className="body-17-m mt-[10px] text-grayscale-300">
          나만의 플레이리스트를 만들어보세요 👋
        </p>

        <div className="relative mt-[52px] flex size-[236px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-pli-black-75">
          {profileImageSrc ? (
            <img src={profileImageSrc} alt="프로필 이미지" className="size-full object-cover" />
          ) : (
            <UserPlaceholderIcon className="size-[140px] text-pli-black-50" />
          )}
        </div>

        <p className="head-20-m mt-[16px] text-grayscale-100">{nickname}</p>
      </div>

      <div className="relative z-10 flex flex-col items-center px-[10px] pb-[52px]">
        <Button
          variant="cta"
          size="cta"
          className="relative w-full bg-gradient-neon"
          onClick={handleStart}
          disabled={isSubmitting}
        >
          <span className="head-20-sb text-grayscale-1200">시작하기</span>
          <ArrowRightIcon className="absolute right-7 size-7 text-[#000000]" aria-hidden />
        </Button>
      </div>
    </div>
  );
}

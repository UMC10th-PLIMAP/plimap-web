import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { ApiError } from '@/api/client';
import GoogleIcon from '@/assets/icons/google.svg?react';
import KakaoIcon from '@/assets/icons/kakao.svg?react';
import PlimapLogo from '@/assets/logo/plimap-logo.svg?react';
import { FullScreenError } from '@/components/ui/FullScreenError';
import { Button } from '@/components/ui/button';
import { AccountSanctionModal } from '@/features/auth/components/AccountSanctionModal';
import { DemoLoginNoticeDialog } from '@/features/auth/components/DemoLoginNoticeDialog';
import { OnboardingSplash } from '@/features/auth/components/OnboardingSplash';
import { OnboardingTutorial } from '@/features/auth/components/OnboardingTutorial';
import { useDemoLogin } from '@/features/auth/hooks/useDemoLogin';
import type { AccountSanctionInfo } from '@/features/auth/types';
import { clearDemoSession } from '@/features/auth/utils/demoSession';
import { buildApiUrl } from '@/config/api';
import { useToast } from '@/hooks/useToast';
import { AnalyticsEvent, track } from '@/lib/analytics';

export type LoginPageLocationState = {
  oauthError?: boolean;
  accountSanction?: AccountSanctionInfo;
};

const FRONTEND_ORIGIN = window.location.origin;
const KAKAO_LOGIN_URL = buildApiUrl(`/oauth/authorization/kakao?frontendOrigin=${FRONTEND_ORIGIN}`);
const GOOGLE_LOGIN_URL = buildApiUrl(
  `/oauth/authorization/google?frontendOrigin=${FRONTEND_ORIGIN}`,
);

type OAuthProvider = 'kakao' | 'google';

const OAUTH_LOGIN_URL: Record<OAuthProvider, string> = {
  kakao: KAKAO_LOGIN_URL,
  google: GOOGLE_LOGIN_URL,
};

const DEMO_LOGIN_FAILED_MESSAGE = '체험 계정 로그인에 실패했어요. 잠시 후 다시 시도해주세요.';

// 로그인 화면 진입 시 항상 스플래시 → 튜토리얼 → 로그인 버튼 순서로 노출한다.
type LoginStep = 'splash' | 'tutorial' | 'credentials';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const demoLoginMutation = useDemoLogin();
  const locationState = location.state as LoginPageLocationState | null;
  const accountSanction = locationState?.accountSanction ?? null;
  const [step, setStep] = useState<LoginStep>(() =>
    locationState?.oauthError || accountSanction ? 'credentials' : 'splash',
  );
  const [isSanctionModalOpen, setIsSanctionModalOpen] = useState(accountSanction !== null);
  const [isDemoNoticeOpen, setIsDemoNoticeOpen] = useState(false);
  const hasOAuthError = locationState?.oauthError === true;

  if (hasOAuthError) {
    return (
      <FullScreenError
        variant="unknown"
        onAction={() => navigate('.', { replace: true, state: null })}
      />
    );
  }

  const handleCloseSanctionModal = () => {
    setIsSanctionModalOpen(false);
    navigate('.', { replace: true, state: null });
  };

  const handleOAuthClick = (provider: OAuthProvider) => () => {
    clearDemoSession();
    track(AnalyticsEvent.LoginClick, { method: provider });
    window.location.href = OAUTH_LOGIN_URL[provider];
  };

  const handleDemoNoticeClose = () => {
    setIsDemoNoticeOpen(false);
    demoLoginMutation.mutate(undefined, {
      onSuccess: () => navigate('/app', { replace: true }),
      onError: (error) => {
        toast.error(error instanceof ApiError ? error.message : DEMO_LOGIN_FAILED_MESSAGE);
      },
    });
  };

  if (step === 'splash') {
    return <OnboardingSplash onComplete={() => setStep('tutorial')} />;
  }

  if (step === 'tutorial') {
    return <OnboardingTutorial onFinish={() => setStep('credentials')} />;
  }

  return (
    <div className="flex h-full min-h-screen flex-col items-center bg-pli-black-100 px-[39px]">
      <div className="flex-[1.7]" />
      <PlimapLogo />
      <p className="mt-4 body-18-r text-center text-grayscale-0">
        지도 위에서 발견하는 새로운 플레이리스트
      </p>
      <div className="flex-1" />

      <div className="flex w-full flex-col items-center gap-3">
        <Button
          variant="kakao"
          size="social"
          onClick={handleOAuthClick('kakao')}
          className="w-full gap-3"
        >
          <KakaoIcon className="size-6 shrink-0" />
          카카오로 시작하기
        </Button>
        <Button
          variant="google"
          size="social"
          onClick={handleOAuthClick('google')}
          className="w-full gap-3"
        >
          <GoogleIcon className="size-6 shrink-0" />
          Google로 시작하기
        </Button>
        <button
          type="button"
          onClick={() => setIsDemoNoticeOpen(true)}
          disabled={demoLoginMutation.isPending}
          className="mt-2 cursor-pointer body-15-m text-grayscale-300 underline underline-offset-2 disabled:cursor-not-allowed disabled:text-grayscale-700"
        >
          {demoLoginMutation.isPending ? '접속 중...' : '로그인 없이 사용해보기'}
        </button>
      </div>

      <div className="flex flex-1 shrink-0 items-start justify-center pt-5">
        <p className="etc-13-r whitespace-pre-line text-center text-grayscale-500">
          {'회원가입 시 PLIMAP의 \n개인정보 처리방침 및 이용약관에 동의하게 됩니다'}
        </p>
      </div>

      <AccountSanctionModal
        open={isSanctionModalOpen}
        sanction={accountSanction}
        onClose={handleCloseSanctionModal}
      />
      <DemoLoginNoticeDialog open={isDemoNoticeOpen} onClose={handleDemoNoticeClose} />
    </div>
  );
}

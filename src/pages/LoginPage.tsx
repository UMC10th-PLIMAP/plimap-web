import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import GoogleIcon from '@/assets/icons/google.svg?react';
import KakaoIcon from '@/assets/icons/kakao.svg?react';
import PlimapLogo from '@/assets/logo/plimap-logo.svg?react';
import { FullScreenError } from '@/components/ui/FullScreenError';
import { Button } from '@/components/ui/button';
import { OnboardingSplash } from '@/features/auth/components/OnboardingSplash';
import { OnboardingTutorial } from '@/features/auth/components/OnboardingTutorial';

export type LoginPageLocationState = {
  oauthError?: boolean;
};

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

if (!API_BASE_URL) {
  console.error('VITE_API_BASE_URL is missing in environment variables');
}
const FRONTEND_ORIGIN = window.location.origin;
const KAKAO_LOGIN_URL = `${API_BASE_URL}/oauth/authorization/kakao?frontendOrigin=${FRONTEND_ORIGIN}`;
const GOOGLE_LOGIN_URL = `${API_BASE_URL}/oauth/authorization/google?frontendOrigin=${FRONTEND_ORIGIN}`;

type OAuthProvider = 'kakao' | 'google';

const OAUTH_LOGIN_URL: Record<OAuthProvider, string> = {
  kakao: KAKAO_LOGIN_URL,
  google: GOOGLE_LOGIN_URL,
};

// 로그인 화면 진입 시 항상 스플래시 → 튜토리얼 → 로그인 버튼 순서로 노출한다.
type LoginStep = 'splash' | 'tutorial' | 'credentials';

function OAuthSpinner() {
  return (
    <span
      className="size-6 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
      aria-hidden
    />
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  // OAuth 실패로 돌아온 경우에는 에러를 바로 보여줘야 하므로 스플래시/튜토리얼을 건너뛴다.
  const [step, setStep] = useState<LoginStep>(() => {
    const state = location.state as LoginPageLocationState | null;
    return state?.oauthError ? 'credentials' : 'splash';
  });
  const [loadingProvider, setLoadingProvider] = useState<OAuthProvider | null>(null);
  const hasOAuthError = (location.state as LoginPageLocationState | null)?.oauthError === true;

  // 뒤로가기로 돌아왔을 때 로딩 스피너 도는 현상 방지
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) setLoadingProvider(null);
    };

    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  if (hasOAuthError) {
    return (
      <FullScreenError
        variant="unknown"
        onAction={() => navigate('.', { replace: true, state: null })}
      />
    );
  }

  const handleOAuthClick = (provider: OAuthProvider) => () => {
    setLoadingProvider(provider);
    window.location.href = OAUTH_LOGIN_URL[provider];
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
          disabled={loadingProvider !== null}
          aria-busy={loadingProvider === 'kakao'}
          onClick={handleOAuthClick('kakao')}
          className="w-full gap-3"
        >
          {loadingProvider === 'kakao' ? (
            <OAuthSpinner />
          ) : (
            <KakaoIcon className="size-6 shrink-0" />
          )}
          카카오로 시작하기
        </Button>
        <Button
          variant="google"
          size="social"
          disabled={loadingProvider !== null}
          aria-busy={loadingProvider === 'google'}
          onClick={handleOAuthClick('google')}
          className="w-full gap-3"
        >
          {loadingProvider === 'google' ? (
            <OAuthSpinner />
          ) : (
            <GoogleIcon className="size-6 shrink-0" />
          )}
          Google로 시작하기
        </Button>
      </div>

      <div className="flex flex-1 shrink-0 items-start justify-center pt-5">
        <p className="etc-13-r whitespace-pre-line text-center text-grayscale-500">
          {'회원가입 시 PLIMAP의 \n개인정보 처리방침 및 이용약관에 동의하게 됩니다'}
        </p>
      </div>
    </div>
  );
}

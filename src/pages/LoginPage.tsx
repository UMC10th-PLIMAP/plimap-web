import { useState } from 'react';

import GoogleIcon from '@/assets/icons/google.svg?react';
import KakaoIcon from '@/assets/icons/kakao.svg?react';
import PlimapLogo from '@/assets/logo/plimap-logo.svg?react';
import { Button } from '@/components/ui/button';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

if (!API_BASE_URL) {
  console.error('VITE_API_BASE_URL is missing in environment variables');
}

const KAKAO_LOGIN_URL = `${API_BASE_URL}/oauth/authorization/kakao`;
const GOOGLE_LOGIN_URL = `${API_BASE_URL}/oauth/authorization/google`;

type OAuthProvider = 'kakao' | 'google';

const OAUTH_LOGIN_URL: Record<OAuthProvider, string> = {
  kakao: KAKAO_LOGIN_URL,
  google: GOOGLE_LOGIN_URL,
};

function OAuthSpinner() {
  return (
    <span
      className="size-6 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
      aria-hidden
    />
  );
}

export default function LoginPage() {
  const [loadingProvider, setLoadingProvider] = useState<OAuthProvider | null>(null);

  const handleOAuthClick = (provider: OAuthProvider) => () => {
    setLoadingProvider(provider);
    window.location.href = OAUTH_LOGIN_URL[provider];
  };

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

      <div className="flex h-[176px] shrink-0 items-start justify-center pt-5">
        <p className="etc-13-r whitespace-pre-line text-center text-grayscale-500">
          {'회원가입 시 PLIMAP의 \n개인정보 처리방침 및 이용약관에 동의하게 됩니다'}
        </p>
      </div>
    </div>
  );
}

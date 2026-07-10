import AppleIcon from '@/assets/icons/apple.svg?react';
import GoogleIcon from '@/assets/icons/google.svg?react';
import KakaoIcon from '@/assets/icons/kakao.svg?react';
import PlimapLogo from '@/assets/logo/plimap-logo.svg?react';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const handleKakaoLogin = () => {
    // TODO: 카카오 로그인 연동
  };

  const handleGoogleLogin = () => {
    // TODO: 구글 로그인 연동
  };

  const handleAppleLogin = () => {
    // TODO: 애플 로그인 연동
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
        <Button variant="kakao" size="social" className="w-full gap-3" onClick={handleKakaoLogin}>
          <KakaoIcon className="size-6" />
          카카오로 시작하기
        </Button>
        <Button variant="google" size="social" className="w-full gap-3" onClick={handleGoogleLogin}>
          <GoogleIcon className="size-6" />
          Google로 시작하기
        </Button>
        <Button variant="apple" size="social" className="w-full gap-3" onClick={handleAppleLogin}>
          <AppleIcon className="size-6" />
          Apple로 시작하기
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

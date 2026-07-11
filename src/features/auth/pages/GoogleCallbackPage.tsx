import { getAuthCodeFromUrl } from '@/features/auth/utils/oauth';

export default function GoogleCallbackPage() {
  const { code, error } = getAuthCodeFromUrl(window.location.search);

  // TODO: 백엔드 POST /api/v1/auth/google API 준비되면 code 전달하는 로직 추가
  // 위의 로직 및 로딩 화면/예외 케이스 발생 시 토스트 메시지 등은 이슈 #18 작업 시 함께 처리 예정

  return (
    <div className="flex h-full min-h-screen flex-col items-center justify-center gap-3 bg-pli-black-100 px-[39px] text-center">
      {error && (
        <>
          <p className="body-18-r text-red">Google 로그인이 취소되었거나 실패했어요.</p>
          <p className="etc-13-r text-grayscale-500">{error}</p>
        </>
      )}
      {!error && code && (
        <>
          <p className="body-18-r text-grayscale-0">인가코드를 받았어요.</p>
          <p className="etc-13-r break-all text-grayscale-500">{code}</p>
        </>
      )}
      {!error && !code && (
        <p className="body-18-r text-grayscale-0">인가코드를 확인하는 중이에요...</p>
      )}
    </div>
  );
}

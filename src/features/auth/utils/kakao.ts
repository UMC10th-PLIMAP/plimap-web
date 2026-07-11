const KAKAO_SDK_SRC = 'https://developers.kakao.com/sdk/js/kakao.js';
const KAKAO_SDK_SCRIPT_ID = 'kakao-sdk-script';

export const KAKAO_REDIRECT_URI = `${window.location.origin}/app/login/kakao/callback`;

export function loadKakaoSdk(javascriptKey: string) {
  return new Promise<void>((resolve, reject) => {
    if (window.Kakao?.isInitialized()) {
      resolve();
      return;
    }

    const existingScript = document.getElementById(KAKAO_SDK_SCRIPT_ID);
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', () =>
        reject(new Error('Kakao SDK script load error')),
      );
      return;
    }

    const script = document.createElement('script');
    script.id = KAKAO_SDK_SCRIPT_ID;
    script.src = KAKAO_SDK_SRC;
    script.async = true;
    script.onload = () => {
      window.Kakao?.init(javascriptKey);
      resolve();
    };
    script.onerror = () => reject(new Error('Kakao SDK script load error'));
    document.head.appendChild(script);
  });
}

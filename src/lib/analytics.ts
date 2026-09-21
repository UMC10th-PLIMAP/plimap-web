const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim();

declare global {
  interface Window {
    dataLayer: IArguments[];
    gtag: (...args: unknown[]) => void;
  }
}

function isGaEnabled() {
  return Boolean(GA_MEASUREMENT_ID && GA_MEASUREMENT_ID.startsWith('G-'));
}

/** GA4 스크립트 로드 및 기본 config. Measurement ID가 없으면 no-op. */
export function initGA() {
  if (!isGaEnabled() || typeof window === 'undefined') return;
  if (document.getElementById('ga4-gtag')) return;

  window.dataLayer = window.dataLayer || [];
  // 공식 스니펫과 동일하게 Arguments 객체를 push해야 gtag.js가 큐를 처리한다.
  // rest 배열을 push하면 스크립트는 로드돼도 collect가 안 나갈 수 있다.
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  };

  const script = document.createElement('script');
  script.id = 'ga4-gtag';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.gtag('js', new Date());
  // SPA는 라우트 변경 시 page_view를 직접 보내므로 자동 page_view는 끈다.
  window.gtag('config', GA_MEASUREMENT_ID, {
    send_page_view: false,
    ...(import.meta.env.DEV ? { debug_mode: true } : {}),
  });
}

export function trackPageView(path: string) {
  if (!isGaEnabled() || typeof window.gtag !== 'function') return;

  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: document.title,
    page_location: window.location.href,
  });
}

export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (!isGaEnabled() || typeof window.gtag !== 'function') return;
  window.gtag('event', name, params);
}

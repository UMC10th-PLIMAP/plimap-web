import {
  AnalyticsEvent,
  type AnalyticsEventName,
  type AnalyticsEventParams,
} from '@/lib/analyticsEvents';

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim();

function isGaEnabled() {
  return Boolean(GA_MEASUREMENT_ID && GA_MEASUREMENT_ID.startsWith('G-'));
}

/** undefined 제거 — gtag에 불필요 키를 안 남긴다. */
function sanitizeParams(params?: Record<string, unknown>) {
  if (!params) return undefined;
  const next: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    next[key] = value;
  }
  return Object.keys(next).length > 0 ? next : undefined;
}

function ensureGtag() {
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag === 'function') return;

  // 공식 스니펫과 동일하게 Arguments 객체를 push해야 gtag.js가 큐를 처리한다.
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  };
}

/** 앱 부트 시 1회. Measurement ID가 있으면 gtag로 GA4 연동. */
export function initAnalytics() {
  if (!isGaEnabled() || typeof window === 'undefined') return;
  if (document.getElementById('ga4-gtag')) return;

  ensureGtag();

  const script = document.createElement('script');
  script.id = 'ga4-gtag';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    send_page_view: false,
    ...(import.meta.env.DEV ? { debug_mode: true } : {}),
  });
}

export function trackPageView(path: string) {
  if (!isGaEnabled()) return;

  ensureGtag();
  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: document.title,
    page_location: window.location.href,
  });
}

/** 타입된 제품 이벤트 전송. */
export function track<E extends AnalyticsEventName>(
  event: E,
  ...args: AnalyticsEventParams[E] extends undefined ? [] : [params: AnalyticsEventParams[E]]
) {
  if (!isGaEnabled()) return;

  const params = sanitizeParams(args[0] as Record<string, unknown> | undefined);
  ensureGtag();
  window.gtag('event', event, params);
}

export { initAnalytics as initGA };
export { AnalyticsEvent, type AnalyticsEventName, type AnalyticsEventParams };

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from '@/App';
import '@/index.css';

if (import.meta.env.DEV) {
  void import('@locator/runtime').then(({ default: setupLocatorUI }) => {
    setupLocatorUI();
  });
}

// 모바일 브라우저가 100dvh를 첫 렌더에서 잘못(작게) 계산했다가 터치·스크롤 후에야
// 재계산하는 문제 우회 - window.innerHeight를 실측해 --app-vh로 즉시 반영한다.
function setAppViewportHeight() {
  document.documentElement.style.setProperty('--app-vh', `${window.innerHeight}px`);
}
setAppViewportHeight();
window.addEventListener('resize', setAppViewportHeight);
window.addEventListener('orientationchange', setAppViewportHeight);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

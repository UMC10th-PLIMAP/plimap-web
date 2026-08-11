import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from '@/App';
import '@/index.css';

if (import.meta.env.DEV) {
  void import('@locator/runtime').then(({ default: setupLocatorUI }) => {
    setupLocatorUI();
  });
}

// 초기값은 index.html의 인라인 스크립트가 첫 페인트 전에 반영한다 - 여기선 갱신만 담당.
function setAppViewportHeight() {
  document.documentElement.style.setProperty('--app-vh', `${window.innerHeight}px`);
}
window.addEventListener('resize', setAppViewportHeight);
window.addEventListener('orientationchange', setAppViewportHeight);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

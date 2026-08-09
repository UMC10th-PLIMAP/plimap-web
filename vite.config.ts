import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [
    babel({
      plugins: [
        [
          '@locator/babel-jsx/dist',
          {
            env: 'development',
          },
        ],
      ],
    }),
    react(),
    tailwindcss(),
    svgr(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['Logo.png'],
      manifest: {
        name: 'PLIMAP',
        short_name: 'PLIMAP',
        description: '지도 위에서 발견하는 새로운 플레이리스트',
        display: 'standalone',
        theme_color: '#000000',
        background_color: '#000000',
        start_url: '/app/home',
        orientation: 'portrait',
        icons: [
          {
            src: '/Logo.png',
            sizes: '160x160',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/Logo.png',
            sizes: '160x160',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // 지도/위치 등 실시간 API 응답은 캐싱하지 않고 정적 자원(app shell)만 캐싱한다.
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            urlPattern: ({ request }) =>
              request.destination === 'script' ||
              request.destination === 'style' ||
              request.destination === 'font',
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'app-shell' },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});

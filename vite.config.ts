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
      includeAssets: [
        'Logo.png',
        'apple-touch-icon.png',
        'icons/pwa-icon-192.png',
        'icons/pwa-icon-512.png',
      ],
      manifest: {
        name: 'PLIMAP',
        short_name: 'PLIMAP',
        description: '지도 위에서 발견하는 새로운 플레이리스트',
        display: 'standalone',
        theme_color: '#12141F',
        background_color: '#12141F',
        start_url: '/app/home',
        orientation: 'portrait',
        icons: [
          {
            src: '/icons/pwa-icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/pwa-icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/pwa-icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // API·OAuth 경로로 직접 이동(navigation)하는 경우 index.html로 폴백하지 않는다.
        navigateFallbackDenylist: [/^\/api\//, /^\/oauth\/authorization\//],
        // runtimeCaching에 /api/ 규칙을 두지 않아, 지도/위치 등 API 응답은 캐싱하지 않는다.
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

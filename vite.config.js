import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      manifest: {
        name: 'DNS 测速排行榜',
        short_name: 'DNS测速',
        description: '测试中国常用公共 DNS 的速度与可靠性',
        theme_color: '#42b983',
        icons: [
          {
            src: 'public/favicon.ico',
            sizes: '256x256',
            type: 'image/x-icon'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,wasm}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/dns\.alidns\.com\/dns-query/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'doh-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 5 * 60 // 5 minutes
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.vue']
  },
  worker: {
    format: 'es',
    plugins: () => [vue()]
  },
  server: {
    proxy: {
      '/doh-proxy': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        secure: false,
        timeout: 10000
      }
    }
  }
})
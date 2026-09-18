import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), 
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt'],
      workbox: {
        navigateFallback: '/index.html',
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg}'],
    },
      manifest: {
        id: '/',
        name: 'Ecosvuelos',
        short_name: 'Ecosvuelos',
        description: 'Ecosvuelos',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#ffffff',
        screenshots: [
          {
            src: '/screenshots/escritorio.jpg',
            sizes: '728x421',
            type: 'image/jpg',
            form_factor: 'wide'
          },
          {
            src: '/screenshots/mobile.jpg',
            sizes: '738x1309',
            type: 'image/jpg',
            form_factor: 'narrow'
          }
        ],
        icons: [
        {
          src: '/icons/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/icons/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        }
      ],
      }
  })]
})

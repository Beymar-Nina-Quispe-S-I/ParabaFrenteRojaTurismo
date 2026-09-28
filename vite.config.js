import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'mapa_avistamiento_omereque.png', 'pwa-192x192.png', 'pwa-512x512.png'],
      manifest: {
        name: 'Ficha Técnica de Aves - Paraba de Frente Roja',
        short_name: 'Aves Omereque',
        description: 'Módulo ornitológico y de avistamiento de aves en Omereque y Río Mizque (Cochabamba, Bolivia)',
        theme_color: '#24513d',
        background_color: '#f3f5ef',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ]
});

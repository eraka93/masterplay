import { fileURLToPath, URL } from 'node:url'

import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // injectManifest (a custom src/sw.ts), not the default generateSW — the service worker
      // needs to also run Firebase Cloud Messaging's background handler (see src/sw.ts and
      // docs/ARCHITECTURE.md, "Push notifications"), which generateSW's auto-generated worker
      // has no hook for.
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
      },
      includeAssets: ['favicon.svg', 'icons/*.png'],
      manifest: {
        name: 'MobileMastery',
        short_name: 'MobileMastery',
        description:
          'A personal learning platform for mastering React Native, mobile architecture, and systems engineering.',
        theme_color: '#0b0d12',
        background_color: '#0b0d12',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    // The Firebase Auth + Firestore SDKs dominate the main chunk (~280KB gzipped) because the
    // repository layer imports them statically so it can pick local-vs-Firestore per collection
    // at runtime (see src/repositories). Deferring that behind a dynamic import would shrink this
    // further but adds real complexity for a personal-scale app — documented as a later option in
    // docs/ROADMAP.md rather than done preemptively. Route-level code splitting (src/app/router.tsx)
    // already keeps every page's own code out of this chunk.
    chunkSizeWarningLimit: 1100,
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
  },
})

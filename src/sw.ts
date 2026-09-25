/// <reference lib="webworker" />

import { initializeApp } from 'firebase/app'
import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw'
import { precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { NetworkOnly } from 'workbox-strategies'

declare let self: ServiceWorkerGlobalScope

precacheAndRoute(self.__WB_MANIFEST)

// Never let the service worker cache Firestore responses — the Firestore SDK already has its own
// IndexedDB-backed offline write queue (see docs/ARCHITECTURE.md, "Offline behavior").
registerRoute(({ url }) => url.hostname === 'firestore.googleapis.com', new NetworkOnly())

// Firebase Cloud Messaging: handle a push that arrives while the app isn't in the foreground.
// Skipped entirely when Firebase isn't configured for this build (env vars inlined at build time
// by Vite) — mirrors src/firebase/config.ts's isFirebaseConfigured check, since a plain worker
// context can't import that module's logic directly.
const firebaseApiKey = import.meta.env.VITE_FIREBASE_API_KEY
const firebaseProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID
const firebaseAppId = import.meta.env.VITE_FIREBASE_APP_ID

if (firebaseApiKey && firebaseProjectId && firebaseAppId) {
  const app = initializeApp({
    apiKey: firebaseApiKey,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: firebaseProjectId,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: firebaseAppId,
  })

  const messaging = getMessaging(app)

  onBackgroundMessage(messaging, (payload) => {
    const title = payload.notification?.title ?? 'MobileMastery'
    const body =
      payload.notification?.body ?? "You haven't studied today yet — keep your streak alive."
    const url = payload.fcmOptions?.link ?? payload.data?.url ?? '/'

    void self.registration.showNotification(title, {
      body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      data: { url },
    })
  })

  self.addEventListener('notificationclick', (event) => {
    event.notification.close()
    const url = (event.notification.data as { url?: string } | undefined)?.url ?? '/'
    event.waitUntil(
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
        const existing = clients.find((client) => 'focus' in client)
        if (existing) return (existing as WindowClient).focus()
        return self.clients.openWindow(url)
      }),
    )
  })
}

import {
  getMessaging,
  getToken,
  isSupported,
  onMessage,
  type Unsubscribe,
} from 'firebase/messaging'

import { getFirebaseApp, isFirebaseConfigured } from './config'

/**
 * Cloud Messaging is only usable when Firebase is configured AND the browser actually supports
 * it — `isSupported()` returns false in browsers without Push API/Notification support (older
 * Safari, non-HTTPS contexts) rather than throwing, which is what we want to branch on cleanly.
 */
export async function isMessagingSupported(): Promise<boolean> {
  if (!isFirebaseConfigured) return false
  try {
    return await isSupported()
  } catch {
    return false
  }
}

/**
 * Requests browser notification permission and, if granted, registers this device for push by
 * fetching an FCM token. Returns null if permission was denied or the platform doesn't support
 * it — callers should treat that as "not available right now," not an error.
 */
export async function requestNotificationToken(): Promise<string | null> {
  if (!(await isMessagingSupported())) return null
  if (typeof Notification === 'undefined') return null

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return null

  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY
  if (!vapidKey) {
    console.warn(
      'VITE_FIREBASE_VAPID_KEY is not set — generate a Web Push certificate in Firebase Console ' +
        '(Project Settings > Cloud Messaging > Web configuration) to enable push notifications.',
    )
    return null
  }

  const registration = await navigator.serviceWorker.ready
  const messaging = getMessaging(getFirebaseApp())
  return getToken(messaging, { vapidKey, serviceWorkerRegistration: registration })
}

/** Foreground push messages (app already open) — the service worker only handles background ones. */
export async function onForegroundMessage(
  callback: (title: string, body: string) => void,
): Promise<Unsubscribe | null> {
  if (!(await isMessagingSupported())) return null
  const messaging = getMessaging(getFirebaseApp())
  return onMessage(messaging, (payload) => {
    callback(
      payload.notification?.title ?? 'MobileMastery',
      payload.notification?.body ?? "You haven't studied today yet.",
    )
  })
}

export function currentNotificationPermission(): NotificationPermission | 'unsupported' {
  if (typeof Notification === 'undefined') return 'unsupported'
  return Notification.permission
}

import { useEffect } from 'react'

import { onForegroundMessage } from '@/firebase/messaging'

/**
 * The service worker (src/sw.ts) only receives a push while the app is backgrounded/closed — FCM
 * delivers foreground pushes straight to the page instead, so this shows them as a native
 * Notification too, otherwise a push while the tab is open would silently do nothing.
 */
export function useForegroundNotifications(): void {
  useEffect(() => {
    let unsubscribe: (() => void) | null = null
    let cancelled = false

    void onForegroundMessage((title, body) => {
      if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
      new Notification(title, { body, icon: '/icons/icon-192.png' })
    }).then((unsub) => {
      if (cancelled) {
        unsub?.()
      } else {
        unsubscribe = unsub
      }
    })

    return () => {
      cancelled = true
      unsubscribe?.()
    }
  }, [])
}

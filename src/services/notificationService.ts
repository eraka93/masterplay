import { requestNotificationToken } from '@/firebase/messaging'
import type { Repositories } from '@/repositories'
import { hashString } from '@/utils/hash'

/** One token doc per device/browser, keyed by a stable hash of the token so re-registering the
 * same device just overwrites its own entry instead of accumulating duplicates. */
function tokenDocId(token: string): string {
  return `device-${hashString(token)}`
}

export type EnableRemindersResult = 'enabled' | 'denied' | 'unsupported' | 'missing-vapid-key'

/**
 * Requests notification permission and, if granted, saves the resulting FCM token to
 * `users/{uid}/notificationTokens` so the scheduled reminder function (functions/src/index.ts)
 * knows where to send a push. See docs/LEARNING_SYSTEM.md, "Reminders."
 */
export async function enableStudyReminders(
  uid: string,
  repos: Repositories,
): Promise<EnableRemindersResult> {
  const token = await requestNotificationToken()
  if (token === null) {
    if (typeof Notification !== 'undefined' && Notification.permission === 'denied') return 'denied'
    if (!import.meta.env.VITE_FIREBASE_VAPID_KEY) return 'missing-vapid-key'
    return 'unsupported'
  }

  await repos.notificationTokens.upsert({
    id: tokenDocId(token),
    userId: uid,
    token,
    createdAt: new Date().toISOString(),
    userAgent: navigator.userAgent,
  })

  return 'enabled'
}

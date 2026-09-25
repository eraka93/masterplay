/** A registered FCM token for one browser/device, so a scheduled reminder knows where to push. */
export interface NotificationToken {
  id: string
  userId: string
  token: string
  createdAt: string
  userAgent: string
}

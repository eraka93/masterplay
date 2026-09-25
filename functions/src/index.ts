import { initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { getMessaging } from 'firebase-admin/messaging'
import { logger } from 'firebase-functions'
import { onSchedule } from 'firebase-functions/v2/scheduler'

initializeApp()

/**
 * Requires the Blaze (pay-as-you-go) plan — scheduled functions run on Cloud Scheduler + Pub/Sub,
 * which aren't available on the free Spark plan even though a personal app like this will stay
 * well within the free-tier usage quotas. See docs/LEARNING_SYSTEM.md, "Reminders."
 *
 * Runs once a day at 14:00 in REMINDER_TIME_ZONE. Firing only once a day (rather than polling
 * every N minutes and tracking "already sent today") means there's no dedup bookkeeping needed —
 * the schedule itself guarantees at most one run per day.
 */
const REMINDER_TIME_ZONE = 'Europe/Belgrade'

export const sendStudyReminders = onSchedule(
  { schedule: '0 14 * * *', timeZone: REMINDER_TIME_ZONE },
  async () => {
    const db = getFirestore()
    const auth = getAuth()
    const messaging = getMessaging()

    const today = new Date().toLocaleDateString('en-CA', { timeZone: REMINDER_TIME_ZONE }) // YYYY-MM-DD

    let pageToken: string | undefined
    let usersChecked = 0
    let remindersSent = 0

    do {
      const page = await auth.listUsers(1000, pageToken)
      pageToken = page.pageToken

      for (const userRecord of page.users) {
        usersChecked += 1
        const uid = userRecord.uid

        const activitiesToday = await db
          .collection('users')
          .doc(uid)
          .collection('activities')
          .where('date', '==', today)
          .limit(1)
          .get()

        if (!activitiesToday.empty) continue // already studied today, no reminder needed

        const tokenDocs = await db
          .collection('users')
          .doc(uid)
          .collection('notificationTokens')
          .get()
        if (tokenDocs.empty) continue // never enabled reminders on any device

        const tokens = tokenDocs.docs.map((doc) => doc.data().token as string).filter(Boolean)
        if (tokens.length === 0) continue

        const response = await messaging.sendEachForMulticast({
          tokens,
          notification: {
            title: "You haven't studied today",
            body: 'Keep your MobileMastery streak alive — one lesson or quiz is enough.',
          },
          webpush: {
            fcmOptions: { link: '/' },
          },
        })
        remindersSent += response.successCount

        // Clean up tokens Firebase reports as no longer valid (uninstalled, revoked, expired).
        const staleTokenIds = response.responses
          .map((result, index) => ({ result, docId: tokenDocs.docs[index]!.id }))
          .filter(({ result }) => !result.success)
          .map(({ docId }) => docId)

        await Promise.all(
          staleTokenIds.map((docId) =>
            db.collection('users').doc(uid).collection('notificationTokens').doc(docId).delete(),
          ),
        )
      }
    } while (pageToken)

    logger.info(`Study reminders: checked ${usersChecked} user(s), sent ${remindersSent} push(es).`)
  },
)

# Learning System

How MobileMastery's gamification and learning-science mechanics actually work, and where their
numbers live so tuning them never means hunting through UI code.

## XP

Every XP-earning action is defined once, in `src/config/xp.ts`:

| Action                      | XP                                 |
| --------------------------- | ---------------------------------- |
| Open the app (once per day) | 5                                  |
| Complete a lesson           | 20                                 |
| Complete a quiz             | 20 (+10 bonus for a perfect score) |
| Complete a daily challenge  | 30                                 |
| Log a real-world problem    | 30                                 |
| Log an engineering decision | 25                                 |

No component contains a literal XP number — every award goes through
`src/services/progressService.ts`, which reads `XP_REWARDS` and is the single write path for
activity + profile updates (see `docs/ARCHITECTURE.md`, "State management"). Changing the economy
is a one-file edit.

## Streak bonuses

Also centralized, in `STREAK_BONUSES` (`src/config/xp.ts`): 7 days (+50 XP), 14 days (+75), 30
days (+150), 60 days (+250), 100 days (+400), 365 days (+1500). Awarded automatically the moment a
streak reaches that length — see `computeStreakAfterActivity` in `src/services/streakService.ts`.

## Streaks

A day counts toward the streak once its cumulative XP crosses `STREAK_CONFIG.minXpPerDay` (10 XP
by default — also in `src/config/xp.ts`, so "what counts as showing up today" is one number, not a
scattered set of conditions). The transition logic (`computeStreakAfterActivity`) is a small pure
function:

- Same day as last counted day -> no change (idempotent; safe to call after every activity).
- Yesterday was the last counted day -> streak +1.
- Otherwise -> streak resets to 1.
- Longest streak is updated whenever the current streak exceeds it.

This function is unit-tested (`src/services/streakService.test.ts`) precisely because streak logic
is the kind of thing that's easy to get subtly wrong (off-by-one on "yesterday," double-counting
same-day activity) and expensive to get wrong in a product where the whole point is trustworthy
measurement.

## Levels

Nine gamification levels (`src/config/levels.ts`), keyed purely to lifetime XP: Explorer -> Junior
Developer -> Developer -> Advanced Developer -> Senior Developer -> **Senior Mobile Engineer** ->
Mobile Specialist -> Staff Engineer -> **Mobile Architect**. These are flavor, explicitly not a
claim of real professional certification (the spec's own instruction, preserved verbatim in the
level taglines' framing) — they exist to make progress _feel_ like it's going somewhere, not to
imply an employer would recognize "Level 7" as a title.

A user's level and in-level progress are never stored — `UserProfile` only stores `totalXp`;
`getLevelProgress(totalXp)` derives the current level, next level, and progress-to-next everywhere
it's needed. Storing a redundant `level` field would just be a second source of truth that could
drift from `totalXp`.

## Achievements

`src/config/achievements.ts` defines 17 achievements across five categories (milestone, streak,
mastery, exploration, craft). Unlock conditions are evaluated after every XP-earning action
(`evaluateNewlyUnlockedAchievements` in `src/services/achievementService.ts`) against the just-
updated profile plus freshly-computed subject mastery — nothing is checked on a timer or a
separate pass. Already-unlocked achievements are never re-evaluated (checked against
`userAchievements`), so this stays cheap even as the achievement list grows.

## Quizzes

Five question types are modeled (`src/models/quiz.ts`): single-choice, multiple-choice,
true/false, code (a question anchored to a code snippet), and scenario (a question anchored to a
prose scenario) — `QuizRunner` (`src/features/lessons/QuizRunner.tsx`) renders all five from one
component by branching on `question.type`. An attempt records per-question correctness and topic
(`QuestionResult`), which is what feeds both the profile's rolling average score and the
spaced-repetition schedule below — a quiz attempt is the one action that updates three different
systems (attempts log, profile stats, review schedule) from a single user action.

## Spaced repetition

**Deliberately simple, deliberately designed to be replaced.** `src/services/
spacedRepetitionService.ts` implements an SM-2-inspired scheme:

- Each topic (a lowercase slug, e.g. `jsi`, `event-loop` — see `Question.topic`) has a
  `difficulty` (1 easiest – 5 hardest, starts at 3), a `reviewCount`, and a `successCount`.
- A correct answer lowers difficulty by 1 and schedules further out (interval table: 1, 2, 4, 7,
  14, 30, 60, 120 days, indexed by `successCount`, shortened for still-hard topics and lengthened
  for easy ones).
- An incorrect answer raises difficulty by 1 and resets the interval to 1 day.

This runs automatically on every quiz submission (`progressService.submitQuizAttempt`), one
`ReviewScheduleEntry` per topic touched. The Dashboard's "Recommended revision" card and the
Analytics page's "Due for review" count both just query `reviewSchedule` for entries whose
`nextReviewDate` has passed — there's no separate scheduling job.

The reason this is explicitly _not_ a full FSRS/Anki-grade algorithm: `difficulty` +
`reviewCount` + `successCount` already carry enough signal that swapping in a more sophisticated
formula later is a one-function change to `computeNextReview` — no data migration, because the
stored shape doesn't assume the simple version.

## Skill matrix / mastery

`src/services/skillService.ts` computes a 0–100 "mastery" per subject as
`60% lesson completion + 40% average quiz score` (or 70% of completion alone if no quiz has been
taken yet for that subject) — computed on read from `activities` + `quizAttempts`, never stored
(see `docs/ARCHITECTURE.md` for why). The product's own copy is explicit that this is an internal
progress signal, not an objective measurement of engineering skill — the Analytics page states
this directly next to the matrix, matching the spec's instruction not to overclaim what these
numbers mean.

## Goals

Daily / weekly / monthly / custom goals (`src/models/goal.ts`) target one of five metrics: minutes
studied, lessons completed, quizzes completed, challenges completed, or XP earned. Like mastery,
progress is computed on read (`src/services/goalService.ts`) from the activity log within the
goal's date range rather than trusted as a stored counter — so a goal's progress bar can never
drift out of sync with what actually happened.

## Daily challenges

Nine challenge types are modeled (`src/models/challenge.ts`): multiple-choice, find-the-bug,
predict-the-output, architecture-decision, debugging-scenario, performance-problem, code-review,
refactor-challenge, system-design. The UI flow (`ChallengeDetailPage`) deliberately gates the
resolution behind two steps — investigation prompts, then possible approaches — before revealing
which approach was actually taken and why, matching the spec's explicit instruction not to reveal
the answer immediately.

## Reminders

The spec asks for a 14:00 "you haven't studied today" nudge. Doing this honestly on a PWA meant
putting the actual decision logic server-side rather than in the browser tab, since nothing
client-side can reliably wake up and check "did I study today" once the app is closed or the tab
isn't open — a `setTimeout` in the page would silently stop working the moment the app isn't in
the foreground, which is exactly what the spec's "do not fake background functionality"
instruction rules out.

**How it actually works:**

1. The client (`src/features/notifications/StudyRemindersCard.tsx`, on the Profile page) requests
   Notification permission and, once granted, registers the device for push
   (`src/firebase/messaging.ts` → `requestNotificationToken`). The resulting FCM token is saved to
   `users/{uid}/notificationTokens/{deviceId}` (`src/services/notificationService.ts`) — one doc
   per browser/device, so a person can enable this on more than one device.
2. A scheduled Cloud Function (`functions/src/index.ts`, `sendStudyReminders`) runs once a day at
   14:00 (Europe/Belgrade by default — change `REMINDER_TIME_ZONE` in that file) using Cloud
   Scheduler. For every registered user, it checks whether `users/{uid}/activities` has any entry
   dated today; if not, it sends a push to every token on file via
   `admin.messaging().sendEachForMulticast`, and prunes any token Firebase reports as no longer
   valid (app uninstalled, permission revoked).
3. The push is received by `src/sw.ts` while the app is backgrounded/closed (`onBackgroundMessage`,
   using the FCM Web SDK's dedicated `firebase/messaging/sw` service-worker entry point — see
   `docs/ARCHITECTURE.md`, "Push notifications"), or by `useForegroundNotifications`
   (`src/hooks/useForegroundNotifications.ts`) if the app happens to be open at the time.

**Two things only work after manual setup in the Firebase Console — not something this codebase
can configure for you:**

- A **Web Push certificate (VAPID key)** — Project Settings → Cloud Messaging → Web configuration
  → generate a key pair, then set `VITE_FIREBASE_VAPID_KEY` in `.env.local`. Without it,
  `enableStudyReminders` returns `'missing-vapid-key'` and the button explains that in the UI
  rather than failing silently.
- The **Blaze (pay-as-you-go) billing plan** — scheduled functions run on Cloud Scheduler + Pub/Sub,
  which the free Spark plan doesn't support at all, regardless of actual usage staying inside the
  free-tier quotas. `firebase deploy --only functions` (or `npm run functions:deploy`) will fail
  with a clear billing-required error until this is enabled.

**iOS constraints that remain true regardless of the above:** Web Push only works once the app has
been added to the Home Screen (Safari doesn't support push for regular browser tabs), and requires
iOS 16.4+.

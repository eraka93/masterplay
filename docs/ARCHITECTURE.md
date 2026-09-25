# Architecture

MobileMastery is a React + TypeScript + Vite PWA, designed to run entirely on local data with
zero setup, and to switch to live Firebase (Auth + Firestore) the moment real credentials are
provided — without any component code changing. This document explains the structure and the
reasoning behind the choices that aren't obvious from the code alone.

## Folder structure

```
src/
  app/            App root, router (route-level code splitting lives here)
  components/     Cross-feature UI: design-system primitives (ui/), layout shell, ErrorBoundary
  config/         Static, hand-authored configuration: XP economy, levels, subjects, nav, projects
  data/
    content/      Static learning content: subjects' modules, lessons, quizzes, questions,
                   challenges, knowledge base — see "Why content is static" below
    seed/         Demo/seed data generators, used once on first launch
  features/       One folder per product area (dashboard, roadmap, lessons, practice, knowledge,
                   problems, decisions, goals, achievements, analytics, saved, profile, auth,
                   theme, search) — each owns its page(s), its CSS, and any components it doesn't
                   share with other features
  firebase/       Thin wrappers around the Firebase SDK (config, auth, firestore) — nothing else
                   in the app imports the `firebase` package directly
  hooks/          Cross-feature hooks (useAuth, useRepositories, useCollectionData, etc.)
  models/         Domain types — the vocabulary every other layer is written in
  pages/          Only truly generic, contentless pages (currently: NotFoundPage)
  repositories/   The data-access abstraction — see below
  services/       Pure/orchestrating business logic: XP & streaks, spaced repetition, skill
                   mastery, search, seeding
  styles/         Design tokens (CSS custom properties) and global resets
  utils/          Small, dependency-free helpers (dates, a minimal markdown renderer)
```

Nothing here is a "God folder" — `App.tsx` renders a router, the router renders a shell, the shell
renders whichever feature page matches the URL. No component in this codebase is more than a few
hundred lines; when a page needed more, the difference was moved into a service or a smaller
component, not left inline.

## The repository layer: the one abstraction the whole app depends on

Every piece of user-generated data (profile, activities, goals, notes, bookmarks, quiz/challenge
attempts, real-world problems, engineering decisions, spaced-repetition schedule) is accessed
through `src/repositories`, never through Firebase or `localStorage` directly from a component or
hook.

```
CollectionRepository<T>          DocRepository<T>
  list(): Promise<T[]>             get(): Promise<T | null>
  get(id): Promise<T | null>       set(value): Promise<void>
  upsert(item): Promise<void>      update(patch): Promise<void>
  remove(id): Promise<void>
```

Two implementations satisfy each interface:

- **Local** (`repositories/local/*`) — reads/writes JSON in `localStorage`, namespaced by uid and
  collection name (`mobilemastery:{uid}:{collection}`). This is the default whenever
  `VITE_FIREBASE_*` env vars are unset.
- **Firestore** (`repositories/firestore/*`) — reads/writes real Firestore documents at
  `users/{uid}/{collection}/{docId}`. Active automatically once Firebase is configured.

`repositories/index.ts` picks the implementation per collection at creation time
(`isFirebaseConfigured` is a build-time-ish constant, read once). `useRepositories()` memoizes the
result per uid. **No other code branches on "is Firebase configured."** This is why the app is
fully usable the moment you `npm install && npm run dev` — there is no Firebase project to create
before you can see anything — and why wiring up a real project later is additive, not a rewrite.

## Why lesson/quiz/challenge content is static, not in Firestore

Subjects, modules, lessons, quizzes, questions, and challenges (`src/data/content`) are plain
TypeScript modules bundled with the app, not Firestore documents. This was a deliberate call, not
an oversight relative to the spec's Firestore collection list:

- This content is authored by the developer (you), not by end users at runtime — it has the same
  lifecycle as the app's code, and belongs in version control with it.
- Serving it from the bundle means zero Firestore reads for the thing users touch most (every
  lesson view, every quiz load) — meaningfully cheaper at Firebase's per-document pricing, and
  instant/offline by construction, with no loading state needed.
- If/when this content needs to be edited without a redeploy, the migration path is narrow: add a
  `content` collection and a `ContentRepository` following the exact same interface pattern above
  — nothing else in the app would need to change.

User _progress against_ that content (which lessons are done, quiz scores, bookmarks, notes) is
real per-user data and does live in Firestore/local storage via the repository layer.

## Firestore data model

Every per-user collection lives at `users/{uid}/{collection}`:

```
users/{uid}
  profile/main            — UserProfile (single doc)
  activities/{id}         — Activity (feeds the dashboard + contribution graph)
  studySessions/{id}      — StudySession
  goals/{id}              — Goal
  notes/{id}              — Note (id == lessonId, one note per lesson)
  bookmarks/{id}          — Bookmark
  quizAttempts/{id}       — QuizAttempt
  challengeAttempts/{id}  — ChallengeAttempt
  realWorldProblems/{id}  — RealWorldProblem
  engineeringDecisions/{id} — EngineeringDecision
  userAchievements/{id}   — UserAchievement (id == achievementId)
  reviewSchedule/{id}     — ReviewScheduleEntry (id == "{subjectId}:{topic}")
  notificationTokens/{id} — NotificationToken (id == "device-{hash(token)}")
```

Why this shape rather than top-level collections with a `userId` field:

- **Security rules collapse to one check.** `allow read, write: if request.auth.uid == uid` on
  `users/{uid}/{collection}/{docId}` covers everything (see `firestore.rules`) — no per-collection
  rule duplication, no risk of forgetting one.
- **No collection-group queries are needed.** This is a single-user-per-account app; nothing ever
  needs to query "all users' activities." Subcollections keep every query naturally scoped and
  cheap.
- **Deleting an account is one subtree delete**, not a multi-collection sweep filtered by `userId`.

`SkillProgress` (from the original spec's model list) is deliberately **not** a stored collection —
see `src/services/skillService.ts`: subject mastery is cheap to compute from `activities` +
`quizAttempts` on read, and computing it avoids a second write path that could drift out of sync
with the data it's derived from.

## Authentication flow

- `src/firebase/auth.ts` wraps Firebase Auth's Google provider (`signInWithPopup`) and exposes
  `subscribeToAuthChanges`.
- `AuthProvider` (`src/features/auth/AuthProvider.tsx`) turns that into a React context: `uid`
  (real Firebase uid, or `LOCAL_DEV_UID` when Firebase isn't configured), `isAuthenticated`, and
  `signIn`/`signOutUser`.
- `LoginGate` (`src/features/auth/LoginGate.tsx`) is the route guard: shows a sign-in screen when
  Firebase is configured and no user is signed in; otherwise runs one-time bootstrap
  (`ensureSeeded` + `recordAppOpen`) and renders the app.
- Adding another provider (Apple, email link, etc.) means adding a function next to
  `signInWithGoogle` in `firebase/auth.ts` and a button in `LoginGate` — the context shape doesn't
  change.

## Routing

`src/app/router.tsx` uses `react-router-dom`'s data router. Every feature page is loaded via
`React.lazy` + `Suspense`, so a route's code only downloads when that route is visited — this is
what keeps the JS actually shipped per page small even though the app itself is not (see the build
output; per-page chunks are 1–20KB gzipped). The Firebase SDK unavoidably dominates the shared main
chunk since the repository layer needs it available synchronously to decide local-vs-Firestore per
collection; deferring that further behind a dynamic import is a reasonable future optimization
(see `docs/ROADMAP.md`) but wasn't worth the added complexity for a personal-scale app yet.

## State management

There is no global state library. State lives in three places, on purpose:

1. **Server-ish state** (profile, activities, goals, etc.) — fetched via `useCollectionData` /
   `useUserProfile`, thin hooks around the repository layer. No caching library (React Query, SWR)
   because the dataset is small, per-user, and the repository abstraction already hides
   local-vs-Firestore; adding a cache layer would be weight without a corresponding win here.
2. **Cross-cutting app state** (auth identity, theme) — React Context (`AuthContext`,
   `ThemeContext`), each with one small provider and one hook.
3. **Local UI state** (a form draft, whether a modal is open) — plain `useState`, kept inside the
   component that owns it.

## Error handling

- `ErrorBoundary` wraps the app's route outlet — a bug in one feature can't blank the whole app.
- Repository calls that can fail (mainly Firestore, and `localStorage` under quota/private-mode
  restrictions) fail soft where reasonable: local reads return `[]`/`null` rather than throwing,
  writes are best-effort. This mirrors the failure modes those two backends actually have.
- `OfflineBanner` (`src/components/ui/OfflineBanner.tsx`) surfaces `navigator.onLine` state
  directly in the UI rather than papering over it, per the product spec's instruction not to fake
  behavior the platform can't reliably provide.

## Offline behavior

- **Local mode (no Firebase configured):** everything is `localStorage`-backed already — there is
  nothing to go "offline" from. This is the default dev experience.
- **Firestore mode:** `getDb()` (`src/firebase/firestore.ts`) initializes Firestore with
  `persistentLocalCache()` — an IndexedDB-backed cache, not the SDK's in-memory-only default. This
  means previously-loaded lessons' progress, notes, and other data remain readable after a reload
  while offline, and writes made offline (e.g. a note edited on the subway) are queued by the
  Firestore SDK itself and sync automatically once the connection returns — this is standard
  Firestore client behavior, not custom code, and is the right level to solve it at.
- The service worker (`vite-plugin-pwa`) explicitly excludes `firestore.googleapis.com` from its
  cache (`vite.config.ts`) so it never fights with the Firestore SDK's own offline cache.
- Static lesson/quiz/challenge content needs no offline handling at all — it's bundled JS, already
  available offline the instant the app shell loads.

## PWA / iOS home screen behavior

`vite-plugin-pwa` generates the manifest and service worker; `index.html` carries the iOS-specific
meta tags (`apple-mobile-web-app-capable`, `apple-touch-icon`, `theme-color`). **Known iOS
limitations, documented rather than worked around:**

- No Background Sync API and no reliable background execution — a queued offline write only
  flushes when the app is actually opened, not on a timer in the background.
- Web Push on iOS only works once the app has been added to the Home Screen (Safari does not
  support push for regular tabs) and requires iOS 16.4+.
- No badge count API access from a web app on iOS.

These constraints are why the scheduling decision for the 14:00 reminder lives server-side (next
section) rather than as a client-side timer.

## Push notifications

`vite-plugin-pwa` is configured with `strategies: 'injectManifest'` instead of its default
`generateSW`, pointed at a custom `src/sw.ts` — this is the one thing that forced a departure from
the auto-generated worker: Firebase Cloud Messaging's background handler needs to run *inside* the
service worker, and `generateSW` gives no hook to add that. `src/sw.ts` does both jobs in one file:
Workbox precaching/routing (the same `NetworkOnly` rule for Firestore as before), and
`onBackgroundMessage` from the FCM Web SDK's `firebase/messaging/sw` entry point — a modular,
ESM-native API meant specifically for this, so no `importScripts`/compat-SDK juggling is needed.
`src/sw.ts` type-checks under its own project (`tsconfig.sw.json`, `lib: ["ES2023", "WebWorker"]`)
since a service worker's global scope is incompatible with the DOM lib the rest of the app uses.

The send side is a scheduled Cloud Function (`functions/`, a separate npm project with its own
`package.json`/`tsconfig.json` — see `firebase.json`'s `functions` block). It runs once daily via
Cloud Scheduler, not a polling loop with dedup bookkeeping, which is why there's no
"already sent today" flag anywhere: the schedule itself guarantees at most one run per day. Per
user, it checks `users/{uid}/activities` for a same-day entry and, if none exists, pushes to every
token in `users/{uid}/notificationTokens` via the Admin SDK, pruning tokens Firebase reports as
dead. This needed its own project (rather than living in `src/`) because Cloud Functions run in a
Node.js environment with Admin SDK privileges no browser code should ever have.

Two setup steps are Console/billing actions, not code — see `docs/LEARNING_SYSTEM.md`, "Reminders,"
for exactly what's needed and how the app behaves before they're done.

## Testing strategy

- **Unit tests** for pure services with real behavioral edge cases worth locking in: streak
  transitions, the spaced-repetition scheduler, level/XP math, goal progress computation
  (`src/services/*.test.ts`, `src/config/levels.test.ts`).
- **Component tests** for UI logic that's easy to silently break (`ProgressBar`'s clamping/ARIA
  behavior) using Testing Library.
- Deliberately **not** chasing 100% coverage — snapshot tests of every page, or tests that just
  re-assert JSX structure, add maintenance cost without catching real bugs. Add a test when a
  function has a rule worth protecting (an edge case, a formula, an invariant), not because a file
  exists.

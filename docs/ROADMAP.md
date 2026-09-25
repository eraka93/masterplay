# Roadmap

Status of each phase as of the initial build. "Done" means implemented and verified (typecheck +
lint + tests + production build all pass, and the app was driven in a real browser — see the PR/
commit history for screenshots). Nothing here is a promise of future work being scheduled; it's a
map of what exists and what doesn't yet.

## Phase 1 — Project foundation ✅

Vite + React 19 + strict TypeScript, ESLint (flat config) + Prettier, path aliases (`@/*`),
feature-based folder structure, Vitest + Testing Library, PWA manifest/service worker, custom app
icon set.

## Phase 2 — Authentication ✅

Firebase Auth (Google Sign-In) wired through `AuthProvider` + `LoginGate`; the app also runs
fully without any Firebase project configured, using a fixed local identity — see
`docs/ARCHITECTURE.md`, "Authentication flow."

## Phase 3 — Learning content ✅ (seed set), 🚧 (full 34-subject library)

Block-based lesson renderer (12 block types), roadmap UI across all 34 subjects, content authored
for 8 lessons spanning JS Event Loop, React Reconciliation, the classic RN Bridge, **JSI** (the
flagship, high-detail lesson), Hermes, Fabric, TurboModules, and RN Performance. The remaining ~26
subjects show as "content coming soon" in the roadmap UI rather than being faked with placeholder
text — see `src/data/content/lessons`.

## Phase 4 — Quiz system ✅

Five question types, a single `QuizRunner` component, attempts logged with per-question topic
results, scoring feeds both the profile's rolling average and spaced repetition. Quizzes authored
for JS Event Loop, React Reconciliation, JSI (6 questions), and RN Performance.

## Phase 5 — Progress tracking ✅

Activity log, GitHub-style ~1-year contribution graph, streaks, study-time aggregates, per-subject
mastery computed from real usage (not hardcoded), Dashboard and Analytics pages.

## Phase 6 — Gamification ✅

XP economy, 9 levels, streak bonuses, 17 achievements across 5 categories, all centrally
configured (`src/config`) — see `docs/LEARNING_SYSTEM.md`.

## Phase 7 — Knowledge base ✅ (core), 🚧 (personal authoring UI)

Tag-filterable, searchable knowledge base with 4 seeded entries (JSI vs. Bridge, FlatList
checklist, event loop cheat sheet, Context re-render fan-out). Read/detail views and global search
are done; there's no in-app "create a new knowledge base entry" form yet (notes on individual
lessons are implemented instead, and cover the "capture what I learned" need for now).

## Phase 8 — Real-world problems ✅

Full data model (symptoms, investigation, final cause, solution, before/after code, lessons
learned), a log-a-problem form, list + detail views, XP award on logging. Two seeded examples
(FlatList frame drops, iOS background sync).

## Phase 9 — Engineering decisions ✅

Options-with-tradeoffs data model, a log-a-decision form, list + detail views, XP award on
logging. Two seeded examples (Redux vs. Zustand, AsyncStorage vs. MMKV).

## Phase 10 — Analytics ✅

XP-over-time bar chart, skill matrix, recent quiz scores, streak/study-time stats — built with a
small dependency-free `BarChart` component rather than a charting library, since the app's chart
needs are simple bar/line views at this stage.

## Phase 11 — Notifications ✅ (code), 🚧 (two manual Console/billing steps)

Fully implemented: permission-request UI (Profile page), FCM token registration
(`src/services/notificationService.ts`), a scheduled Cloud Function
(`functions/src/index.ts`) that checks once a day at 14:00 whether each user studied today and
pushes a reminder if not, and both background (`src/sw.ts`) and foreground
(`useForegroundNotifications`) delivery on the client. See `docs/LEARNING_SYSTEM.md`, "Reminders,"
for the full flow.

Two things remain that only the project owner can do, in the Firebase Console — not something
committed code can complete on its own: generating a Web Push VAPID key, and enabling the Blaze
billing plan (required for any scheduled function, regardless of actual usage staying free-tier).
Until both are done, the UI degrades honestly (`'missing-vapid-key'` status) rather than failing
silently, and `firebase deploy --only functions` fails with a clear billing-required error rather
than partially deploying.

## Phase 12 — Advanced learning algorithms 🚧

The spaced-repetition scheduler is intentionally v1 (SM-2-inspired, not FSRS) — see
`docs/LEARNING_SYSTEM.md` for why the data shape already supports upgrading it later without a
migration. No adaptive difficulty beyond that yet (e.g. dynamically reordering the roadmap based on
weak areas is descriptive today — the Dashboard surfaces weak subjects — but doesn't yet reorder
recommendations).

---

## Other known gaps, called out rather than hidden

- **Firestore security rules exist (`firestore.rules`) but haven't been deployed** — deployment
  requires a real Firebase project (`firebase init`, `firebase deploy --only firestore:rules`, or
  `npm run deploy:rules`).
- **No automated E2E test suite** — the app was manually driven end-to-end in a real browser
  during development (dashboard, roadmap, lesson reader, quiz flow, mobile layout), but there's no
  Playwright test committed to the repo yet to keep that regression-checked automatically.
- **Bundle size**: the Firebase Auth + Firestore SDKs dominate the shared main chunk (~280KB
  gzipped) because the repository layer needs them available synchronously to pick local-vs-
  Firestore per collection. Deferring that behind a dynamic import (loaded only once
  `isFirebaseConfigured` is true) would shrink this further — a reasonable Phase 13 if bundle size
  becomes a real problem, not done preemptively for a personal-scale app.
- **Push notification delivery is code-complete but not yet deployed/usable** — needs a VAPID key
  and the Blaze plan enabled, per Phase 11 above.
- **No dedicated study-session timer UI.** The `StudySession` model and repository exist
  (start/pause/resume/finish, associated with a lesson/challenge/topic), but there's no timer
  component wired up to them yet — study time shown on the Dashboard/Profile today is estimated
  from XP earned per day (`~xp / 2` minutes), not measured directly.
- **No visual knowledge-map/hierarchy navigation** (spec section 23 — a zoomable tree like
  "React Native > Architecture > New Architecture > JSI/Fabric/TurboModules/Codegen"). The Roadmap
  page covers discovering subjects and Related Lessons links connect specific topics, but there's
  no dedicated graph/tree view of the whole hierarchy yet.

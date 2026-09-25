# MobileMastery

A personal learning platform for systematically moving from experienced React Native developer
toward Senior Mobile Engineer, Staff Mobile Engineer, and Mobile Architect. It combines a
Duolingo-style streak/XP system, a LeetCode-style daily-challenge practice loop, and a Notion-style
personal knowledge base, aimed specifically at React Native internals, mobile architecture, and
engineering judgment — not general trivia.

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for how it's built,
[`docs/LEARNING_SYSTEM.md`](docs/LEARNING_SYSTEM.md) for how XP/levels/streaks/spaced-repetition
work, and [`docs/ROADMAP.md`](docs/ROADMAP.md) for what's done vs. not yet.

## Stack

React 19, TypeScript (strict), Vite, React Router, Firebase (Auth + Firestore), a hand-built
CSS-Modules design system (no UI or charting library), and Vitest + Testing Library.

## Getting started

```bash
npm install
npm run dev
```

That's it — the app runs entirely on local `localStorage`-backed data with a year of seeded demo
activity, no Firebase project required. Open http://localhost:5173.

## Using a real Firebase project (optional)

1. Create a project at the [Firebase Console](https://console.firebase.google.com/), enable
   **Authentication → Google**, and create a **Cloud Firestore** database.
2. Copy `.env.example` to `.env.local` and fill in the values from
   Project Settings → General → Your apps → SDK setup and configuration.
3. Deploy the security rules: `npm run deploy:rules` (requires `firebase login` + a project linked
   via `firebase use --add`).
4. `npm run dev` — the app now signs in with Google and reads/writes real Firestore data instead
   of local storage, with no code changes.

To run against the Firebase emulator suite instead of a real project: `npm run emulators`.

## Push notifications (optional)

The 14:00 "you haven't studied today" reminder needs two things only doable from the Firebase
Console, beyond the steps above — see [`docs/LEARNING_SYSTEM.md`](docs/LEARNING_SYSTEM.md),
"Reminders," for the full explanation:

1. A **Web Push certificate**: Project Settings → Cloud Messaging → Web configuration → generate a
   key pair, then set `VITE_FIREBASE_VAPID_KEY` in `.env.local`.
2. The **Blaze billing plan** enabled on the project (required for any scheduled Cloud Function).

Then: `npm run functions:install` once, followed by `npm run functions:deploy`.

## Scripts

| Script                                    | What it does                                             |
| ----------------------------------------- | -------------------------------------------------------- |
| `npm run dev`                             | Start the Vite dev server                                |
| `npm run build`                           | Typecheck + production build                             |
| `npm run preview`                         | Preview the production build locally                     |
| `npm run typecheck`                       | TypeScript project check, no emit                        |
| `npm run lint` / `lint:fix`               | ESLint                                                   |
| `npm run format` / `format:check`         | Prettier                                                 |
| `npm run test` / `test:watch` / `test:ui` | Vitest                                                   |
| `npm run verify`                          | typecheck + lint + test + build, in order                |
| `npm run emulators`                       | Firebase local emulator suite (Auth, Firestore, Hosting) |
| `npm run deploy`                          | Build and deploy to Firebase Hosting                     |
| `npm run deploy:rules`                    | Deploy `firestore.rules` only                            |
| `npm run functions:install`               | `npm install` inside `functions/`                        |
| `npm run functions:deploy`                | Build and deploy the Cloud Functions (needs Blaze plan)  |

## iPhone Home Screen

The app is a PWA. On iOS Safari: Share → Add to Home Screen. See `docs/ARCHITECTURE.md` for the
specific iOS limitations (background sync, push) this accounts for.

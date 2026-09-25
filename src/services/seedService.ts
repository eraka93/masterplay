import { createDefaultProfile } from '@/data/seed/defaultProfile'
import { generateDemoActivities } from '@/data/seed/demoActivity'
import { createSeedEngineeringDecisions } from '@/data/seed/seedEngineeringDecisions'
import { createSeedGoals } from '@/data/seed/seedGoals'
import { createSeedRealWorldProblems } from '@/data/seed/seedRealWorldProblems'
import { isFirebaseConfigured } from '@/firebase/config'
import type { Repositories } from '@/repositories'

// Guards against the double-invoke this gets under React StrictMode in development (and any
// other accidental concurrent call): without it, two callers can both see "no profile yet" before
// either has written one, and both seed a full duplicate dataset.
const inFlightSeeds = new Map<string, Promise<void>>()

/**
 * Runs once, the first time a user profile doesn't exist yet (fresh install / fresh Firestore
 * account). Populates a year of plausible activity history plus a few sample goals, real-world
 * problems and engineering decisions so the app is immediately usable rather than a blank slate
 * (spec section 32: "the purpose is to make the application immediately usable").
 */
export async function ensureSeeded(uid: string, repos: Repositories): Promise<void> {
  const existing = inFlightSeeds.get(uid)
  if (existing) return existing

  const run = (async () => {
    const existingProfile = await repos.userProfile.get()
    if (existingProfile) return

    if (!isFirebaseConfigured) {
      // Local/offline dev mode only — a year of plausible demo history so the app is immediately
      // usable on a fresh clone with zero setup. A real Firebase account always starts from a
      // genuinely blank profile; faking XP/streak history in production would misrepresent the
      // user's actual progress, which defeats the whole point of a measurement-focused app.
      const { activities, profilePatch } = generateDemoActivities(uid)
      const profile = { ...createDefaultProfile(uid), ...profilePatch }

      await repos.userProfile.set(profile)
      await Promise.all(activities.map((activity) => repos.activities.upsert(activity)))
      await Promise.all(createSeedGoals(uid).map((goal) => repos.goals.upsert(goal)))
      await Promise.all(
        createSeedRealWorldProblems().map((problem) => repos.realWorldProblems.upsert(problem)),
      )
      await Promise.all(
        createSeedEngineeringDecisions().map((decision) =>
          repos.engineeringDecisions.upsert(decision),
        ),
      )
      return
    }

    await repos.userProfile.set(createDefaultProfile(uid))
  })().finally(() => inFlightSeeds.delete(uid))

  inFlightSeeds.set(uid, run)
  return run
}

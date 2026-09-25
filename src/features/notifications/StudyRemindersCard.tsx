import { useEffect, useState } from 'react'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { currentNotificationPermission, isMessagingSupported } from '@/firebase/messaging'
import { useAuth } from '@/hooks/useAuth'
import { useRepositories } from '@/hooks/useRepositories'
import { enableStudyReminders, type EnableRemindersResult } from '@/services/notificationService'

const RESULT_MESSAGE: Record<EnableRemindersResult, string> = {
  enabled: "You're set — a nudge lands if you haven't studied by mid-afternoon.",
  denied: 'Notifications are blocked for this site. Re-enable them in your browser/OS settings.',
  unsupported: 'Push notifications aren’t supported in this browser.',
  'missing-vapid-key':
    'Push isn’t configured yet for this build (missing VITE_FIREBASE_VAPID_KEY).',
}

export function StudyRemindersCard() {
  const { uid, isFirebaseConfigured } = useAuth()
  const repos = useRepositories()
  const [supported, setSupported] = useState(false)
  const [permission, setPermission] = useState(currentNotificationPermission())
  const [status, setStatus] = useState<'idle' | 'working' | EnableRemindersResult>('idle')

  useEffect(() => {
    void isMessagingSupported().then(setSupported)
  }, [])

  if (!isFirebaseConfigured) return null

  async function handleEnable() {
    setStatus('working')
    const result = await enableStudyReminders(uid, repos)
    setStatus(result)
    setPermission(currentNotificationPermission())
  }

  return (
    <Card>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Study reminders</div>
      <p
        style={{
          fontSize: 12.5,
          color: 'var(--text-secondary)',
          marginBottom: 12,
          lineHeight: 1.6,
        }}
      >
        Get a push notification if you haven&apos;t opened MobileMastery by mid-afternoon. On iPhone
        this only works after adding the app to your Home Screen (Share {'→'} Add to Home Screen),
        and requires iOS 16.4+ — Safari doesn&apos;t support push for regular browser tabs.
      </p>

      {permission === 'granted' ? (
        <Badge tone="success">Enabled on this device</Badge>
      ) : (
        <Button
          variant="secondary"
          onClick={() => void handleEnable()}
          disabled={!supported || status === 'working'}
        >
          {status === 'working' ? 'Requesting permission...' : 'Enable reminders on this device'}
        </Button>
      )}

      {status !== 'idle' && status !== 'working' ? (
        <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 10 }}>
          {RESULT_MESSAGE[status]}
        </p>
      ) : null}
    </Card>
  )
}

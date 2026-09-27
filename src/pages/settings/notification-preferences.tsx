import { useEffect, useState } from 'react'
import { SettingsLayout } from '@/components/settings-layout'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'

interface NotificationPreferenceResponse {
  messagesEnabled: boolean
  eventsEnabled: boolean
  groupsEnabled: boolean
}

const preferenceOptions = [
  { key: 'messagesEnabled', label: 'Tin nhắn mới', description: 'Khi có bạn nhắn tin cho bạn.' },
  { key: 'eventsEnabled', label: 'Sự kiện sắp diễn ra', description: 'Nhắc trước khi sự kiện đã đăng ký bắt đầu.' },
  { key: 'groupsEnabled', label: 'Nhóm học tập', description: 'Có người trả lời câu hỏi của bạn trong nhóm.' },
] as const

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={cn(
        'relative w-12 h-7 rounded-full border-2 border-ink shrink-0 transition-colors',
        checked ? 'bg-neon' : 'bg-white',
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 w-5 h-5 rounded-full bg-ink transition-transform',
          checked ? 'translate-x-[22px]' : 'translate-x-0.5',
        )}
      />
    </button>
  )
}

export default function NotificationPreferencesPage() {
  const [prefs, setPrefs] = useState<NotificationPreferenceResponse | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get<NotificationPreferenceResponse>('/api/notifications/preferences').then(setPrefs)
  }, [])

  async function toggle(key: keyof NotificationPreferenceResponse) {
    if (!prefs || saving) return
    const next = { ...prefs, [key]: !prefs[key] }
    setPrefs(next)
    setSaving(true)
    try {
      await api.put('/api/notifications/preferences', next)
    } finally {
      setSaving(false)
    }
  }

  return (
    <SettingsLayout>
      <div className="flex items-center gap-1.5 text-[11px] font-display font-semibold text-ink uppercase tracking-wider mb-1">
        <span className="w-2 h-2 bg-magenta" />
        Thông báo
      </div>
      <h1 className="font-display font-bold text-[24px] text-ink mb-6">Bạn muốn nhận thông báo gì?</h1>

      {!prefs ? (
        <p className="text-ink/50 text-[14px]">Đang tải...</p>
      ) : (
        <div className="flex flex-col gap-4">
          {preferenceOptions.map((option) => (
            <div
              key={option.key}
              className="flex items-center gap-4 bg-white border-2 border-ink rounded-lg p-4"
            >
              <div className="flex-1">
                <p className="font-semibold text-[15px] text-ink">{option.label}</p>
                <p className="text-[13px] text-ink/50">{option.description}</p>
              </div>
              <Toggle checked={prefs[option.key]} onChange={() => toggle(option.key)} />
            </div>
          ))}
        </div>
      )}
    </SettingsLayout>
  )
}

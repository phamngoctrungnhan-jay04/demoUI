import { useEffect, useState } from 'react'
import { CalendarClock, CheckCheck, MessageCircle, Users, type LucideIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AppHeader } from '@/components/app-header'
import { Eyebrow } from '@/components/ui/eyebrow'
import { api } from '@/lib/api'
import { onIncomingNotification } from '@/lib/chat-socket'
import { resolveNotificationLink } from '@/lib/notification-link'
import type { NotificationResponse, NotificationType } from '@/lib/api-types'
import { cn } from '@/lib/utils'

const iconByType: Record<NotificationType, LucideIcon> = {
  NEW_MESSAGE: MessageCircle,
  EVENT_REMINDER: CalendarClock,
  GROUP_ACTIVITY: Users,
}

const timeFormatter = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })

export default function NotificationListPage() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState<NotificationResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get<NotificationResponse[]>('/api/notifications')
      .then(setNotifications)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    return onIncomingNotification((notification) => {
      setNotifications((prev) => [notification, ...prev])
    })
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length

  async function handleOpen(notification: NotificationResponse) {
    if (!notification.read) {
      await api.post(`/api/notifications/${notification.id}/read`)
      setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)))
    }
    const link = await resolveNotificationLink(notification)
    navigate(link)
  }

  async function handleMarkAllRead() {
    await api.post('/api/notifications/read-all')
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  return (
    <div className="w-full min-h-screen bg-cream">
      <AppHeader />

      <main className="max-w-[720px] mx-auto px-6 sm:px-16 py-10">
        <div className="flex items-center justify-between mb-7 gap-4 flex-wrap">
          <div>
            <Eyebrow color="magenta" className="mb-1">
              Thông báo
            </Eyebrow>
            <h1 className="font-display font-bold text-[26px] text-ink">
              {unreadCount > 0 ? `Bạn có ${unreadCount} thông báo mới` : 'Bạn đã xem hết thông báo'}
            </h1>
          </div>
          <button
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            className="flex items-center gap-1.5 text-[13px] font-semibold text-ink/60 disabled:opacity-40"
          >
            <CheckCheck className="w-4 h-4" />
            Đánh dấu đã đọc hết
          </button>
        </div>

        {loading ? <p className="text-ink/50 text-[14px]">Đang tải...</p> : null}
        {!loading && notifications.length === 0 ? (
          <p className="text-ink/50 text-[14px]">Bạn chưa có thông báo nào.</p>
        ) : null}

        <div className="flex flex-col gap-3">
          {notifications.map((notification) => {
            const Icon = iconByType[notification.type]
            return (
              <button
                key={notification.id}
                onClick={() => handleOpen(notification)}
                className={cn(
                  'flex items-start gap-4 rounded-lg p-4 text-left',
                  notification.read ? 'bg-white border-2 border-ink/15' : 'bg-white border-2 border-ink',
                )}
              >
                <div
                  className={cn(
                    'w-11 h-11 rounded-full border-2 flex items-center justify-center shrink-0',
                    notification.read ? 'border-ink/20 bg-ink/8' : 'border-ink bg-magenta',
                  )}
                >
                  <Icon className={cn('w-5 h-5', notification.read ? 'text-ink/50' : 'text-white')} />
                </div>
                <div className="flex-1">
                  <p className={cn('text-[14px]', notification.read ? 'font-medium text-ink/65' : 'font-semibold text-ink')}>
                    {notification.content}
                  </p>
                  <p className={cn('text-[12px] mt-0.5', notification.read ? 'text-ink/40' : 'text-ink/45')}>
                    {timeFormatter.format(new Date(notification.createdAt))}
                  </p>
                </div>
                {!notification.read ? <span className="w-2.5 h-2.5 rounded-full bg-magenta mt-1.5 shrink-0" /> : null}
              </button>
            )
          })}
        </div>
      </main>
    </div>
  )
}

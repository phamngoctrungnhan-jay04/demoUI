import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Check, Settings2, Share2, Users } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { EventBanner } from '@/components/event-banner'
import { Button } from '@/components/ui/button'
import { ShareEventModal } from '@/components/share-event-modal'
import { ApiError, api } from '@/lib/api'
import { formatEventDateRange } from '@/lib/event-format'
import { useCurrentUser } from '@/lib/current-user'
import type { EventResponse } from '@/lib/api-types'

const statusLabel: Record<EventResponse['status'], string> = {
  DRAFT: 'Nháp',
  PUBLISHED: 'Sắp diễn ra',
  CANCELLED: 'Đã huỷ',
}

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user: me } = useCurrentUser()
  const [event, setEvent] = useState<EventResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [registering, setRegistering] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    api
      .get<EventResponse>(`/api/events/${id}`)
      .then(setEvent)
      .catch((err) => {
        if (err instanceof ApiError && (err.status === 404 || err.status === 403)) setNotFound(true)
      })
      .finally(() => setLoading(false))
  }, [id])

  async function toggleRegistration() {
    if (!event) return
    setRegistering(true)
    try {
      if (event.registered) {
        await api.delete(`/api/events/${event.id}/register`)
        setEvent({ ...event, registered: false, registrationCount: Math.max(event.registrationCount - 1, 0) })
      } else {
        await api.post(`/api/events/${event.id}/register`)
        setEvent({ ...event, registered: true, registrationCount: event.registrationCount + 1 })
      }
    } catch {
      // Lỗi (VD sự kiện không mở đăng ký) không cần xử lý đặc biệt — trạng thái giữ nguyên.
    } finally {
      setRegistering(false)
    }
  }

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-cream">
        <PageHeader title="Chi tiết sự kiện" />
        <div className="flex justify-center px-6 py-14 text-ink/60">Đang tải...</div>
      </div>
    )
  }

  if (notFound || !event) {
    return (
      <div className="w-full min-h-screen bg-cream">
        <PageHeader title="Chi tiết sự kiện" />
        <div className="flex justify-center px-6 py-14 text-ink/60">Không tìm thấy sự kiện này.</div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-cream">
      <PageHeader
        title="Chi tiết sự kiện"
        actions={
          <button
            onClick={() => setShareOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-md border-2 border-ink bg-white text-ink text-[13px] font-semibold"
          >
            <Share2 className="w-4 h-4" />
            Chia sẻ
          </button>
        }
      />

      <main className="flex justify-center px-6 sm:px-16 py-12">
        <div className="w-full max-w-[680px]">
          <EventBanner iconKey={event.iconKey} size="hero" className="mb-7" />

          <span className="-rotate-2 inline-block bg-neon border-2 border-ink text-ink text-[11px] font-bold px-3 py-1.5 rounded-full mb-4">
            {statusLabel[event.status]}
          </span>
          <h1 className="font-display font-bold text-[28px] text-ink mb-5">{event.title}</h1>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-6">
            <span className="text-[14px] font-semibold text-ink">
              {formatEventDateRange(event.startTime, event.endTime)}
            </span>
            {event.location ? <span className="text-[14px] font-semibold text-ink">{event.location}</span> : null}
          </div>

          {event.description ? (
            <p className="text-[15px] text-ink/70 leading-relaxed mb-7">{event.description}</p>
          ) : null}

          <div className="flex items-center gap-3 bg-white border-2 border-ink rounded-lg p-4 mb-7">
            <div className="w-11 h-11 rounded-full border-2 border-ink bg-cream flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-ink/60" />
            </div>
            <span className="text-[13px] font-semibold text-ink/60">
              {event.registrationCount} người đã đăng ký
            </span>
          </div>

          {me?.role === 'STUDENT' ? (
            <Button
              size="lg"
              variant={event.registered ? 'outline' : 'primary'}
              className="w-full flex items-center justify-center gap-2"
              onClick={toggleRegistration}
              disabled={event.status !== 'PUBLISHED' || registering}
            >
              {event.registered ? (
                <>
                  <Check className="w-4.5 h-4.5" />
                  Huỷ đăng ký
                </>
              ) : (
                'Đăng ký tham gia'
              )}
            </Button>
          ) : (
            <Button
              size="lg"
              variant="outline"
              className="w-full flex items-center justify-center gap-2 border-2 border-ink bg-white hover:bg-cream"
              onClick={() => navigate('/events/manage')}
            >
              <Settings2 className="w-4 h-4 text-magenta" />
              Quản lý sự kiện & danh sách tham gia
            </Button>
          )}
        </div>
      </main>

      {shareOpen ? <ShareEventModal event={event} onClose={() => setShareOpen(false)} /> : null}
    </div>
  )
}

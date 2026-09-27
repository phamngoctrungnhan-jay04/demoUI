import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, Check, Clock, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import { formatEventDateRange } from '@/lib/event-format'
import type { EventResponse } from '@/lib/api-types'

export function EventInviteCard({ eventId, className }: { eventId: string; className?: string }) {
  const [event, setEvent] = useState<EventResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    setLoading(true)
    api
      .get<EventResponse>(`/api/events/${eventId}`)
      .then(setEvent)
      .catch(() => setEvent(null))
      .finally(() => setLoading(false))
  }, [eventId])

  if (loading) {
    return (
      <div className={`w-[340px] bg-white border-2 border-ink rounded-lg p-4 animate-pulse ${className ?? ''}`}>
        <div className="h-4 bg-ink/10 rounded w-1/2 mb-3" />
        <div className="h-3 bg-ink/10 rounded w-3/4 mb-2" />
        <div className="h-8 bg-ink/10 rounded w-full mt-4" />
      </div>
    )
  }

  if (!event) {
    return (
      <div className={`w-[340px] bg-white border-2 border-ink rounded-lg p-4 ${className ?? ''}`}>
        <p className="text-[13px] text-ink/60">Không tìm thấy thông tin sự kiện (#{eventId})</p>
      </div>
    )
  }

  async function toggleRegistration() {
    if (!event) return
    setBusy(true)
    try {
      if (event.registered) {
        await api.delete(`/api/events/${event.id}/register`)
        setEvent({ ...event, registered: false, registrationCount: Math.max(event.registrationCount - 1, 0) })
      } else {
        await api.post(`/api/events/${event.id}/register`)
        setEvent({ ...event, registered: true, registrationCount: event.registrationCount + 1 })
      }
    } catch {
      // Giữ nguyên trạng thái nếu lỗi (VD sự kiện chưa mở đăng ký).
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={`w-[340px] bg-white border-2 border-ink rounded-lg overflow-hidden ${className ?? ''}`}>
      <div className="bg-magenta px-4 py-2 flex items-center gap-2">
        <CalendarDays className="w-4 h-4 text-white" />
        <span className="text-[11px] font-display font-bold text-white uppercase tracking-wide">
          Thiệp mời sự kiện
        </span>
      </div>
      <div className="p-4">
        <Link to={`/events/${event.id}`} className="font-display font-bold text-[17px] text-ink mb-2 block hover:text-magenta">
          {event.title}
        </Link>
        <p className="text-[13px] text-ink/60 flex items-center gap-1.5 mb-1">
          <Clock className="w-3.5 h-3.5" />
          {formatEventDateRange(event.startTime, event.endTime)}
        </p>
        {event.location ? (
          <p className="text-[13px] text-ink/60 flex items-center gap-1.5 mb-4">
            <MapPin className="w-3.5 h-3.5" />
            {event.location}
          </p>
        ) : null}
        <Button
          size="sm"
          variant={event.registered ? 'outline' : 'primary'}
          className="w-full flex items-center justify-center gap-1.5"
          disabled={busy || event.status !== 'PUBLISHED'}
          onClick={toggleRegistration}
        >
          {event.registered ? (
            <>
              <Check className="w-3.5 h-3.5" />
              Đã tham gia
            </>
          ) : (
            'Tham gia'
          )}
        </Button>
      </div>
    </div>
  )
}

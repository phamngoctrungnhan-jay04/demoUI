import { useEffect, useState } from 'react'
import { Plus, Users } from 'lucide-react'
import { AppHeader } from '@/components/app-header'
import { Eyebrow } from '@/components/ui/eyebrow'
import { Button } from '@/components/ui/button'
import { EventFormModal } from '@/components/event-form-modal'
import { ApiError, api } from '@/lib/api'
import { formatEventDateRange } from '@/lib/event-format'
import { useCurrentUser } from '@/lib/current-user'
import type { EventRegistrationResponse, EventResponse, EventStatus } from '@/lib/api-types'
import { cn } from '@/lib/utils'

const statusLabel: Record<EventStatus, string> = {
  DRAFT: 'Nháp',
  PUBLISHED: 'Công khai',
  CANCELLED: 'Đã huỷ',
}

export default function ManageEventsPage() {
  const { user: me } = useCurrentUser()
  const [events, setEvents] = useState<EventResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [forbidden, setForbidden] = useState(false)
  const [formTarget, setFormTarget] = useState<'new' | EventResponse | null>(null)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [registrations, setRegistrations] = useState<EventRegistrationResponse[]>([])

  function loadEvents() {
    setLoading(true)
    api
      .get<EventResponse[]>('/api/events/mine')
      .then((data) => {
        setEvents(data)
        setForbidden(false)
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 403) setForbidden(true)
      })
      .finally(() => setLoading(false))
  }

  useEffect(loadEvents, [])

  function handleSaved(saved: EventResponse) {
    setEvents((prev) => {
      const exists = prev.some((event) => event.id === saved.id)
      return exists ? prev.map((event) => (event.id === saved.id ? saved : event)) : [saved, ...prev]
    })
  }

  async function setStatus(event: EventResponse, status: EventStatus) {
    const updated = await api.put<EventResponse>(`/api/events/${event.id}`, {
      title: event.title,
      description: event.description,
      scope: event.scope,
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location,
      iconKey: event.iconKey,
      status,
    })
    handleSaved(updated)
  }

  async function toggleExpanded(event: EventResponse) {
    if (expandedId === event.id) {
      setExpandedId(null)
      return
    }
    setExpandedId(event.id)
    const list = await api.get<EventRegistrationResponse[]>(`/api/events/${event.id}/registrations`)
    setRegistrations(list)
  }

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-cream">
        <AppHeader />
        <div className="flex justify-center px-6 py-14 text-ink/60">Đang tải...</div>
      </div>
    )
  }

  if (forbidden || me?.role === 'STUDENT') {
    return (
      <div className="w-full min-h-screen bg-cream">
        <AppHeader />
        <main className="max-w-[860px] mx-auto px-6 sm:px-16 py-14">
          <p className="text-ink/60">
            Chỉ tài khoản STAFF/ADMIN (nhà trường) mới quản lý được sự kiện. Tài khoản của bạn hiện là học sinh.
          </p>
        </main>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-cream">
      <AppHeader />

      <main className="max-w-[860px] mx-auto px-6 sm:px-16 py-10">
        <div className="flex items-center justify-between mb-7 gap-4 flex-wrap">
          <div>
            <Eyebrow color="magenta" className="mb-1">
              {me?.fullName ? `Dành cho ${me.fullName}` : 'Quản lý sự kiện'}
            </Eyebrow>
            <h1 className="font-display font-bold text-[26px] text-ink">Sự kiện của tôi</h1>
          </div>
          <Button className="flex items-center gap-2" onClick={() => setFormTarget('new')}>
            <Plus className="w-4 h-4" />
            Tạo sự kiện mới
          </Button>
        </div>

        {events.length === 0 ? <p className="text-ink/50 text-[14px]">Bạn chưa tạo sự kiện nào.</p> : null}

        {events.map((event) => {
          const cancelled = event.status === 'CANCELLED'
          return (
            <div
              key={event.id}
              className={cn(
                'rounded-lg p-5 mb-4',
                cancelled ? 'bg-ink/5 border-2 border-ink/15' : 'bg-white border-2 border-ink',
              )}
            >
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <p
                    className={cn(
                      'font-display font-bold text-[16px]',
                      cancelled ? 'text-ink/50 line-through' : 'text-ink',
                    )}
                  >
                    {event.title}
                  </p>
                  <span
                    className={cn(
                      'text-[11px] font-bold px-2.5 py-1 rounded-full uppercase border-2',
                      event.status === 'PUBLISHED'
                        ? 'bg-neon border-ink text-ink'
                        : event.status === 'DRAFT'
                          ? 'border-ink/25 text-ink/50'
                          : 'border-ink/20 text-ink/40',
                    )}
                  >
                    {statusLabel[event.status]}
                  </span>
                </div>
                <span className={cn('text-[13px]', cancelled ? 'text-ink/35' : 'text-ink/50 font-semibold')}>
                  {event.registrationCount} đăng ký{cancelled ? ' (đã đóng)' : ''}
                </span>
              </div>

              <p className="text-[13px] text-ink/50 mb-4">
                {formatEventDateRange(event.startTime, event.endTime)}
                {event.location ? ` · ${event.location}` : ''}
              </p>

              {!cancelled ? (
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => setFormTarget(event)}>
                    Sửa
                  </Button>
                  {event.status === 'DRAFT' ? (
                    <Button size="sm" onClick={() => setStatus(event, 'PUBLISHED')}>
                      Đăng công khai
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1.5"
                        onClick={() => toggleExpanded(event)}
                      >
                        <Users className="w-3.5 h-3.5" />
                        Xem danh sách
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => setStatus(event, 'CANCELLED')}>
                        Huỷ
                      </Button>
                    </>
                  )}
                </div>
              ) : null}

              {expandedId === event.id ? (
                <div className="mt-4 pt-4 border-t border-ink/15 flex flex-col gap-2.5">
                  {registrations.length === 0 ? (
                    <p className="text-[13px] text-ink/40">Chưa có ai đăng ký.</p>
                  ) : (
                    registrations.map((reg) => (
                      <p key={reg.userId} className="text-[14px] font-semibold text-ink">
                        {reg.fullName ?? reg.studentCode}
                      </p>
                    ))
                  )}
                </div>
              ) : null}
            </div>
          )
        })}
      </main>

      {formTarget ? (
        <EventFormModal
          existingEvent={formTarget === 'new' ? undefined : formTarget}
          onClose={() => setFormTarget(null)}
          onSaved={handleSaved}
        />
      ) : null}
    </div>
  )
}

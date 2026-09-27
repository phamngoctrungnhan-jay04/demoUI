import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Clock, MapPin, Settings2 } from 'lucide-react'
import { AppHeader } from '@/components/app-header'
import { Eyebrow } from '@/components/ui/eyebrow'
import { EventBanner } from '@/components/event-banner'
import { api } from '@/lib/api'
import { formatEventDateRange } from '@/lib/event-format'
import { useCurrentUser } from '@/lib/current-user'
import type { EventResponse } from '@/lib/api-types'

export default function EventFeedPage() {
  const { user: me } = useCurrentUser()
  const [events, setEvents] = useState<EventResponse[]>([])
  const [tab, setTab] = useState<'all' | 'registered'>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get<EventResponse[]>('/api/events')
      .then(setEvents)
      .finally(() => setLoading(false))
  }, [])

  const isStaffOrAdmin = me?.role === 'STAFF' || me?.role === 'ADMIN'
  const myEvents = events.filter((e) => e.registered)
  const displayedEvents = tab === 'registered' ? myEvents : events

  return (
    <div className="w-full min-h-screen bg-cream">
      <AppHeader />

      <main className="max-w-[1000px] mx-auto px-6 sm:px-16 py-10">
        <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
          <div>
            <Eyebrow color="magenta" className="mb-1">
              Sự kiện trường
            </Eyebrow>
            <h1 className="font-display font-bold text-[26px] text-ink">Đừng bỏ lỡ hoạt động nào</h1>
          </div>
          {isStaffOrAdmin ? (
            <Link
              to="/events/manage"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-md border-2 border-ink bg-white text-ink text-[13px] font-semibold hover:bg-cream"
            >
              <Settings2 className="w-4 h-4 text-magenta" />
              Quản lý sự kiện của tôi
            </Link>
          ) : null}
        </div>

        {/* Tab switcher: Tất cả sự kiện vs Sự kiện đang tham gia */}
        <div className="flex items-center gap-2 mb-6 border-b-2 border-ink/15 pb-3">
          <button
            type="button"
            onClick={() => setTab('all')}
            className={`px-4 py-2 rounded-lg border-2 border-ink text-[13px] font-bold transition-colors flex items-center gap-2 ${
              tab === 'all'
                ? 'bg-ink text-neon shadow-[2px_2px_0px_#111111]'
                : 'bg-white text-ink hover:bg-cream'
            }`}
          >
            Tất cả sự kiện
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                tab === 'all' ? 'bg-neon/20 text-neon' : 'bg-cream text-ink/70 border border-ink/20'
              }`}
            >
              {events.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setTab('registered')}
            className={`px-4 py-2 rounded-lg border-2 border-ink text-[13px] font-bold transition-colors flex items-center gap-2 ${
              tab === 'registered'
                ? 'bg-ink text-neon shadow-[2px_2px_0px_#111111]'
                : 'bg-white text-ink hover:bg-cream'
            }`}
          >
            Sự kiện đang tham gia
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                tab === 'registered' ? 'bg-neon/20 text-neon' : 'bg-cream text-ink/70 border border-ink/20'
              }`}
            >
              {myEvents.length}
            </span>
          </button>
        </div>

        {loading ? <p className="text-ink/50 text-[14px]">Đang tải...</p> : null}
        {!loading && events.length === 0 ? (
          <p className="text-ink/50 text-[14px]">Chưa có sự kiện nào được công bố.</p>
        ) : null}

        {!loading && tab === 'registered' && myEvents.length === 0 && events.length > 0 ? (
          <div className="bg-white border-2 border-ink rounded-lg p-8 text-center max-w-[600px] mx-auto">
            <p className="font-display font-bold text-[17px] text-ink mb-2">Bạn chưa tham gia sự kiện nào</p>
            <p className="text-[14px] text-ink/60 mb-5">
              Khám phá danh sách sự kiện trường và bấm đăng ký để không bỏ lỡ hoạt động sôi nổi nào nhé!
            </p>
            <button
              type="button"
              onClick={() => setTab('all')}
              className="px-4 py-2 rounded-md border-2 border-ink bg-neon text-ink text-[13px] font-bold hover:bg-neon/90"
            >
              Xem tất cả sự kiện ({events.length})
            </button>
          </div>
        ) : null}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {displayedEvents.map((event) => (
            <Link
              key={event.id}
              to={`/events/${event.id}`}
              className="bg-white border-2 border-ink rounded-lg overflow-hidden block"
            >
              <EventBanner iconKey={event.iconKey} />
              <div className="p-5">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <p className="font-display font-bold text-[17px] text-ink">{event.title}</p>
                  {event.registered ? (
                    <span className="shrink-0 text-[11px] font-bold px-2 py-0.5 rounded border border-ink bg-neon text-ink">
                      Đã tham gia
                    </span>
                  ) : null}
                </div>
                <p className="text-[13px] text-ink/60 flex items-center gap-1.5 mb-1">
                  <Clock className="w-3.5 h-3.5" />
                  {formatEventDateRange(event.startTime, event.endTime)}
                </p>
                {event.location ? (
                  <p className="text-[13px] text-ink/60 flex items-center gap-1.5 mb-3">
                    <MapPin className="w-3.5 h-3.5" />
                    {event.location}
                  </p>
                ) : null}
                <span className="text-[12px] font-semibold text-ink/50">
                  {event.registrationCount} đã đăng ký
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}

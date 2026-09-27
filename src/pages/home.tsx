import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CalendarDays, RefreshCw } from 'lucide-react'
import { AppHeader } from '@/components/app-header'
import { Eyebrow } from '@/components/ui/eyebrow'
import { Button } from '@/components/ui/button'
import { AvatarIcon } from '@/components/ui/avatar-icon'
import { FriendActionButton } from '@/components/friend-action-button'
import { resolveAvatar } from '@/lib/avatar-icons'
import { ApiError, api } from '@/lib/api'
import { formatEventDateRange } from '@/lib/event-format'
import type {
  EventResponse,
  IcebreakerQuestionResponse,
  MatchSuggestionResponse,
} from '@/lib/api-types'

export default function HomePage() {
  const navigate = useNavigate()
  const [icebreaker, setIcebreaker] = useState<string>(
    'Nếu được đổi tên CLB trường thành 1 từ, bạn chọn từ gì?',
  )
  const [loadingIcebreaker, setLoadingIcebreaker] = useState(false)
  const [upcomingEvent, setUpcomingEvent] = useState<EventResponse | null>(null)
  const [suggestions, setSuggestions] = useState<MatchSuggestionResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Load matching suggestions
  useEffect(() => {
    api
      .get<MatchSuggestionResponse[]>('/api/matches/suggestions')
      .then(setSuggestions)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Không tải được gợi ý bạn bè.'))
      .finally(() => setLoading(false))
  }, [])

  // Load random icebreaker
  function fetchNextIcebreaker() {
    setLoadingIcebreaker(true)
    api
      .get<IcebreakerQuestionResponse>('/api/icebreakers/random')
      .then((res) => {
        if (res && res.content) setIcebreaker(res.content)
      })
      .catch(() => {})
      .finally(() => setLoadingIcebreaker(false))
  }

  useEffect(() => {
    fetchNextIcebreaker()
  }, [])

  // Load upcoming published event
  useEffect(() => {
    api
      .get<EventResponse[]>('/api/events')
      .then((events) => {
        if (events && events.length > 0) {
          setUpcomingEvent(events[0])
        }
      })
      .catch(() => {})
  }, [])

  return (
    <div className="w-full min-h-screen bg-cream">
      <AppHeader />

      <main className="flex flex-col lg:flex-row gap-8 px-6 sm:px-16 py-10">
        <div className="flex-1 max-w-[760px]">
          <Eyebrow color="magenta" className="mb-1">
            Gợi ý cho bạn
          </Eyebrow>
          <h1 className="font-display font-bold text-[26px] text-ink mb-6">
            Có thể bạn hợp gu với...
          </h1>

          {loading ? <p className="text-ink/50 text-[14px]">Đang tải gợi ý...</p> : null}
          {error ? <p className="text-magenta text-[14px] font-semibold">{error}</p> : null}
          {!loading && !error && suggestions.length === 0 ? (
            <p className="text-ink/50 text-[14px]">
              Chưa có gợi ý nào — thử thêm sở thích vào hồ sơ để tìm được bạn cùng gu nhé.
            </p>
          ) : null}

          <div className="flex flex-col gap-5">
            {suggestions.map((profile) => {
              const avatarStyle = resolveAvatar(profile.avatarUrl)
              return (
                <div
                  key={profile.userId}
                  className="flex items-center gap-4 bg-white border-2 border-ink rounded-lg p-5"
                >
                  <Link to={`/profile/${profile.userId}`} className="shrink-0">
                    <AvatarIcon icon={avatarStyle.icon} color={avatarStyle.color} size="lg" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3 mb-1.5">
                      <Link
                        to={`/profile/${profile.userId}`}
                        className="font-display font-bold text-[17px] text-ink hover:text-magenta"
                      >
                        {profile.fullName}{' '}
                        {profile.className ? (
                          <span className="font-normal text-ink/50 text-[14px]">
                            · Lớp {profile.className}
                          </span>
                        ) : null}
                      </Link>
                      {profile.matchedTagCount > 0 ? (
                        <span className="-rotate-2 bg-ink text-neon text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap">
                          {profile.matchedTagCount} tag trùng
                        </span>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {profile.matchedTags.slice(0, 3).map((tag) => (
                        <span
                          key={tag.id}
                          className="px-3 py-1 rounded-full bg-magenta text-white text-[12px] font-semibold"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <FriendActionButton userId={profile.userId} />
                    <Button size="sm" onClick={() => navigate(`/messages/${profile.userId}`)}>
                      Nhắn tin
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="w-full lg:w-[340px] shrink-0 flex flex-col gap-6">
          <div className="relative overflow-hidden bg-ink border-2 border-ink rounded-lg p-6">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  'radial-gradient(circle, rgba(212,255,63,0.14) 1.5px, transparent 1.5px)',
                backgroundSize: '16px 16px',
              }}
            />
            <div className="relative">
              <span className="-rotate-6 inline-block border border-dashed border-neon text-neon text-[11px] font-semibold uppercase tracking-wide px-3 py-1 rounded-full mb-4">
                Phá băng
              </span>
              <p className="font-display font-semibold text-[19px] text-white leading-snug mb-5">
                "{icebreaker}"
              </p>
              <button
                onClick={fetchNextIcebreaker}
                disabled={loadingIcebreaker}
                className="flex items-center gap-2 px-4 py-2 rounded-md border-2 border-neon text-neon font-semibold text-[13px] hover:bg-neon/10 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingIcebreaker ? 'animate-spin' : ''}`} />
                Câu khác
              </button>
            </div>
          </div>

          <div className="bg-white border-2 border-ink rounded-lg p-5">
            <Eyebrow color="cyan" className="mb-3">
              Sự kiện sắp tới
            </Eyebrow>
            {upcomingEvent ? (
              <>
                <p className="font-display font-bold text-[16px] text-ink mb-1">{upcomingEvent.title}</p>
                <p className="text-[13px] text-ink/60 mb-1">
                  {formatEventDateRange(upcomingEvent.startTime, upcomingEvent.endTime)}
                </p>
                {upcomingEvent.location ? (
                  <p className="text-[13px] text-ink/50 mb-3">{upcomingEvent.location}</p>
                ) : (
                  <div className="mb-2" />
                )}
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-semibold text-ink/50">
                    {upcomingEvent.registrationCount} đã đăng ký
                  </span>
                  <button
                    onClick={() => navigate(`/events/${upcomingEvent.id}`)}
                    className="text-[12px] font-display font-bold text-magenta flex items-center gap-1 hover:underline"
                  >
                    Xem chi tiết <CalendarDays className="w-3 h-3" />
                  </button>
                </div>
              </>
            ) : (
              <p className="text-[13px] text-ink/50">Hiện chưa có sự kiện nào sắp diễn ra.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

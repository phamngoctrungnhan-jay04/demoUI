import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AppHeader } from '@/components/app-header'
import { GroupBanner } from '@/components/group-banner'
import { Button } from '@/components/ui/button'
import { AvatarIcon } from '@/components/ui/avatar-icon'
import { FriendActionButton } from '@/components/friend-action-button'
import { resolveAvatar } from '@/lib/avatar-icons'
import { api } from '@/lib/api'
import type { StudyGroupResponse, UserSearchResponse } from '@/lib/api-types'

export default function SearchResultsPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const query = (searchParams.get('q') ?? '').trim()

  const [profiles, setProfiles] = useState<UserSearchResponse[]>([])
  const [groups, setGroups] = useState<StudyGroupResponse[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!query) {
      setProfiles([])
      setGroups([])
      return
    }
    setLoading(true)
    Promise.all([
      api.get<UserSearchResponse[]>(`/api/users/search?q=${encodeURIComponent(query)}`),
      api.get<StudyGroupResponse[]>(`/api/study-groups?q=${encodeURIComponent(query)}`),
    ])
      .then(([userResults, groupResults]) => {
        setProfiles(userResults)
        setGroups(groupResults)
      })
      .finally(() => setLoading(false))
  }, [query])

  async function toggleJoin(group: StudyGroupResponse) {
    if (group.joined) {
      await api.delete(`/api/study-groups/${group.id}/join`)
      setGroups((prev) =>
        prev.map((g) => (g.id === group.id ? { ...g, joined: false, memberCount: g.memberCount - 1 } : g)),
      )
    } else {
      await api.post(`/api/study-groups/${group.id}/join`)
      setGroups((prev) =>
        prev.map((g) => (g.id === group.id ? { ...g, joined: true, memberCount: g.memberCount + 1 } : g)),
      )
    }
  }

  const hasResults = profiles.length > 0 || groups.length > 0

  return (
    <div className="w-full min-h-screen bg-cream">
      <AppHeader />

      <main className="max-w-[820px] mx-auto px-6 sm:px-16 py-10">
        <p className="text-[14px] text-ink/50 mb-8">
          Kết quả cho "<span className="font-semibold text-ink">{query}</span>"
        </p>

        {loading ? <p className="text-ink/50 text-[14px]">Đang tìm...</p> : null}

        {!loading && (!query || !hasResults) ? (
          <p className="text-center text-ink/40 text-[14px] mt-10">Không tìm thấy kết quả phù hợp.</p>
        ) : null}

        {!loading && hasResults ? (
          <>
            {profiles.length > 0 ? (
              <section className="mb-10">
                <span className="flex items-center gap-1.5 text-[11px] font-display font-semibold text-ink uppercase tracking-wider mb-4">
                  <span className="w-2 h-2 bg-magenta" />
                  Học sinh ({profiles.length})
                </span>
                {profiles.map((profile) => {
                  const style = resolveAvatar(profile.avatarUrl)
                  return (
                    <div
                      key={profile.userId}
                      className="flex items-center gap-4 bg-white border-2 border-ink rounded-lg p-4 mb-3"
                    >
                      <AvatarIcon icon={style.icon} color={style.color} size="lg" />
                      <p className="flex-1 font-semibold text-[15px] text-ink">
                        {profile.fullName}{' '}
                        {profile.className ? (
                          <span className="font-normal text-ink/50 text-[13px]">· Lớp {profile.className}</span>
                        ) : null}
                      </p>
                      <Link to={`/profile/${profile.userId}`}>
                        <Button variant="outline" size="sm">
                          Xem hồ sơ
                        </Button>
                      </Link>
                      <FriendActionButton userId={profile.userId} />
                      <Button size="sm" onClick={() => navigate(`/messages/${profile.userId}`)}>
                        Nhắn tin
                      </Button>
                    </div>
                  )
                })}
              </section>
            ) : null}

            {groups.length > 0 ? (
              <section>
                <span className="flex items-center gap-1.5 text-[11px] font-display font-semibold text-ink uppercase tracking-wider mb-4">
                  <span className="w-2 h-2 bg-cyan" />
                  Nhóm học tập ({groups.length})
                </span>
                {groups.map((group) => (
                  <div
                    key={group.id}
                    className="flex items-center gap-4 bg-white border-2 border-ink rounded-lg p-4 mb-3"
                  >
                    <Link to={`/groups/${group.id}`} className="shrink-0">
                      <GroupBanner subject={group.subject} size="lg" />
                    </Link>
                    <Link to={`/groups/${group.id}`} className="flex-1">
                      <p className="font-display font-bold text-[15px] text-ink">{group.name}</p>
                      <p className="text-[13px] text-ink/55">
                        {group.subject} · {group.memberCount} thành viên
                      </p>
                    </Link>
                    {group.joined ? (
                      <span className="px-4 py-2 rounded-md border-2 border-ink bg-cream text-ink text-[13px] font-bold">
                        Đã tham gia
                      </span>
                    ) : (
                      <Button size="sm" onClick={() => toggleJoin(group)}>
                        Tham gia
                      </Button>
                    )}
                  </div>
                ))}
              </section>
            ) : null}
          </>
        ) : null}
      </main>
    </div>
  )
}

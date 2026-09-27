import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Check, Plus } from 'lucide-react'
import { AppHeader } from '@/components/app-header'
import { Eyebrow } from '@/components/ui/eyebrow'
import { Button } from '@/components/ui/button'
import { GroupBanner } from '@/components/group-banner'
import { api } from '@/lib/api'
import type { StudyGroupResponse } from '@/lib/api-types'

export default function GroupListPage() {
  const navigate = useNavigate()
  const [groups, setGroups] = useState<StudyGroupResponse[]>([])
  const [tab, setTab] = useState<'all' | 'mine'>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get<StudyGroupResponse[]>('/api/study-groups')
      .then(setGroups)
      .finally(() => setLoading(false))
  }, [])

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

  const myGroups = groups.filter((g) => g.joined)
  const displayedGroups = tab === 'mine' ? myGroups : groups

  return (
    <div className="w-full min-h-screen bg-cream">
      <AppHeader />

      <main className="max-w-[860px] mx-auto px-6 sm:px-16 py-10">
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <div>
            <Eyebrow color="cyan" className="mb-1">
              Nhóm học tập
            </Eyebrow>
            <h1 className="font-display font-bold text-[26px] text-ink">Ôn bài cùng nhau vui hơn</h1>
          </div>
          <Button className="flex items-center gap-2" onClick={() => navigate('/groups/new')}>
            <Plus className="w-4 h-4" />
            Tạo nhóm mới
          </Button>
        </div>

        {/* Tab switcher: Tất cả nhóm vs Nhóm của tôi */}
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
            Tất cả nhóm
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                tab === 'all' ? 'bg-neon/20 text-neon' : 'bg-cream text-ink/70 border border-ink/20'
              }`}
            >
              {groups.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setTab('mine')}
            className={`px-4 py-2 rounded-lg border-2 border-ink text-[13px] font-bold transition-colors flex items-center gap-2 ${
              tab === 'mine'
                ? 'bg-ink text-neon shadow-[2px_2px_0px_#111111]'
                : 'bg-white text-ink hover:bg-cream'
            }`}
          >
            Nhóm của tôi
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                tab === 'mine' ? 'bg-neon/20 text-neon' : 'bg-cream text-ink/70 border border-ink/20'
              }`}
            >
              {myGroups.length}
            </span>
          </button>
        </div>

        {loading ? <p className="text-ink/50 text-[14px]">Đang tải...</p> : null}
        {!loading && groups.length === 0 ? (
          <p className="text-ink/50 text-[14px]">Chưa có nhóm học tập nào — tạo nhóm đầu tiên nhé!</p>
        ) : null}

        {!loading && tab === 'mine' && myGroups.length === 0 && groups.length > 0 ? (
          <div className="bg-white border-2 border-ink rounded-lg p-8 text-center">
            <p className="font-display font-bold text-[17px] text-ink mb-2">Bạn chưa tham gia nhóm học tập nào</p>
            <p className="text-[14px] text-ink/60 mb-5">
              Khám phá danh sách nhóm để ôn bài cùng bạn bè, hoặc tự lập một nhóm mới nhé!
            </p>
            <Button variant="outline" size="sm" onClick={() => setTab('all')}>
              Khám phá tất cả các nhóm ({groups.length})
            </Button>
          </div>
        ) : null}

        <div className="flex flex-col gap-4">
          {displayedGroups.map((group) => (
            <div key={group.id} className="flex items-center gap-4 bg-white border-2 border-ink rounded-lg p-5">
              <Link to={`/groups/${group.id}`} className="shrink-0">
                <GroupBanner subject={group.subject} size="lg" />
              </Link>
              <Link to={`/groups/${group.id}`} className="flex-1 min-w-0">
                <p className="font-display font-bold text-[16px] text-ink">{group.name}</p>
                <p className="text-[13px] text-ink/55">
                  {group.subject} · {group.memberCount} thành viên
                </p>
              </Link>
              {group.joined ? (
                <span className="px-4 py-2 rounded-md border-2 border-ink bg-cream text-ink text-[13px] font-bold flex items-center gap-1.5 shrink-0">
                  <Check className="w-3.5 h-3.5" />
                  Đã tham gia
                </span>
              ) : (
                <Button size="sm" onClick={() => toggleJoin(group)} className="shrink-0">
                  Tham gia
                </Button>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

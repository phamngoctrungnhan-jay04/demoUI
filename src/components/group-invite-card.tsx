import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GroupBanner } from '@/components/group-banner'
import { api } from '@/lib/api'
import type { StudyGroupResponse } from '@/lib/api-types'

export function GroupInviteCard({ groupId, className }: { groupId: string; className?: string }) {
  const [group, setGroup] = useState<StudyGroupResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    setLoading(true)
    api
      .get<StudyGroupResponse>(`/api/study-groups/${groupId}`)
      .then(setGroup)
      .catch(() => setGroup(null))
      .finally(() => setLoading(false))
  }, [groupId])

  if (loading) {
    return (
      <div className={`w-[340px] bg-white border-2 border-ink rounded-lg p-4 animate-pulse ${className ?? ''}`}>
        <div className="h-4 bg-ink/10 rounded w-1/2 mb-3" />
        <div className="h-3 bg-ink/10 rounded w-3/4 mb-2" />
        <div className="h-8 bg-ink/10 rounded w-full mt-4" />
      </div>
    )
  }

  if (!group) {
    return (
      <div className={`w-[340px] bg-white border-2 border-ink rounded-lg p-4 ${className ?? ''}`}>
        <p className="text-[13px] text-ink/60">Không tìm thấy thông tin nhóm (#{groupId})</p>
      </div>
    )
  }

  async function handleJoin() {
    if (!group) return
    setBusy(true)
    try {
      await api.post(`/api/study-groups/${group.id}/join`)
      setGroup({ ...group, joined: true, memberCount: group.memberCount + 1 })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={`w-[340px] bg-white border-2 border-ink rounded-lg overflow-hidden ${className ?? ''}`}>
      <div className="bg-cyan px-4 py-2 flex items-center gap-2">
        <Users className="w-4 h-4 text-ink" />
        <span className="text-[11px] font-display font-bold text-ink uppercase tracking-wide">
          Thiệp mời nhóm học tập
        </span>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <GroupBanner subject={group.subject} />
          <div>
            <Link to={`/groups/${group.id}`} className="font-display font-bold text-[16px] text-ink hover:text-magenta">
              {group.name}
            </Link>
            <p className="text-[12px] text-ink/50">
              {group.subject} · {group.memberCount} thành viên
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant={group.joined ? 'outline' : 'primary'}
          className="w-full flex items-center justify-center gap-1.5"
          disabled={busy || group.joined}
          onClick={handleJoin}
        >
          {group.joined ? (
            <>
              <Check className="w-3.5 h-3.5" />
              Đã tham gia
            </>
          ) : (
            'Tham gia nhóm'
          )}
        </Button>
      </div>
    </div>
  )
}

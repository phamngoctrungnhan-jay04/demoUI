import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserPlus } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { AvatarIcon } from '@/components/ui/avatar-icon'
import { InviteFriendsModal } from '@/components/invite-friends-modal'
import { resolveAvatar } from '@/lib/avatar-icons'
import { ApiError, api } from '@/lib/api'
import type { StudyGroupResponse, UserSearchResponse } from '@/lib/api-types'

export default function CreateGroupPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [invitees, setInvitees] = useState<UserSearchResponse[]>([])
  const [inviteOpen, setInviteOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const canSubmit = name.trim().length > 0 && subject.trim().length > 0

  async function handleSubmit() {
    if (!canSubmit) return
    setSubmitting(true)
    setError('')
    try {
      const group = await api.post<StudyGroupResponse>('/api/study-groups', {
        name: name.trim(),
        subject: subject.trim(),
        description: description.trim() || null,
      })
      await Promise.all(
        invitees.map((user) =>
          api.post(`/api/threads/${user.userId}/group-invites`, { groupId: group.id }).catch(() => {}),
        ),
      )
      navigate(`/groups/${group.id}`)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Không thể tạo nhóm, thử lại sau.')
      setSubmitting(false)
    }
  }

  return (
    <div className="w-full min-h-screen bg-cream">
      <PageHeader title="Tạo nhóm học tập" />
      <main className="flex justify-center px-6 sm:px-16 py-12">
        <div className="w-full max-w-[640px] bg-white border-2 border-ink rounded-lg p-9">
          <h1 className="font-display font-bold text-[22px] text-ink mb-6">Thông tin nhóm</h1>

          <label className="block text-[13px] font-semibold text-ink mb-1.5">Tên nhóm</label>
          <Input
            placeholder="Ví dụ: Nhóm Toán 10A3"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mb-4"
          />

          <label className="block text-[13px] font-semibold text-ink mb-1.5">Môn học</label>
          <Input
            placeholder="Ví dụ: Toán học"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            className="mb-4"
          />

          <label className="block text-[13px] font-semibold text-ink mb-1.5">Mô tả ngắn</label>
          <Textarea
            rows={3}
            placeholder="Nhóm dành cho ai, mục tiêu ôn tập gì..."
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="mb-6"
          />

          <label className="block text-[13px] font-semibold text-ink mb-2">Mời bạn bè (không bắt buộc)</label>
          <div className="flex flex-wrap items-center gap-2 mb-8">
            {invitees.map((user) => {
              const style = resolveAvatar(user.avatarUrl)
              return (
                <span
                  key={user.userId}
                  className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full bg-magenta text-white text-[12px] font-semibold"
                >
                  <AvatarIcon icon={style.icon} color="ink" size="sm" className="w-5 h-5 border-0" />
                  {user.fullName}
                </span>
              )
            })}
            <button
              type="button"
              onClick={() => setInviteOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-md border-2 border-dashed border-ink/40 text-ink/60 text-[13px] font-semibold"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Mời thêm
            </button>
          </div>

          {error ? <p className="text-[13px] font-semibold text-magenta mb-4">{error}</p> : null}

          <Button size="lg" className="w-full" disabled={!canSubmit || submitting} onClick={handleSubmit}>
            {submitting ? 'Đang tạo...' : 'Tạo nhóm'}
          </Button>
        </div>
      </main>

      {inviteOpen ? (
        <InviteFriendsModal
          title="Mời bạn bè vào nhóm"
          subtitle={name ? `"${name}"` : undefined}
          onClose={() => setInviteOpen(false)}
          onConfirm={(selected) => {
            setInvitees(selected)
            setInviteOpen(false)
          }}
        />
      ) : null}
    </div>
  )
}

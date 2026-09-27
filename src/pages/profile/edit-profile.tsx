import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pencil } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Chip } from '@/components/ui/chip'
import { AvatarIcon } from '@/components/ui/avatar-icon'
import { avatarIconRegistry, resolveAvatar, type AvatarIconKey } from '@/lib/avatar-icons'
import { classOptionsFor, gradeOptions } from '@/lib/class-options'
import { ApiError, api } from '@/lib/api'
import { invalidateCurrentUser, useCurrentUser } from '@/lib/current-user'
import type { TagResponse, UserMeResponse } from '@/lib/api-types'

const avatarKeys = Object.keys(avatarIconRegistry) as AvatarIconKey[]

export default function EditProfilePage() {
  const navigate = useNavigate()
  const { user: me, loading: loadingMe } = useCurrentUser()

  const [avatar, setAvatar] = useState<AvatarIconKey>('cat')
  const [khoi, setKhoi] = useState<string>(gradeOptions[1])
  const [lop, setLop] = useState(classOptionsFor(gradeOptions[1])[0])
  const [bio, setBio] = useState('')
  const [profilePublic, setProfilePublic] = useState(true)
  const [tagOptions, setTagOptions] = useState<TagResponse[]>([])
  const [selectedTagIds, setSelectedTagIds] = useState<Set<number>>(new Set())
  const [pickingAvatar, setPickingAvatar] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    api.get<TagResponse[]>('/api/tags').then(setTagOptions).catch(() => {})
  }, [])

  useEffect(() => {
    if (!me || initialized) return
    if (me.avatarUrl && me.avatarUrl in avatarIconRegistry) setAvatar(me.avatarUrl as AvatarIconKey)
    if (me.gradeLevel && gradeOptions.includes(me.gradeLevel as (typeof gradeOptions)[number])) {
      setKhoi(me.gradeLevel)
    }
    if (me.className) setLop(me.className)
    setBio(me.bio ?? '')
    setProfilePublic(me.profilePublic)
    setSelectedTagIds(new Set(me.tags.map((tag) => tag.id)))
    setInitialized(true)
  }, [me, initialized])

  function handleGradeChange(nextGrade: string) {
    setKhoi(nextGrade)
    setLop(classOptionsFor(nextGrade)[0])
  }

  function toggleTag(tagId: number) {
    setSelectedTagIds((prev) => {
      const next = new Set(prev)
      if (next.has(tagId)) next.delete(tagId)
      else next.add(tagId)
      return next
    })
  }

  const activeAvatar = resolveAvatar(avatar)

  async function handleSave() {
    if (!me) return
    setSaving(true)
    setError('')
    try {
      await api.put<UserMeResponse>('/api/users/me/profile', {
        fullName: me.fullName ?? 'Học sinh',
        className: lop,
        gradeLevel: khoi,
        bio,
        avatarUrl: avatar,
        profilePublic,
        tagIds: Array.from(selectedTagIds),
      })
      invalidateCurrentUser()
      navigate('/profile/me')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Không thể lưu hồ sơ, thử lại sau.')
    } finally {
      setSaving(false)
    }
  }

  if (loadingMe || !initialized) {
    return (
      <div className="w-full min-h-screen bg-cream">
        <PageHeader title="Chỉnh sửa hồ sơ" />
        <div className="flex justify-center px-6 sm:px-16 py-14">
          <p className="text-ink/60">Đang tải...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-cream">
      <PageHeader title="Chỉnh sửa hồ sơ" />
      <main className="flex justify-center px-6 sm:px-16 py-12">
        <div className="w-full max-w-[640px] bg-white border-2 border-ink rounded-lg p-9">
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-3">
              <AvatarIcon icon={activeAvatar.icon} color={activeAvatar.color} size="xl" />
              <button
                onClick={() => setPickingAvatar((value) => !value)}
                className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-magenta border-2 border-ink flex items-center justify-center"
                aria-label="Đổi avatar"
              >
                <Pencil className="w-4 h-4 text-white" />
              </button>
            </div>
            <span className="text-[13px] font-semibold text-ink/60">Bấm để đổi avatar</span>

            {pickingAvatar ? (
              <div className="grid grid-cols-6 gap-3 mt-5 max-w-[480px] max-h-[280px] overflow-y-auto pr-1">
                {avatarKeys.map((key) => {
                  const style = avatarIconRegistry[key]
                  return (
                    <AvatarIcon
                      key={key}
                      icon={style.icon}
                      color={style.color}
                      selectable
                      selected={avatar === key}
                      onClick={() => {
                        setAvatar(key)
                        setPickingAvatar(false)
                      }}
                    />
                  )
                })}
              </div>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-[13px] font-semibold text-ink mb-1.5">Khối</label>
              <select
                value={khoi}
                onChange={(event) => handleGradeChange(event.target.value)}
                className="w-full px-3 py-3 rounded-md border-2 border-ink bg-white text-[15px] text-ink outline-none"
              >
                {gradeOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-ink mb-1.5">Lớp</label>
              <select
                value={lop}
                onChange={(event) => setLop(event.target.value)}
                className="w-full px-3 py-3 rounded-md border-2 border-ink bg-white text-[15px] text-ink outline-none"
              >
                {classOptionsFor(khoi).map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>

          <label className="block text-[13px] font-semibold text-ink mb-1.5">Giới thiệu ngắn</label>
          <Textarea
            rows={3}
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            className="mb-6"
          />

          <label className="block text-[13px] font-semibold text-ink mb-2">
            Sở thích, môn học & CLB
          </label>
          <div className="flex flex-wrap gap-2.5 mb-6">
            {tagOptions.map((tag) => (
              <Chip key={tag.id} selected={selectedTagIds.has(tag.id)} onClick={() => toggleTag(tag.id)}>
                {tag.name}
              </Chip>
            ))}
          </div>

          <label className="flex items-center justify-between gap-4 bg-cream border-2 border-ink/15 rounded-md p-4 mb-8">
            <div>
              <p className="font-semibold text-[14px] text-ink">Hồ sơ công khai</p>
              <p className="text-[12px] text-ink/50">Tắt để chỉ mình bạn xem được hồ sơ này.</p>
            </div>
            <input
              type="checkbox"
              checked={profilePublic}
              onChange={(event) => setProfilePublic(event.target.checked)}
              className="w-5 h-5 accent-magenta shrink-0"
            />
          </label>

          {error ? <p className="text-[13px] font-semibold text-magenta mb-4">{error}</p> : null}

          <div className="flex items-center gap-3">
            <Button size="lg" className="flex-1" disabled={saving} onClick={handleSave}>
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate(-1)}>
              Huỷ
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}

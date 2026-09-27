import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Chip } from '@/components/ui/chip'
import { AvatarIcon } from '@/components/ui/avatar-icon'
import { avatarIconRegistry, type AvatarIconKey } from '@/lib/avatar-icons'
import { classOptionsFor, gradeOptions } from '@/lib/class-options'
import { ApiError, api, isLoggedIn } from '@/lib/api'
import type { TagResponse, UserMeResponse } from '@/lib/api-types'
import { cn } from '@/lib/utils'

const avatarKeys = Object.keys(avatarIconRegistry) as AvatarIconKey[]

const steps = ['Cơ bản', 'Avatar', 'Sở thích']

export default function OnboardingPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [khoi, setKhoi] = useState<string>(gradeOptions[1])
  const [lop, setLop] = useState(classOptionsFor(gradeOptions[1])[0])
  const [bio, setBio] = useState('')
  const [avatar, setAvatar] = useState<AvatarIconKey | null>(null)
  const [tagOptions, setTagOptions] = useState<TagResponse[]>([])
  const [selectedTagIds, setSelectedTagIds] = useState<Set<number>>(new Set())
  const [loadingTags, setLoadingTags] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login')
      return
    }
    api
      .get<TagResponse[]>('/api/tags')
      .then(setTagOptions)
      .catch(() => setError('Không tải được danh sách sở thích, thử tải lại trang.'))
      .finally(() => setLoadingTags(false))
  }, [navigate])

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

  const canContinue = step === 0 ? khoi && lop : step === 1 ? avatar !== null : selectedTagIds.size > 0

  async function handlePrimaryAction() {
    if (step < 2) {
      setStep((value) => value + 1)
      return
    }

    setSubmitting(true)
    setError('')
    try {
      const fullName = sessionStorage.getItem('khd_pending_full_name') ?? ''
      const me = await api.get<UserMeResponse>('/api/users/me')
      await api.put('/api/users/me/profile', {
        fullName: fullName || me.fullName || 'Học sinh',
        className: lop,
        gradeLevel: khoi,
        bio,
        avatarUrl: avatar,
        profilePublic: true,
        tagIds: Array.from(selectedTagIds),
      })
      sessionStorage.removeItem('khd_pending_full_name')
      navigate('/home')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Không thể lưu hồ sơ, thử lại sau.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="w-full min-h-screen bg-cream flex flex-col items-center py-14 px-6">
      <Logo className="mb-8" />

      <div className="w-full max-w-[760px] bg-white border-2 border-ink rounded-lg p-10">
        <h2 className="font-display font-bold text-[26px] text-ink text-center mb-1">
          Tạo hồ sơ của bạn
        </h2>
        <p className="text-center text-ink/70 text-[15px] mb-8">
          Chỉ mất một phút — để các bạn cùng sở thích dễ tìm thấy bạn hơn.
        </p>

        <div className="flex gap-2 mb-1">
          {steps.map((_, index) => (
            <div
              key={index}
              className={cn(
                'h-2 flex-1 rounded-full',
                index <= step ? 'bg-magenta' : 'bg-neon/40',
              )}
            />
          ))}
        </div>
        <div className="flex justify-between text-[12px] font-semibold text-ink/60 mb-10">
          {steps.map((label, index) => (
            <span key={label} className={index === step ? 'text-ink' : undefined}>
              Bước {index + 1} · {label}
            </span>
          ))}
        </div>

        {step === 0 ? (
          <section>
            <h3 className="font-display font-semibold text-[18px] text-ink mb-4">Thông tin cơ bản</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
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
              placeholder="Mình thích..."
              value={bio}
              onChange={(event) => setBio(event.target.value)}
            />
          </section>
        ) : null}

        {step === 1 ? (
          <section>
            <h3 className="font-display font-semibold text-[18px] text-ink mb-1">Chọn hình đại diện</h3>
            <p className="text-[13px] text-ink/60 mb-4">
              Một icon riêng đại diện cho bạn — không dùng ảnh thật.
            </p>
            <div className="grid grid-cols-6 gap-4 max-w-[560px] max-h-[280px] overflow-y-auto pr-1">
              {avatarKeys.map((key) => {
                const option = avatarIconRegistry[key]
                return (
                  <AvatarIcon
                    key={key}
                    icon={option.icon}
                    color={option.color}
                    selectable
                    selected={avatar === key}
                    onClick={() => setAvatar(key)}
                  />
                )
              })}
            </div>
          </section>
        ) : null}

        {step === 2 ? (
          <section>
            <h3 className="font-display font-semibold text-[18px] text-ink mb-1">
              Sở thích, môn học & CLB
            </h3>
            <p className="text-[13px] text-ink/60 mb-4">
              Chọn nhiều tag — càng nhiều, càng dễ tìm bạn chung sở thích.
            </p>
            {loadingTags ? (
              <p className="text-[13px] text-ink/50">Đang tải danh sách...</p>
            ) : (
              <div className="flex flex-wrap gap-2.5">
                {tagOptions.map((tag) => (
                  <Chip key={tag.id} selected={selectedTagIds.has(tag.id)} onClick={() => toggleTag(tag.id)}>
                    {tag.name}
                  </Chip>
                ))}
              </div>
            )}
          </section>
        ) : null}

        {error ? <p className="text-[13px] font-semibold text-magenta mt-6">{error}</p> : null}

        <div className="flex items-center gap-3 mt-10">
          {step > 0 ? (
            <Button variant="outline" size="lg" onClick={() => setStep((value) => value - 1)}>
              Quay lại
            </Button>
          ) : null}
          <Button
            size="lg"
            className="flex-1"
            disabled={!canContinue || submitting}
            onClick={handlePrimaryAction}
          >
            {submitting ? 'Đang lưu...' : step < 2 ? 'Tiếp tục' : 'Hoàn tất tạo hồ sơ'}
          </Button>
        </div>
      </div>
    </div>
  )
}

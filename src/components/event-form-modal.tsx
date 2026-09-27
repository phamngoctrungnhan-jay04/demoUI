import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { eventBannerStyles } from '@/components/event-banner'
import { ApiError, api } from '@/lib/api'
import { fromDateTimeLocalValue, toDateTimeLocalValue } from '@/lib/event-format'
import type { EventIconKey, EventResponse, EventScope, EventStatus } from '@/lib/api-types'
import { cn } from '@/lib/utils'

const iconOptions: EventIconKey[] = ['PARTY', 'TROPHY', 'MUSIC', 'CODE']

const scopeOptions: { value: EventScope; label: string }[] = [
  { value: 'SCHOOL', label: 'Toàn trường' },
  { value: 'CLASS', label: 'Theo lớp' },
  { value: 'CLUB', label: 'Theo CLB' },
]

export function EventFormModal({
  existingEvent,
  onClose,
  onSaved,
}: {
  existingEvent?: EventResponse
  onClose: () => void
  onSaved: (event: EventResponse) => void
}) {
  const [title, setTitle] = useState(existingEvent?.title ?? '')
  const [description, setDescription] = useState(existingEvent?.description ?? '')
  const [scope, setScope] = useState<EventScope>(existingEvent?.scope ?? 'SCHOOL')
  const [startTimeLocal, setStartTimeLocal] = useState(toDateTimeLocalValue(existingEvent?.startTime))
  const [endTimeLocal, setEndTimeLocal] = useState(toDateTimeLocalValue(existingEvent?.endTime))
  const [location, setLocation] = useState(existingEvent?.location ?? '')
  const [iconKey, setIconKey] = useState<EventIconKey>(existingEvent?.iconKey ?? 'PARTY')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const canSubmit = title.trim().length > 0 && startTimeLocal.length > 0

  async function save(desiredStatus: EventStatus) {
    if (!canSubmit) return
    setSaving(true)
    setError('')
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        scope,
        startTime: fromDateTimeLocalValue(startTimeLocal),
        endTime: endTimeLocal ? fromDateTimeLocalValue(endTimeLocal) : null,
        location: location.trim() || null,
        iconKey,
      }

      let result: EventResponse
      if (existingEvent) {
        result = await api.put<EventResponse>(`/api/events/${existingEvent.id}`, {
          ...payload,
          status: desiredStatus,
        })
      } else {
        const created = await api.post<EventResponse>('/api/events', payload)
        result =
          desiredStatus === 'PUBLISHED'
            ? await api.put<EventResponse>(`/api/events/${created.id}`, { ...payload, status: 'PUBLISHED' })
            : created
      }
      onSaved(result)
      onClose()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Không thể lưu sự kiện, thử lại sau.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-ink/70 flex items-center justify-center py-16 px-4 overflow-y-auto">
      <div className="w-full max-w-[600px] bg-white border-2 border-ink rounded-lg p-8 my-auto">
        <div className="flex items-start justify-between mb-6">
          <h2 className="font-display font-bold text-[22px] text-ink">
            {existingEvent ? 'Sửa sự kiện' : 'Tạo sự kiện mới'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border-2 border-ink bg-white flex items-center justify-center"
            aria-label="Đóng"
          >
            <X className="w-4 h-4 text-ink" />
          </button>
        </div>

        <label className="block text-[13px] font-semibold text-ink mb-1.5">Tên sự kiện</label>
        <Input
          placeholder="Ví dụ: Đêm nhạc acoustic"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="mb-4"
        />

        <label className="block text-[13px] font-semibold text-ink mb-1.5">Mô tả</label>
        <Textarea
          rows={3}
          placeholder="Giới thiệu ngắn về sự kiện..."
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="mb-4"
        />

        <label className="block text-[13px] font-semibold text-ink mb-1.5">Phạm vi</label>
        <select
          value={scope}
          onChange={(event) => setScope(event.target.value as EventScope)}
          className="w-full px-3 py-3 mb-4 rounded-md border-2 border-ink bg-white text-[15px] text-ink outline-none"
        >
          {scopeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-[13px] font-semibold text-ink mb-1.5">Bắt đầu</label>
            <input
              type="datetime-local"
              value={startTimeLocal}
              onChange={(event) => setStartTimeLocal(event.target.value)}
              className="w-full px-3 py-2.5 rounded-md border-2 border-ink bg-white text-[14px] text-ink outline-none"
            />
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-ink mb-1.5">Kết thúc (tuỳ chọn)</label>
            <input
              type="datetime-local"
              value={endTimeLocal}
              onChange={(event) => setEndTimeLocal(event.target.value)}
              className="w-full px-3 py-2.5 rounded-md border-2 border-ink bg-white text-[14px] text-ink outline-none"
            />
          </div>
        </div>

        <label className="block text-[13px] font-semibold text-ink mb-1.5">Địa điểm</label>
        <Input
          placeholder="Sân trường"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          className="mb-5"
        />

        <label className="block text-[13px] font-semibold text-ink mb-2">Màu banner</label>
        <div className="flex items-center gap-3 mb-6">
          {iconOptions.map((option) => {
            const style = eventBannerStyles[option]
            const selected = iconKey === option
            return (
              <button
                key={option}
                type="button"
                onClick={() => setIconKey(option)}
                className={cn(
                  'w-11 h-11 rounded-md flex items-center justify-center',
                  style.bg,
                  selected ? 'border-2 border-ink' : 'border-2 border-ink/20',
                )}
              >
                {selected ? <Check className={cn('w-4 h-4', style.fg)} /> : null}
              </button>
            )
          })}
        </div>

        <div className="bg-cream border-2 border-ink/15 rounded-md p-4 mb-6">
          <p className="text-[13px] text-ink/60">
            <span className="font-semibold text-ink">Nháp:</span> chỉ bạn thấy, lưu để hoàn thiện sau.{' '}
            <span className="font-semibold text-ink">Công khai:</span> hiển thị ngay trên bảng tin, học sinh có
            thể đăng ký.
          </p>
        </div>

        {error ? <p className="text-[13px] font-semibold text-magenta mb-4">{error}</p> : null}

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="lg"
            className="flex-1"
            disabled={!canSubmit || saving}
            onClick={() => save(existingEvent?.status === 'CANCELLED' ? 'CANCELLED' : existingEvent ? existingEvent.status : 'DRAFT')}
          >
            Lưu nháp
          </Button>
          <Button size="lg" className="flex-1" disabled={!canSubmit || saving} onClick={() => save('PUBLISHED')}>
            Đăng công khai
          </Button>
        </div>
      </div>
    </div>
  )
}

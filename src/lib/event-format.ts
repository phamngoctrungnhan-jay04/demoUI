const weekdayFormatter = new Intl.DateTimeFormat('vi-VN', { weekday: 'long' })
const dateFormatter = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit' })
const timeFormatter = new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' })

/** Backend trả LocalDateTime dạng "2026-10-01T16:00:00" (không có timezone) — parse trực
 * tiếp bằng `new Date()` vẫn đúng vì không có offset để lệch giờ. */
export function formatEventDateRange(startTime: string, endTime?: string | null): string {
  const start = new Date(startTime)
  const weekday = weekdayFormatter.format(start)
  const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1)
  const datePart = `${capitalizedWeekday}, ${dateFormatter.format(start)}`
  const startTimePart = timeFormatter.format(start)

  if (!endTime) return `${datePart} · ${startTimePart}`

  const end = new Date(endTime)
  return `${datePart} · ${startTimePart} – ${timeFormatter.format(end)}`
}

/** Chuyển ISO LocalDateTime của backend sang giá trị dùng được cho <input type="datetime-local">. */
export function toDateTimeLocalValue(isoString: string | null | undefined): string {
  if (!isoString) return ''
  return isoString.slice(0, 16)
}

/** Chuyều ngược: giá trị "YYYY-MM-DDTHH:mm" từ input về LocalDateTime backend chấp nhận. */
export function fromDateTimeLocalValue(value: string): string {
  return value.length === 16 ? `${value}:00` : value
}

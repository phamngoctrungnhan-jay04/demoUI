import { BookOpen, FlaskConical, Languages, Sigma, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const styles: { icon: LucideIcon; bg: string; fg: string }[] = [
  { icon: Sigma, bg: 'bg-magenta', fg: 'text-white' },
  { icon: FlaskConical, bg: 'bg-cyan', fg: 'text-ink' },
  { icon: BookOpen, bg: 'bg-ink', fg: 'text-neon' },
  { icon: Languages, bg: 'bg-neon', fg: 'text-ink' },
]

/** Nhóm học tập không có field icon/màu riêng trong DB — chọn kiểu hiển thị ổn định dựa
 * trên tên môn học (cùng 1 môn luôn ra cùng 1 màu), thuần để phân biệt trực quan, không
 * phải dữ liệu được lưu hay lựa chọn của người dùng. */
function styleForSubject(subject: string) {
  let hash = 0
  for (let i = 0; i < subject.length; i++) hash = (hash * 31 + subject.charCodeAt(i)) >>> 0
  return styles[hash % styles.length]
}

export function GroupBanner({
  subject,
  size = 'md',
  className,
}: {
  subject: string
  size?: 'md' | 'lg'
  className?: string
}) {
  const style = styleForSubject(subject)
  const Icon = style.icon
  return (
    <div
      className={cn(
        'shrink-0 rounded-lg border-2 border-ink flex items-center justify-center',
        size === 'lg' ? 'w-14 h-14' : 'w-11 h-11',
        style.bg,
        className,
      )}
    >
      <Icon className={cn(size === 'lg' ? 'w-6.5 h-6.5' : 'w-5 h-5', style.fg)} />
    </div>
  )
}

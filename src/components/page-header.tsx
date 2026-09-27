import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export function PageHeader({ title, actions }: { title: string; actions?: ReactNode }) {
  const navigate = useNavigate()
  return (
    <header className="flex items-center gap-4 px-6 sm:px-16 py-4 border-b-2 border-ink bg-cream">
      <button
        onClick={() => navigate(-1)}
        className="w-10 h-10 rounded-full border-2 border-ink bg-white flex items-center justify-center shrink-0"
        aria-label="Quay lại"
      >
        <ArrowLeft className="w-4.5 h-4.5 text-ink" />
      </button>
      <span className="font-display font-semibold text-[16px] text-ink flex-1">{title}</span>
      {actions}
    </header>
  )
}

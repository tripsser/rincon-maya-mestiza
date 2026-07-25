import type { ReactNode } from 'react'

export function StatusBadge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode
  tone?: 'green' | 'neutral' | 'violet' | 'blue' | 'red'
}) {
  const toneClass = {
    blue: 'border-norix-blue/24 bg-norix-blue/10 text-norix-blue',
    green: 'border-norix-green/24 bg-norix-green/10 text-norix-green',
    neutral: 'border-white/10 bg-white/[0.04] text-white/46',
    red: 'border-red-400/24 bg-red-400/10 text-red-200',
    violet: 'border-norix-violet/24 bg-norix-violet/10 text-norix-violet',
  }[tone]

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${toneClass}`}>
      {children}
    </span>
  )
}

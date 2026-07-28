import type { ReactNode } from 'react'
import { Copy } from 'lucide-react'

export function SummaryCard({
  icon,
  label,
  value,
  tone = 'blue',
}: {
  icon: ReactNode
  label: string
  value: string
  tone?: 'blue' | 'green' | 'violet'
}) {
  const toneClass =
    tone === 'green'
      ? 'text-norix-green bg-norix-green/12'
      : tone === 'violet'
        ? 'text-norix-violet bg-norix-violet/12'
        : 'text-norix-blue bg-norix-blue/12'

  return (
    <article className="glass-card p-4">
      <div className="flex items-center gap-3">
        <span className={`grid h-10 w-10 place-items-center rounded-md ${toneClass}`}>{icon}</span>
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-white/38">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
        </div>
      </div>
    </article>
  )
}

export function InfoRow({
  copy = false,
  icon,
  label,
  tone = 'default',
  value,
}: {
  copy?: boolean
  icon?: ReactNode
  label: string
  tone?: 'default' | 'green' | 'muted'
  value?: string | null
}) {
  const displayValue = value || 'No registrado'
  const valueClass =
    tone === 'green'
      ? 'text-norix-green'
      : tone === 'muted'
        ? 'text-white/44'
        : 'text-white/72'

  return (
    <div className="grid gap-1 sm:grid-cols-[12rem_minmax(0,1fr)] sm:gap-4">
      <dt className="text-sm font-semibold text-white/70">{label}</dt>
      <dd className={`flex min-w-0 items-center gap-2 text-sm ${valueClass}`}>
        {icon && <span className="shrink-0 text-white/36">{icon}</span>}
        <span className="min-w-0 truncate">{displayValue}</span>
        {copy && value && (
          <button className="text-norix-blue hover:text-white" title="Copiar" type="button">
            <Copy size={15} />
          </button>
        )}
      </dd>
    </div>
  )
}

export function FormField({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string
  value?: string
  placeholder: string
  onChange: (value: string) => void
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-white/72">{label}</span>
      <input
        className="h-11 rounded-md border border-white/10 bg-white/[0.045] px-3 text-sm text-white outline-none focus:border-norix-green/60"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value ?? ''}
      />
    </label>
  )
}

export function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-2">
      <span className="text-sm font-medium text-white/72">{label}</span>
      <div className="flex h-11 items-center rounded-md border border-white/10 bg-white/[0.025] px-3 text-sm font-semibold text-norix-green">
        {value}
      </div>
    </div>
  )
}

export function PlaceholderPanel({ icon, text, title }: { icon: ReactNode; text: string; title: string }) {
  return (
    <article className="glass-panel p-5">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-md bg-norix-blue/12 text-norix-blue">{icon}</span>
        <div>
          <h2 className="text-sm font-semibold text-white">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-white/52">{text}</p>
        </div>
      </div>
    </article>
  )
}

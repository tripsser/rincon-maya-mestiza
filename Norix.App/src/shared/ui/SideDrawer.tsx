import type { ReactNode } from 'react'
import { X } from 'lucide-react'

export function SideDrawer({
  children,
  eyebrow,
  onClose,
  subtitle,
  title,
}: {
  children: ReactNode
  eyebrow: string
  onClose: () => void
  subtitle?: string
  title: string
}) {
  return (
    <div className="side-drawer-backdrop fixed inset-0 z-20 bg-black/45 backdrop-blur-sm">
      <aside className="side-drawer glass-panel ml-auto flex h-full w-full max-w-xl flex-col rounded-none border-y-0 border-r-0 p-5">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-norix-green">{eyebrow}</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">{title}</h2>
            {subtitle && <p className="mt-1 text-sm text-white/52">{subtitle}</p>}
          </div>
          <button className="glass-button grid h-9 w-9 place-items-center rounded-md" onClick={onClose} type="button">
            <X size={17} />
          </button>
        </div>

        {children}
      </aside>
    </div>
  )
}

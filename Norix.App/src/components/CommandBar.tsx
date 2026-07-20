import type { ReactNode } from 'react'
import { Download, Plus, RefreshCw, Settings } from 'lucide-react'

export function CommandBar({
  isRefreshing = false,
  onAdd,
  onRefresh,
}: {
  isRefreshing?: boolean
  onAdd?: () => void
  onRefresh?: () => void
}) {
  return (
    <div className="glass-toolbar flex flex-wrap items-center gap-1 rounded-lg p-1">
      <CommandButton icon={<Plus size={15} />} onClick={onAdd} primary>
        Agregar
      </CommandButton>
      <CommandButton icon={<Settings size={15} />}>Administrar</CommandButton>
      <CommandButton
        icon={<RefreshCw className={isRefreshing ? 'animate-spin' : undefined} size={15} />}
        onClick={onRefresh}
      >
        Actualizar
      </CommandButton>
      <CommandButton icon={<Download size={15} />}>Exportar</CommandButton>
    </div>
  )
}

function CommandButton({
  children,
  icon,
  onClick,
  primary = false,
}: {
  children: ReactNode
  icon: ReactNode
  onClick?: () => void
  primary?: boolean
}) {
  return (
    <button
      className={`inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm transition ${
        primary
          ? 'bg-gradient-to-r from-norix-green to-norix-blue font-semibold text-white'
          : 'text-white/72 hover:bg-white/[0.07] hover:text-white'
      }`}
      onClick={onClick}
      type="button"
    >
      <span className={primary ? 'text-white' : 'text-norix-blue'}>{icon}</span>
      {children}
    </button>
  )
}

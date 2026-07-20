import type { ReactNode } from 'react'
import { Download, MessageSquareText, Plus, RefreshCw, Settings } from 'lucide-react'

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
    <div className="resource-commandbar flex flex-wrap items-center gap-1">
      <CommandButton icon={<Plus size={15} />} onClick={onAdd} primary>
        Agregar
      </CommandButton>
      <CommandButton icon={<Settings size={15} />}>Administrar vistas</CommandButton>
      <CommandButton
        icon={<RefreshCw className={isRefreshing ? 'animate-spin' : undefined} size={15} />}
        onClick={onRefresh}
      >
        Actualizar
      </CommandButton>
      <CommandButton icon={<Download size={15} />}>Exportar</CommandButton>
      <CommandButton icon={<MessageSquareText size={15} />}>Comentarios</CommandButton>
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
      className={`resource-command flex h-8 items-center gap-2 px-2.5 text-sm transition ${
        primary
          ? 'font-semibold text-white'
          : 'text-white/72 hover:text-white'
      }`}
      onClick={onClick}
      type="button"
    >
      <span className="text-norix-blue">{icon}</span>
      {children}
    </button>
  )
}

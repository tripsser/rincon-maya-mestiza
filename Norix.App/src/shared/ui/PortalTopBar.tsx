import { Bell, CircleHelp, Search, Settings } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'

export function PortalTopBar({ showPortalButton = true }: { showPortalButton?: boolean }) {
  return (
    <header className="glass-topbar relative flex h-12 items-center justify-end px-5 lg:px-6">
      <label className="glass-button absolute left-1/2 hidden h-8 w-[34rem] max-w-[48vw] -translate-x-1/2 items-center gap-2 rounded-md px-3 text-xs text-white/38 lg:flex">
        <Search size={14} />
        <span className="sr-only">Buscar recursos, servicios y documentos</span>
        <input
          aria-label="Buscar recursos, servicios y documentos"
          className="w-full border-0 bg-transparent text-xs text-white outline-none placeholder:text-white/34"
          placeholder="Buscar recursos, servicios y documentos (Ctrl+/)"
        />
      </label>
      <div className="flex items-center gap-4 text-white/56">
        <button aria-label="Buscar" className="grid h-8 w-8 place-items-center rounded-md hover:bg-white/[0.05] hover:text-white lg:hidden" type="button">
          <Search size={17} />
        </button>
        <button aria-label="Notificaciones" className="grid h-8 w-8 place-items-center rounded-md hover:bg-white/[0.05] hover:text-white" type="button">
          <Bell size={17} />
        </button>
        <button aria-label="Configuracion" className="grid h-8 w-8 place-items-center rounded-md hover:bg-white/[0.05] hover:text-white" type="button">
          <Settings size={17} />
        </button>
        <button aria-label="Ayuda" className="grid h-8 w-8 place-items-center rounded-md hover:bg-white/[0.05] hover:text-white" type="button">
          <CircleHelp size={17} />
        </button>
        <ThemeToggle />
        {showPortalButton && (
          <button className="glass-button flex items-center gap-2 rounded-md px-3 py-1.5 text-xs text-white/72" type="button">
            <span className="grid h-5 w-5 place-items-center rounded bg-norix-blue/20 text-norix-blue">G</span>
            Portal global
          </button>
        )}
      </div>
    </header>
  )
}

import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import {
  Activity,
  Building2,
  CircleHelp,
  FileText,
  Fingerprint,
  Home,
  KeyRound,
  Landmark,
  MapPin,
  MoreHorizontal,
  Pin,
  PinOff,
  Settings,
  ShieldCheck,
  Store,
  Users,
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

const pinStorageKey = 'norix.tenantSidebarPinned'

const groups = [
  {
    title: 'Inicio',
    items: [{ label: 'Inicio', icon: Home, to: '/contexto' }],
  },
  {
    title: 'Directorio',
    items: [
      { label: 'Restaurantes / Marcas', icon: Store, to: '/tenant/restaurantes' },
      { label: 'Unidades operativas', icon: Building2 },
      { label: 'Entidades fiscales', icon: Landmark },
      { label: 'Direcciones', icon: MapPin },
    ],
  },
  {
    title: 'Acceso',
    items: [
      { label: 'Usuarios', icon: Users },
      { label: 'Roles', icon: ShieldCheck },
      { label: 'Permisos', icon: KeyRound },
      { label: 'Asignaciones', icon: Fingerprint },
    ],
  },
  {
    title: 'Actividad',
    items: [
      { label: 'Auditoria', icon: Activity },
      { label: 'Sesiones', icon: FileText },
    ],
  },
  {
    title: 'Configuracion',
    items: [
      { label: 'General', icon: Settings },
      { label: 'Seguridad', icon: ShieldCheck },
      { label: 'Integraciones', icon: KeyRound },
    ],
  },
]

export function TenantSidebar() {
  const location = useLocation()
  const [isPinned, setIsPinned] = useState(() => localStorage.getItem(pinStorageKey) === 'true')
  const [isHovered, setIsHovered] = useState(false)
  const isExpanded = isPinned || isHovered

  useEffect(() => {
    localStorage.setItem(pinStorageKey, String(isPinned))
  }, [isPinned])

  return (
    <aside
      className={`glass-sidebar hidden shrink-0 overflow-hidden transition-[width] duration-300 ease-out xl:flex xl:flex-col ${
        isExpanded ? 'w-64' : 'w-20'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`relative flex h-20 items-center px-4 ${isExpanded ? 'justify-start' : 'justify-center'}`}>
        <div className="flex min-w-0 items-center gap-3">
          <MiniMark />
          <div
            className={`min-w-0 overflow-hidden transition-[max-width,opacity] duration-200 ${
              isExpanded ? 'max-w-36 opacity-100 delay-75' : 'max-w-0 opacity-0'
            }`}
          >
            <p className="text-xl font-semibold tracking-[0.28em] text-white">NORIX</p>
            <p className="text-[0.58rem] font-semibold tracking-[0.5em] text-norix-blue">SAAS</p>
          </div>
        </div>
        <button
          className={`absolute right-3 rounded-md p-2 text-white/54 transition hover:bg-white/[0.04] hover:text-white ${
            isExpanded ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
          onClick={() => setIsPinned((current) => !current)}
          title={isPinned ? 'Desfijar menu' : 'Fijar menu'}
          type="button"
        >
          {isPinned ? <PinOff size={17} /> : <Pin size={17} />}
        </button>
      </div>

      <div className="px-3">
        <p className={`mb-2 text-[0.66rem] font-semibold uppercase tracking-[0.22em] text-white/34 ${isExpanded ? '' : 'sr-only'}`}>
          Contexto actual
        </p>
        <button className="context-chip mb-4 flex w-full items-center gap-3 rounded-lg p-2.5 text-left" type="button">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-norix-blue/20 text-norix-blue">
            <Building2 size={17} />
          </span>
          <span
            className={`min-w-0 flex-1 overflow-hidden transition-[max-width,opacity] duration-200 ${
              isExpanded ? 'max-w-40 opacity-100 delay-75' : 'max-w-0 opacity-0'
            }`}
          >
            <span className="block truncate text-sm font-medium text-white">Grupo Gourmet</span>
            <span className="block text-xs text-white/40">Tenant</span>
          </span>
        </button>
      </div>

      <nav className="flex-1 space-y-3 overflow-y-auto px-3 pb-4">
        {groups.map((group) => (
          <SidebarGroup expanded={isExpanded} key={group.title} title={group.title}>
            {group.items.map((item) => (
              <SidebarLink
                active={isActive(location.pathname, item.to)}
                expanded={isExpanded}
                icon={<item.icon size={17} />}
                key={item.label}
                label={item.label}
                to={item.to}
              />
            ))}
          </SidebarGroup>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3">
        <SidebarLink expanded={isExpanded} icon={<CircleHelp size={18} />} label="Ayuda" />
        <div className="mt-4 flex items-center gap-3 rounded-md bg-white/[0.035] p-2.5">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-norix-green to-norix-blue text-sm font-bold text-white">
            MS
          </div>
          <div
            className={`min-w-0 flex-1 overflow-hidden transition-[max-width,opacity] duration-200 ${
              isExpanded ? 'max-w-40 opacity-100 delay-75' : 'max-w-0 opacity-0'
            }`}
          >
            <p className="truncate text-sm font-medium text-white">Maximiliano Salum</p>
            <p className="text-xs text-white/42">Administrador global</p>
          </div>
          <MoreHorizontal className={isExpanded ? 'text-white/40' : 'hidden'} size={16} />
        </div>
      </div>
    </aside>
  )
}

function MiniMark() {
  return (
    <div className="relative h-9 w-9 shrink-0 rounded-lg bg-white/[0.04]">
      <span className="absolute left-2 top-1.5 h-6 w-2 rounded bg-gradient-to-b from-norix-green to-norix-blue [transform:skewY(32deg)]" />
      <span className="absolute right-2 top-1.5 h-6 w-2 rounded bg-gradient-to-b from-norix-green to-norix-blue [transform:skewY(-32deg)]" />
    </div>
  )
}

function SidebarGroup({
  children,
  expanded,
  title,
}: {
  children: ReactNode
  expanded: boolean
  title: string
}) {
  return (
    <div>
      <p className={`mb-1 px-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white/30 ${expanded ? '' : 'sr-only'}`}>
        {title}
      </p>
      <div className="space-y-0.5">{children}</div>
    </div>
  )
}

function SidebarLink({
  active = false,
  expanded,
  icon,
  label,
  to,
}: {
  active?: boolean
  expanded: boolean
  icon: ReactNode
  label: string
  to?: string
}) {
  const className = `flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition ${
    active ? 'nav-active text-white' : 'text-white/58 hover:bg-white/[0.04] hover:text-white'
  }`
  const content = (
    <>
      <span className={`grid h-5 w-5 shrink-0 place-items-center ${active ? 'text-norix-green' : 'text-white/42'}`}>
        {icon}
      </span>
      <span
        className={`overflow-hidden truncate transition-[max-width,opacity] duration-200 ${
          expanded ? 'max-w-44 opacity-100 delay-75' : 'max-w-0 opacity-0'
        }`}
      >
        {label}
      </span>
    </>
  )

  if (to) {
    return (
      <Link className={className} title={label} to={to}>
        {content}
      </Link>
    )
  }

  return (
    <button className={className} title={label} type="button">
      {content}
    </button>
  )
}

function isActive(pathname: string, to?: string) {
  if (!to) {
    return false
  }

  if (to === '/contexto') {
    return pathname === to
  }

  return pathname === to || pathname.startsWith(`${to}/`)
}

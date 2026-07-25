import { useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  Building2,
  ChevronDown,
  ChevronUp,
  Fingerprint,
  Home,
  KeyRound,
  Landmark,
  MapPin,
  MoreHorizontal,
  Settings,
  ShieldCheck,
  Store,
  Users,
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

const items: Array<{
  icon: LucideIcon
  label: string
  to?: string
}> = [
  { icon: Home, label: 'Inicio', to: '/contexto' },
  { icon: Store, label: 'Marcas', to: '/tenant/restaurantes' },
  { icon: KeyRound, label: 'Acceso' },
  { icon: Activity, label: 'Actividad' },
  { icon: MoreHorizontal, label: 'Más' },
]

const sheetGroups = [
  {
    title: 'Directorio',
    items: [
      { icon: Store, label: 'Restaurantes / Marcas', to: '/tenant/restaurantes' },
      { icon: Building2, label: 'Unidades operativas' },
      { icon: Landmark, label: 'Entidades fiscales' },
      { icon: MapPin, label: 'Direcciones' },
    ],
  },
  {
    title: 'Acceso',
    items: [
      { icon: Users, label: 'Usuarios' },
      { icon: ShieldCheck, label: 'Roles' },
      { icon: KeyRound, label: 'Permisos' },
      { icon: Fingerprint, label: 'Asignaciones' },
    ],
  },
  {
    title: 'Sistema',
    items: [
      { icon: Activity, label: 'Auditoria' },
      { icon: Settings, label: 'Configuracion' },
    ],
  },
]

export function MobileBottomNav() {
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="mobile-bottom-nav xl:hidden" aria-label="Navegacion principal">
      <div className={`mobile-bottom-sheet ${isOpen ? 'mobile-bottom-sheet-open' : ''}`}>
        <button
          className="mobile-bottom-sheet-handle"
          onClick={() => setIsOpen((current) => !current)}
          type="button"
          aria-expanded={isOpen}
        >
          <span>{isOpen ? 'Cerrar menu' : 'Abrir menu completo'}</span>
          {isOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </button>

        <div className="mobile-bottom-sheet-content">
          {sheetGroups.map((group) => (
            <section className="mobile-bottom-sheet-group" key={group.title}>
              <p className="mobile-bottom-sheet-title">{group.title}</p>
              <div className="mobile-bottom-sheet-grid">
                {group.items.map((item) => (
                  <MobileSheetItem
                    active={isActive(location.pathname, item.to)}
                    icon={item.icon}
                    key={item.label}
                    label={item.label}
                    onNavigate={() => setIsOpen(false)}
                    to={item.to}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      <div className="mobile-bottom-nav-inner">
        {items.map((item) => (
          <MobileBottomNavItem
            active={isActive(location.pathname, item.to)}
            icon={item.icon}
            key={item.label}
            label={item.label}
            onClick={item.label === 'Más' ? () => setIsOpen((current) => !current) : undefined}
            to={item.to}
          />
        ))}
      </div>
    </nav>
  )
}

function MobileBottomNavItem({
  active,
  icon: Icon,
  label,
  onClick,
  to,
}: {
  active: boolean
  icon: LucideIcon
  label: string
  onClick?: () => void
  to?: string
}) {
  const className = `mobile-bottom-nav-item ${active ? 'mobile-bottom-nav-item-active' : ''}`
  const content = (
    <>
      <span className="mobile-bottom-nav-icon">
        <Icon size={19} />
      </span>
      <span className="mobile-bottom-nav-label">{label}</span>
    </>
  )

  if (to) {
    return (
      <Link className={className} onClick={onClick} to={to}>
        {content}
      </Link>
    )
  }

  return (
    <button className={className} onClick={onClick} type="button">
      {content}
    </button>
  )
}

function MobileSheetItem({
  active,
  icon: Icon,
  label,
  onNavigate,
  to,
}: {
  active: boolean
  icon: LucideIcon
  label: string
  onNavigate: () => void
  to?: string
}) {
  const className = `mobile-bottom-sheet-item ${active ? 'mobile-bottom-sheet-item-active' : ''}`
  const content = (
    <>
      <span className="mobile-bottom-sheet-icon">
        <Icon size={17} />
      </span>
      <span className="truncate">{label}</span>
    </>
  )

  if (to) {
    return (
      <Link className={className} onClick={onNavigate} to={to}>
        {content}
      </Link>
    )
  }

  return (
    <button className={className} type="button">
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

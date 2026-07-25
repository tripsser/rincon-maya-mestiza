import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Pin, PinOff } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { ContextRailChip } from './ContextRailChip'

export type ResourceRailItem = {
  icon: ReactNode
  label: string
  to?: string
}

export type ResourceRailSwitcherItem = {
  active?: boolean
  detail?: string
  label: string
  to: string
}

type ResourceRailProps = {
  accent?: 'blue' | 'green' | 'violet'
  forceCompact?: boolean
  footer?: ReactNode
  icon: ReactNode
  items: ResourceRailItem[]
  resourceKind: string
  storageKey: string
  switcherLabel?: string
  switcherItems?: ResourceRailSwitcherItem[]
  title: string
}

export function ResourceRail({
  accent = 'green',
  forceCompact = false,
  footer,
  icon,
  items,
  resourceKind,
  storageKey,
  switcherLabel = 'Cambiar recurso',
  switcherItems = [],
  title,
}: ResourceRailProps) {
  const location = useLocation()
  const [isPinned, setIsPinned] = useState(() => localStorage.getItem(storageKey) === 'true')
  const [isHovered, setIsHovered] = useState(false)
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false)
  const isExpanded = isHovered || (!forceCompact && isPinned)
  const railClass = isExpanded ? 'resource-rail-expanded' : 'resource-rail-compact'
  const canSwitch = switcherItems.length > 0

  useEffect(() => {
    localStorage.setItem(storageKey, String(isPinned))
  }, [isPinned, storageKey])

  useEffect(() => {
    if (!isExpanded) {
      setIsSwitcherOpen(false)
    }
  }, [isExpanded])

  return (
    <aside
      className={`resource-rail ${railClass} hidden h-full shrink-0 overflow-hidden border-r border-white/10 bg-black/16 backdrop-blur-xl xl:block`}
      data-accent={accent}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`resource-rail-inner relative flex h-full min-h-0 flex-col ${isExpanded ? 'p-3' : 'px-2 py-3'}`}>
        <div className="resource-rail-top-spacer shrink-0" />
        <ContextRailChip
          accent={accent}
          ariaExpanded={isSwitcherOpen}
          className="rail-context-chip-resource"
          expanded={isExpanded}
          icon={icon}
          kind={resourceKind}
          onClick={canSwitch ? () => setIsSwitcherOpen((current) => !current) : undefined}
          switchable={canSwitch}
          title={title}
        />

        {canSwitch && (
          <div
            className={`resource-switcher ${isExpanded && isSwitcherOpen ? 'resource-switcher-open' : ''}`}
            aria-hidden={!isSwitcherOpen}
          >
            <div
              className={`resource-switcher-list ${
                isExpanded && isSwitcherOpen ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
              }`}
            >
              <p className="resource-switcher-label">{switcherLabel}</p>
              <div className="resource-switcher-items subtle-scrollbar">
                {switcherItems.map((item) => (
                  <Link
                    className={`resource-switcher-item ${item.active ? 'resource-switcher-item-active' : ''}`}
                    key={item.to}
                    to={item.to}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{item.label}</span>
                      {item.detail && <span className="block truncate text-xs opacity-55">{item.detail}</span>}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className={`resource-rail-control mb-3 flex items-center ${isExpanded ? 'justify-between px-1' : 'justify-center'}`}>
          <p
            className={`text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-white/34 transition-[max-width,opacity] duration-200 ${
              isExpanded ? 'max-w-32 opacity-100' : 'sr-only max-w-0 opacity-0'
            }`}
          >
            Navegacion
          </p>
          <button
            className="grid h-8 w-8 place-items-center rounded-md text-white/42 hover:bg-white/[0.04] hover:text-white"
            onClick={() => setIsPinned((current) => !current)}
            title={isPinned ? 'Contraer rail' : 'Fijar rail'}
            type="button"
          >
            {isPinned ? <PinOff size={15} /> : <Pin size={15} />}
          </button>
        </div>

        <nav className="subtle-scrollbar min-h-0 flex-1 overflow-y-auto pb-2">
          <div className="space-y-1">
            {items.map((item) => (
              <RailItem
                active={isActive(location.pathname, item.to)}
                expanded={isExpanded}
                icon={item.icon}
                key={item.label}
                label={item.label}
                to={item.to}
              />
            ))}
          </div>
        </nav>

        {footer && (
          <div
            className={`resource-rail-footer shrink-0 overflow-hidden border-t border-white/10 pt-4 transition-[max-height,opacity] duration-200 ${
              isExpanded ? 'max-h-60 opacity-100 delay-100' : 'max-h-0 opacity-0'
            }`}
          >
            {footer}
          </div>
        )}
      </div>
    </aside>
  )
}

function RailItem({
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
  const className = `flex w-full items-center rounded-md py-2 text-left text-sm transition ${
    active ? 'nav-active text-white' : 'text-white/58 hover:bg-white/[0.04] hover:text-white'
  } ${expanded ? 'gap-3 px-3' : 'justify-center gap-0 px-2'}`

  const content = (
    <>
      <span className={`grid h-5 w-5 shrink-0 place-items-center ${active ? 'text-norix-green' : 'text-white/42'}`}>
        {icon}
      </span>
      <span
        className={`overflow-hidden truncate transition-[max-width,opacity] duration-200 ${
          expanded ? 'max-w-36 opacity-100 delay-100' : 'max-w-0 opacity-0'
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

  return pathname === to
}

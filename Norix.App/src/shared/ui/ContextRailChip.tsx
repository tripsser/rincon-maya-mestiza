import type { ReactNode } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { RailTooltip } from './RailTooltip'

type ContextRailChipProps = {
  accent?: 'blue' | 'green' | 'violet'
  ariaExpanded?: boolean
  className?: string
  expanded: boolean
  icon: ReactNode
  kind: string
  onClick?: () => void
  switchable?: boolean
  title: string
}

export function ContextRailChip({
  accent = 'blue',
  ariaExpanded,
  className = '',
  expanded,
  icon,
  kind,
  onClick,
  switchable = false,
  title,
}: ContextRailChipProps) {
  return (
    <RailTooltip enabled={!expanded} label={`${title} - ${kind}`}>
      {(tooltipProps) => (
        <button
          {...tooltipProps}
          aria-label={`${title} - ${kind}`}
          aria-expanded={ariaExpanded}
          className={`context-chip rail-context-chip ${
            expanded ? 'rail-context-chip-expanded' : 'rail-context-chip-compact'
          } ${className}`}
          data-accent={accent}
          onClick={onClick}
          type="button"
        >
          <span className={`rail-context-chip-inner ${expanded ? 'gap-3' : 'gap-0'}`}>
            <span className={`rail-context-chip-icon ${accentClass(accent)}`}>{icon}</span>
            <span
              className={`rail-context-chip-copy ${
                expanded ? 'max-w-36 opacity-100 delay-75' : 'max-w-0 opacity-0'
              }`}
            >
              <span className="block truncate text-sm font-semibold text-white">{title}</span>
              <span className="block truncate text-xs text-white/40">{kind}</span>
            </span>
            {switchable && expanded && (
              <span className="rail-context-chip-caret" aria-hidden="true">
                {ariaExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </span>
            )}
          </span>
        </button>
      )}
    </RailTooltip>
  )
}

function accentClass(accent: 'blue' | 'green' | 'violet') {
  if (accent === 'green') {
    return 'bg-norix-green/12 text-norix-green'
  }

  if (accent === 'violet') {
    return 'bg-norix-violet/12 text-norix-violet'
  }

  return 'bg-norix-blue/12 text-norix-blue'
}

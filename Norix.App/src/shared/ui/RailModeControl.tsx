import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { RailTooltip } from './RailTooltip'
import type { RailDisplayMode } from './useRailDisplayMode'

export function RailModeControl({
  expanded,
  mode,
  onChange,
}: {
  expanded: boolean
  mode: RailDisplayMode
  onChange: (mode: RailDisplayMode) => void
}) {
  const nextMode: RailDisplayMode = expanded ? 'compact' : 'expanded'
  const label = expanded ? 'Contraer navegacion' : 'Desplegar navegacion'

  return (
    <RailTooltip enabled={!expanded} label={label}>
      {(tooltipProps) => (
        <button
          {...tooltipProps}
          aria-label={label}
          className={`rail-compact-item grid h-8 place-items-center rounded-md ${
            mode === 'compact' ? 'text-white/42 hover:bg-white/[0.04] hover:text-white' : 'bg-white/[0.07] text-white'
          }`}
          onClick={() => onChange(nextMode)}
          type="button"
        >
          {expanded ? <PanelLeftClose size={15} /> : <PanelLeftOpen size={15} />}
        </button>
      )}
    </RailTooltip>
  )
}

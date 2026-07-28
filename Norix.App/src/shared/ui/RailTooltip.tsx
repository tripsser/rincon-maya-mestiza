import type { HTMLAttributes, ReactNode } from 'react'
import { useId, useState } from 'react'
import { createPortal } from 'react-dom'

type AnchorProps = HTMLAttributes<HTMLElement> & {
  'aria-describedby'?: string
}

export function RailTooltip({
  children,
  enabled,
  label,
}: {
  children: (props: AnchorProps) => ReactNode
  enabled: boolean
  label: string
}) {
  const id = useId()
  const [position, setPosition] = useState<{ left: number; top: number } | null>(null)

  function showTooltip(event: React.FocusEvent<HTMLElement> | React.MouseEvent<HTMLElement>) {
    if (!enabled) {
      return
    }

    const rect = event.currentTarget.getBoundingClientRect()
    setPosition({
      left: rect.right + 12,
      top: rect.top + rect.height / 2,
    })
  }

  function hideTooltip() {
    setPosition(null)
  }

  const anchorProps: AnchorProps = {
    'aria-describedby': position ? id : undefined,
    onBlur: hideTooltip,
    onFocus: showTooltip,
    onMouseEnter: showTooltip,
    onMouseLeave: hideTooltip,
  }

  return (
    <>
      {children(anchorProps)}
      {enabled && position
        ? createPortal(
            <div
              className="rail-tooltip"
              id={id}
              role="tooltip"
              style={{ left: position.left, top: position.top }}
            >
              {label}
            </div>,
            document.body,
          )
        : null}
    </>
  )
}

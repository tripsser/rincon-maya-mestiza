import type { ReactNode } from 'react'
import { useEffect, useId, useRef } from 'react'
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
  const titleId = useId()
  const drawerRef = useRef<HTMLElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null
    closeButtonRef.current?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
        return
      }

      if (event.key !== 'Tab' || !drawerRef.current) {
        return
      }

      const focusable = getFocusableElements(drawerRef.current)

      if (focusable.length === 0) {
        event.preventDefault()
        closeButtonRef.current?.focus()
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      }

      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      previouslyFocused?.focus()
    }
  }, [onClose])

  return (
    <div className="side-drawer-backdrop fixed inset-0 z-20 bg-black/45 backdrop-blur-sm">
      <aside
        aria-labelledby={titleId}
        aria-modal="true"
        className="side-drawer glass-panel ml-auto flex h-full w-full max-w-xl flex-col rounded-none border-y-0 border-r-0 p-5"
        ref={drawerRef}
        role="dialog"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-norix-green">{eyebrow}</p>
            <h2 className="mt-2 text-2xl font-semibold text-white" id={titleId}>{title}</h2>
            {subtitle && <p className="mt-1 text-sm text-white/52">{subtitle}</p>}
          </div>
          <button
            aria-label="Cerrar panel"
            className="glass-button grid h-9 w-9 place-items-center rounded-md"
            onClick={onClose}
            ref={closeButtonRef}
            type="button"
          >
            <X size={17} />
          </button>
        </div>

        {children}
      </aside>
    </div>
  )
}

function getFocusableElements(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      [
        'a[href]',
        'button:not([disabled])',
        'textarea:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
      ].join(','),
    ),
  ).filter((element) => !element.hasAttribute('hidden') && element.offsetParent !== null)
}

import { useEffect, useState } from 'react'

export type RailDisplayMode = 'compact' | 'expanded'

export function useRailDisplayMode({
  defaultMode = 'expanded',
  storageKey,
}: {
  defaultMode?: RailDisplayMode
  storageKey: string
}) {
  const [mode, setMode] = useState<RailDisplayMode>(() => {
    const saved = localStorage.getItem(storageKey)

    if (saved === 'true') {
      return 'expanded'
    }

    if (saved === 'false') {
      return defaultMode
    }

    if (saved === 'auto') {
      return defaultMode
    }

    return isRailDisplayMode(saved) ? saved : defaultMode
  })
  const isExpanded = mode === 'expanded'

  useEffect(() => {
    localStorage.setItem(storageKey, mode)
  }, [mode, storageKey])

  return {
    isExpanded,
    mode,
    setMode,
  }
}

function isRailDisplayMode(value: string | null): value is RailDisplayMode {
  return value === 'compact' || value === 'expanded'
}

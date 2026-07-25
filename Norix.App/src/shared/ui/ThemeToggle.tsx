import { useEffect, useState } from 'react'
import { Moon, Palette, Sun } from 'lucide-react'
import {
  applyThemeMode,
  applyThemePreset,
  getStoredThemeMode,
  getStoredThemePreset,
  themeModeStorageKey,
  themePresetStorageKey,
  type ThemeMode,
  type ThemePreset,
} from '../lib/theme'

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>(() => getStoredThemeMode())
  const [preset, setPreset] = useState<ThemePreset>(() => getStoredThemePreset())

  useEffect(() => {
    applyThemeMode(mode)
    window.localStorage.setItem(themeModeStorageKey, mode)
  }, [mode])

  useEffect(() => {
    applyThemePreset(preset)
    window.localStorage.setItem(themePresetStorageKey, preset)
  }, [preset])

  const nextMode = mode === 'dark' ? 'light' : 'dark'
  const nextPreset = preset === 'norix-original' ? 'norix-lab' : 'norix-original'

  return (
    <div className="flex items-center gap-1">
      <button
        className={`grid h-8 min-w-8 place-items-center rounded-md px-2 text-xs font-semibold ${
          preset === 'norix-lab' ? 'bg-norix-blue/14 text-norix-blue' : 'text-white/56 hover:bg-white/[0.06] hover:text-white'
        }`}
        onClick={() => setPreset(nextPreset)}
        title={preset === 'norix-original' ? 'Cambiar a copia de trabajo Norix' : 'Volver al tema Norix guardado'}
        type="button"
      >
        <span className="flex items-center gap-1.5">
          <Palette size={15} />
          <span className="hidden xl:inline">{preset === 'norix-original' ? 'Base' : 'Lab'}</span>
        </span>
      </button>
      <button
        className="grid h-8 w-8 place-items-center rounded-md text-white/56 hover:bg-white/[0.06] hover:text-white"
        onClick={() => setMode(nextMode)}
        title={nextMode === 'light' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
        type="button"
      >
        {mode === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
      </button>
    </div>
  )
}

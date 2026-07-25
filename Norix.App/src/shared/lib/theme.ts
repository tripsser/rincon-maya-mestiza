export type ThemeMode = 'dark' | 'light'
export type ThemePreset = 'norix-original' | 'norix-lab'

export const themeModeStorageKey = 'norix.themeMode'
export const themePresetStorageKey = 'norix.themePreset'

export function getStoredThemeMode(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'dark'
  }

  return window.localStorage.getItem(themeModeStorageKey) === 'light' ? 'light' : 'dark'
}

export function getStoredThemePreset(): ThemePreset {
  if (typeof window === 'undefined') {
    return 'norix-original'
  }

  return window.localStorage.getItem(themePresetStorageKey) === 'norix-lab' ? 'norix-lab' : 'norix-original'
}

export function applyThemeMode(mode: ThemeMode) {
  document.documentElement.dataset.theme = mode
}

export function applyThemePreset(preset: ThemePreset) {
  document.documentElement.dataset.themePreset = preset
}

export function initializeTheme() {
  applyThemeMode(getStoredThemeMode())
  applyThemePreset(getStoredThemePreset())
}

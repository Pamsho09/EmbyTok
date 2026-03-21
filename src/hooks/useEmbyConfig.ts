import { useCallback, useMemo, useState } from 'react'
import type { EmbyConfig } from '../emby/types'

const STORAGE_KEY = 'embyConfig'

const defaultConfig: EmbyConfig = {
  serverUrl: import.meta.env.VITE_EMBY_SERVER_URL ?? '',
  apiKey: import.meta.env.VITE_EMBY_API_KEY ?? '',
  accessToken: import.meta.env.VITE_EMBY_ACCESS_TOKEN ?? '',
  userId: import.meta.env.VITE_EMBY_USER_ID ?? '',
  libraryId: import.meta.env.VITE_EMBY_LIBRARY_ID ?? '',
  libraryName: import.meta.env.VITE_EMBY_LIBRARY_NAME ?? '',
}

const readConfig = (): EmbyConfig => {
  if (typeof window === 'undefined') {
    return defaultConfig
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return defaultConfig
    }
    const parsed = JSON.parse(raw) as Partial<EmbyConfig>
    return { ...defaultConfig, ...parsed }
  } catch {
    return defaultConfig
  }
}

export const useEmbyConfig = () => {
  const [config, setConfig] = useState<EmbyConfig>(() => readConfig())

  const updateConfig = useCallback((next: EmbyConfig) => {
    setConfig(next)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    }
  }, [])

  const isReady = useMemo(
    () => Boolean(config.serverUrl && (config.apiKey || config.accessToken)),
    [config],
  )

  return {
    config,
    updateConfig,
    isReady,
  }
}

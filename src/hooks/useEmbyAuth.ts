import { useCallback, useState } from 'react'
import { authenticateByName } from '../emby/embyClient'

export const useEmbyAuth = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const login = useCallback(
    async (params: {
      serverUrl: string
      username: string
      password: string
      apiKey: string
    }) => {
      try {
        setIsLoading(true)
        setError(null)
        return await authenticateByName(params)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'No se pudo autenticar'
        setError(message)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [],
  )

  return {
    login,
    isLoading,
    error,
  }
}

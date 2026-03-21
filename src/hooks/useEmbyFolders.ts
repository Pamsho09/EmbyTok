import { useEffect, useState } from 'react'
import type { EmbyClient } from '../emby/embyClient'
import type { EmbyFolder } from '../emby/types'

type UseEmbyFoldersParams = {
  client: EmbyClient | null
  libraryId: string
}

export const useEmbyFolders = ({ client, libraryId }: UseEmbyFoldersParams) => {
  const [folders, setFolders] = useState<EmbyFolder[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!client || !libraryId) {
      setFolders([])
      return
    }

    let isCancelled = false
    const load = async () => {
      try {
        setIsLoading(true)
        const response = await client.getFolders({ parentId: libraryId, recursive: false })
        if (isCancelled) {
          return
        }
        const mapped = response.map((folder) => ({
          id: folder.Id,
          name: folder.Name,
          path: folder.Path ?? '',
        }))
        setFolders(mapped)
        setError(null)
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : 'No se pudieron cargar carpetas')
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    load()
    return () => {
      isCancelled = true
    }
  }, [client, libraryId])

  return {
    folders,
    isLoading,
    error,
  }
}

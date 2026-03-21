import { useEffect, useState } from 'react'
import type { EmbyClient } from '../emby/embyClient'
import type { EmbyFolder } from '../emby/types'

type UseEmbyFolderParams = {
  client: EmbyClient | null
  libraryId: string
  folderName: string
}

export const useEmbyFolder = ({
  client,
  libraryId,
  folderName,
}: UseEmbyFolderParams) => {
  const [folder, setFolder] = useState<EmbyFolder | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!client || !libraryId || !folderName) {
      setFolder(null)
      return
    }

    let isCancelled = false
    const load = async () => {
      try {
        setIsLoading(true)
        const folders = await client.getFolders({
          parentId: libraryId,
          searchTerm: folderName,
        })
        if (isCancelled) {
          return
        }

        const match = folders.find(
          (item) => item.Name?.toLowerCase() === folderName.toLowerCase(),
        )

        if (match) {
          setFolder({
            id: match.Id,
            name: match.Name,
            path: match.Path ?? '',
          })
          setError(null)
        } else {
          setFolder(null)
          setError('No se encontro la carpeta en Emby.')
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : 'No se pudo cargar la carpeta')
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
  }, [client, libraryId, folderName])

  return {
    folder,
    isLoading,
    error,
  }
}

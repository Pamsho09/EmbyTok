import { useEffect, useState } from 'react'
import type { EmbyClient } from '../emby/embyClient'
import type { EmbyItem } from '../emby/types'
import { mapEmbyItem } from '../emby/embyMapper'

type UseEmbyItemsParams = {
  client: EmbyClient | null
  libraryId: string
  libraryName: string
  limit?: number
}

export const useEmbyItems = ({
  client,
  libraryId,
  libraryName,
  limit = 24,
}: UseEmbyItemsParams) => {
  const [items, setItems] = useState<EmbyItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!client || !libraryId) {
      setItems([])
      return
    }

    let isCancelled = false
    const load = async () => {
      try {
        setIsLoading(true)
        const response = await client.getItems({
          parentId: libraryId,
          startIndex: 0,
          limit,
        })

        if (isCancelled) {
          return
        }

        const mapped = response.Items.map((item) =>
          mapEmbyItem({
            item,
            client,
            libraryId,
            libraryName,
          }),
        )
        setItems(mapped)
        setError(null)
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load items')
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
  }, [client, libraryId, libraryName, limit])

  return {
    items,
    isLoading,
    error,
  }
}

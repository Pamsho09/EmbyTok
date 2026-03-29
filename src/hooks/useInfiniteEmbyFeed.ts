import { useCallback, useEffect, useState } from 'react'
import type { EmbyClient } from '../emby/embyClient'
import type { EmbyItem } from '../emby/types'
import { mapEmbyItem } from '../emby/embyMapper'

type UseInfiniteEmbyFeedParams = {
  client: EmbyClient | null
  libraryId: string
  libraryName: string
  pageSize?: number
}

export const useInfiniteEmbyFeed = ({
  client,
  libraryId,
  libraryName,
  pageSize = 8,
}: UseInfiniteEmbyFeedParams) => {
  const [allItems, setAllItems] = useState<EmbyItem[]>([])
  const [cursor, setCursor] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setAllItems([])
    setCursor(0)
    setError(null)
  }, [client, libraryId])

  useEffect(() => {
    setCursor((current) => {
      if (allItems.length === 0) {
        return 0
      }

      const target = Math.min(pageSize, allItems.length)
      return Math.min(Math.max(current, target), allItems.length)
    })
  }, [allItems.length, pageSize])

  useEffect(() => {
    if (!client || !libraryId) {
      return
    }

    let isCancelled = false
    const load = async () => {
      try {
        setIsLoading(true)
        const countResponse = await client.getItems({
          parentId: libraryId,
          startIndex: 0,
          limit: 1,
          randomize: true,
        })

        if (isCancelled) {
          return
        }

        if (countResponse.TotalRecordCount === 0) {
          setAllItems([])
          setCursor(0)
          setError(null)
          return
        }

        const response = await client.getItems({
          parentId: libraryId,
          startIndex: 0,
          limit: countResponse.TotalRecordCount,
          randomize: true,
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

        setAllItems(mapped)
        setCursor(Math.min(pageSize, mapped.length))
        setError(null)
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load feed')
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
  }, [client, libraryId, libraryName, pageSize])

  const loadMore = useCallback(() => {
    if (isLoading || cursor >= allItems.length) {
      return
    }
    setCursor((prev) => Math.min(prev + pageSize, allItems.length))
  }, [allItems.length, cursor, isLoading, pageSize])

  const removeItem = useCallback((id: string) => {
    setAllItems((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const items = allItems.slice(0, cursor)
  const hasMore = cursor < allItems.length

  return {
    items,
    isLoading,
    hasMore,
    error,
    loadMore,
    removeItem,
  }
}

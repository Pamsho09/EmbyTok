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
  const [items, setItems] = useState<EmbyItem[]>([])
  const [cursor, setCursor] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const shuffle = <T,>(list: T[]) => {
    const copy = [...list]
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[copy[i], copy[j]] = [copy[j], copy[i]]
    }
    return copy
  }

  useEffect(() => {
    setItems([])
    setCursor(0)
    setHasMore(true)
    setError(null)
  }, [client, libraryId])

  useEffect(() => {
    if (!client || !libraryId || !hasMore) {
      return
    }

    let isCancelled = false
    const load = async () => {
      try {
        setIsLoading(true)
        const response = await client.getItems({
          parentId: libraryId,
          startIndex: cursor,
          limit: pageSize,
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

        const randomized = shuffle(mapped)

        setItems((prev) => (cursor === 0 ? randomized : [...prev, ...randomized]))
        setHasMore(cursor + mapped.length < response.TotalRecordCount)
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
  }, [client, libraryId, libraryName, cursor, pageSize, hasMore])

  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) {
      return
    }
    setCursor((prev) => prev + pageSize)
  }, [hasMore, isLoading, pageSize])

  return {
    items,
    isLoading,
    hasMore,
    error,
    loadMore,
  }
}

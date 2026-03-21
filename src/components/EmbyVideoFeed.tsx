import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { EmbyClient } from '../emby/embyClient'
import EmbyVideoCard from './EmbyVideoCard'
import { useInfiniteEmbyFeed } from '../hooks/useInfiniteEmbyFeed'

type EmbyVideoFeedProps = {
  client: EmbyClient | null
  libraryId: string
  libraryName: string
  onProfileSelect?: (profileName: string) => void
}

export default function EmbyVideoFeed({
  client,
  libraryId,
  libraryName,
  onProfileSelect,
}: EmbyVideoFeedProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  const { items, isLoading, hasMore, error, loadMore } = useInfiniteEmbyFeed({
    client,
    libraryId,
    libraryName,
  })

  const handleActive = useCallback((id: string) => {
    setActiveId(id)
  }, [])

  const activeIndex = useMemo(
    () => items.findIndex((item) => item.id === activeId),
    [activeId, items],
  )

  const showSkeletons = useMemo(() => isLoading && items.length === 0, [isLoading, items.length])

  useEffect(() => {
    const element = sentinelRef.current
    if (!element || !hasMore) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting) {
          loadMore()
        }
      },
      { rootMargin: '200px' },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [hasMore, loadMore])

  if (!client || !libraryId) {
    return (
      <div className="empty-state">
        Configura tu servidor Emby para ver el feed.
      </div>
    )
  }

  return (
    <section className="feed">
      {showSkeletons ? (
        <div className="feed__skeletons">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={`skeleton-${index}`} className="feed__skeleton" />
          ))}
        </div>
      ) : null}

      {items.map((item, index) => (
        <EmbyVideoCard
          key={item.id}
          item={item}
          isActive={item.id === activeId}
          isNearActive={Math.abs(index - activeIndex) <= 1}
          onActive={handleActive}
          onProfileSelect={onProfileSelect ?? (() => {})}
        />
      ))}

      {error ? <div className="feed__error">{error}</div> : null}
      {isLoading && items.length > 0 ? (
        <div className="feed__loading">Cargando mas videos...</div>
      ) : null}
      <div ref={sentinelRef} className="feed__sentinel" />
    </section>
  )
}

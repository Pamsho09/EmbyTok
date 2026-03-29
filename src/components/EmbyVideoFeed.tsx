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
  const [pendingDeleteItem, setPendingDeleteItem] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  const { items, isLoading, hasMore, error, loadMore, removeItem } = useInfiniteEmbyFeed({
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

  const pendingItem = useMemo(
    () => items.find((item) => item.id === pendingDeleteItem) ?? null,
    [items, pendingDeleteItem],
  )

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

  useEffect(() => {
    if (!activeId || items.some((item) => item.id === activeId)) {
      return
    }

    setActiveId(items[0]?.id ?? null)
  }, [activeId, items])

  const closeDeleteModal = useCallback(() => {
    if (isDeleting) {
      return
    }

    setPendingDeleteItem(null)
    setDeleteError(null)
  }, [isDeleting])

  const handleDeleteConfirm = useCallback(async () => {
    if (!client || !pendingItem) {
      return
    }

    try {
      setIsDeleting(true)
      setDeleteError(null)
      await client.deleteItem(pendingItem.id)
      removeItem(pendingItem.id)
      setPendingDeleteItem(null)
      if (activeId === pendingItem.id) {
        setActiveId(null)
      }
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'No se pudo eliminar el contenido')
    } finally {
      setIsDeleting(false)
    }
  }, [activeId, client, pendingItem, removeItem])

  useEffect(() => {
    if (!pendingItem) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeDeleteModal()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [closeDeleteModal, pendingItem])

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
          onDelete={(nextItem) => {
            setPendingDeleteItem(nextItem.id)
            setDeleteError(null)
          }}
        />
      ))}

      {error ? <div className="feed__error">{error}</div> : null}
      {isLoading && items.length > 0 ? (
        <div className="feed__loading">Cargando mas videos...</div>
      ) : null}
      <div ref={sentinelRef} className="feed__sentinel" />

      {pendingItem ? (
        <div className="modal" role="presentation" onClick={closeDeleteModal}>
          <div
            className="modal__dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
            aria-describedby="delete-modal-description"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="delete-modal-title">Eliminar contenido</h2>
            <p id="delete-modal-description">
              Vas a eliminar <strong>{pendingItem.name}</strong> de Emby. Esta acción no se puede deshacer.
            </p>
            {deleteError ? <div className="modal__error">{deleteError}</div> : null}
            <div className="modal__actions">
              <button type="button" className="button" onClick={closeDeleteModal} disabled={isDeleting}>
                Cancelar
              </button>
              <button
                type="button"
                className="button button--danger"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}

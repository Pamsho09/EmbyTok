import { useEffect, useRef } from 'react'
import type { EmbyItem } from '../emby/types'
import { formatRuntime } from '../emby/embyMapper'
import EmbyPlayer from './EmbyPlayer'

type EmbyVideoCardProps = {
  item: EmbyItem
  isActive: boolean
  isNearActive: boolean
  onActive: (id: string) => void
  onProfileSelect: (profileName: string) => void
}

export default function EmbyVideoCard({
  item,
  isActive,
  isNearActive,
  onActive,
  onProfileSelect,
}: EmbyVideoCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const element = cardRef.current
    if (!element) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting) {
          onActive(item.id)
        }
      },
      { threshold: 0.65 },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [item.id, onActive])

  const truncate = (value: string, max = 10) =>
    value.length > max ? `${value.slice(0, max)}...` : value

  return (
    <article ref={cardRef} className="video-card">
      <EmbyPlayer
        src={item.videoUrl}
        poster={item.imageUrl}
        isActive={isActive}
        isNearActive={isNearActive}
      />
      {item.backdropUrl ? (
        <div
          className="video-card__backdrop"
          style={{ backgroundImage: `url(${item.backdropUrl})` }}
          aria-hidden="true"
        />
      ) : null}
      {isActive ? (
        <div className="video-card__overlay">
          {item.profileName ? (
            <button
              className="video-card__profile"
              type="button"
              onClick={() => onProfileSelect(item.profileName)}
            >
              <span className="video-card__profile-icon" aria-hidden="true">◎</span>
              {truncate(item.profileName)}
            </button>
          ) : null}
          <div className="video-card__title">{truncate(item.name)}</div>
          {item.overview ? (
            <p className="video-card__overview">{item.overview}</p>
          ) : null}
          <div className="video-card__meta">
            <span>{item.libraryName || 'Mi biblioteca'}</span>
            {item.runtimeTicks ? <span>{formatRuntime(item.runtimeTicks)}</span> : null}
          </div>
        </div>
      ) : null}
    </article>
  )
}

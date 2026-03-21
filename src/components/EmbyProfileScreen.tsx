import type { EmbyClient } from '../emby/embyClient'
import { useEmbyItems } from '../hooks/useEmbyItems'
import { useEmbyFolders } from '../hooks/useEmbyFolders'

type EmbyProfileScreenProps = {
  client: EmbyClient | null
  libraryId: string
  libraryName: string
  onOpenFeed: () => void
  onOpenFolder: (folderName: string) => void
}

export default function EmbyProfileScreen({
  client,
  libraryId,
  libraryName,
  onOpenFeed,
  onOpenFolder,
}: EmbyProfileScreenProps) {
  const { items, isLoading, error } = useEmbyItems({
    client,
    libraryId,
    libraryName,
    limit: 24,
  })
  const { folders, isLoading: foldersLoading, error: foldersError } = useEmbyFolders({
    client,
    libraryId,
  })

  const cover = items[0]?.imageUrl
  const avatar = items[0]?.imageUrl

  const truncate = (value: string, max = 10) =>
    value.length > max ? `${value.slice(0, max)}...` : value

  return (
    <section className="profile">
      <header className="profile__header">
        <div className="profile__cover" style={{ backgroundImage: `url(${cover})` }} />
        <div className="profile__content">
          {avatar ? (
            <div
              className="profile__avatar"
              style={{ backgroundImage: `url(${avatar})` }}
            />
          ) : null}
          <h1>{truncate(libraryName || 'Mi carpeta')}</h1>
          <p>Videos destacados de tu biblioteca Emby.</p>
          <button className="button" type="button" onClick={onOpenFeed}>
            Ver feed vertical
          </button>
        </div>
      </header>

      <div className="profile__section">
        <h2>Carpetas</h2>
        {foldersError ? <div className="profile__error">{foldersError}</div> : null}
        <div className="profile__folder-grid">
          {foldersLoading
            ? Array.from({ length: 6 }).map((_, index) => (
                <div key={`folder-skeleton-${index}`} className="profile__folder skeleton" />
              ))
            : folders.map((folder) => (
                <button
                  key={folder.id}
                  className="profile__folder"
                  type="button"
                  onClick={() => onOpenFolder(folder.name)}
                >
                  <div
                    className="profile__folder-thumb"
                    style={{
                      backgroundImage: client
                        ? `url(${client.getItemImageUrl(folder.id)})`
                        : 'none',
                    }}
                  />
                  <span>{truncate(folder.name)}</span>
                </button>
              ))}
        </div>
      </div>

      <div className="profile__section">
        <h2>Videos</h2>
        {error ? <div className="profile__error">{error}</div> : null}
        <div className="profile__grid">
          {isLoading
            ? Array.from({ length: 8 }).map((_, index) => (
                <div key={`grid-skeleton-${index}`} className="profile__card skeleton" />
              ))
            : items.map((item) => (
                <div key={item.id} className="profile__card">
                  <img src={item.imageUrl} alt={item.name} loading="lazy" />
                  <div className="profile__card-title">{truncate(item.name)}</div>
                </div>
              ))}
        </div>
      </div>
    </section>
  )
}

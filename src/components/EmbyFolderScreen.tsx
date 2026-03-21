import type { EmbyClient } from '../emby/embyClient'
import EmbyVideoFeed from './EmbyVideoFeed'
import { useEmbyFolder } from '../hooks/useEmbyFolder'

type EmbyFolderScreenProps = {
  client: EmbyClient | null
  libraryId: string
  folderName: string
  onBack: () => void
}

export default function EmbyFolderScreen({
  client,
  libraryId,
  folderName,
  onBack,
}: EmbyFolderScreenProps) {
  const { folder, isLoading, error } = useEmbyFolder({
    client,
    libraryId,
    folderName,
  })

  return (
    <section className="folder">
      <header className="folder__header">
        <div>
          <h1>{folderName}</h1>
          <p>Contenido completo de esta carpeta.</p>
        </div>
      </header>

      {folder?.id ? (
        <div
          className="folder__avatar"
          style={{ backgroundImage: `url(${client?.getItemImageUrl(folder.id) ?? ''})` }}
          aria-hidden="true"
        />
      ) : null}

      <button
        className="floating-back"
        type="button"
        aria-label="Volver"
        onClick={onBack}
      >
        <span className="sr-only">Volver</span>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M15 6l-6 6 6 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </button>

      {isLoading ? <div className="folder__status">Cargando carpeta...</div> : null}
      {error ? <div className="folder__status folder__status--error">{error}</div> : null}

      {folder ? (
        <EmbyVideoFeed
          client={client}
          libraryId={folder.id}
          libraryName={folder.name}
        />
      ) : null}
    </section>
  )
}

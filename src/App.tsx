import { useEffect, useMemo } from 'react'
import { Navigate, NavLink, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import './App.css'
import { createEmbyClient } from './emby/embyClient'
import EmbyConfigScreen from './components/EmbyConfigScreen'
import EmbyProfileScreen from './components/EmbyProfileScreen'
import EmbyVideoFeed from './components/EmbyVideoFeed'
import EmbyFolderScreen from './components/EmbyFolderScreen'
import { useEmbyConfig } from './hooks/useEmbyConfig'

export default function App() {
  const { config, updateConfig, isReady } = useEmbyConfig()
  const location = useLocation()
  const navigate = useNavigate()

  const client = useMemo(() => {
    if (!isReady || !config.serverUrl) {
      return null
    }
    return createEmbyClient(config)
  }, [config, isReady])

  const libraryName = config.libraryName || 'Mi carpeta'
  const isFeedLike = location.pathname === '/feed' || location.pathname.startsWith('/folder')

  useEffect(() => {
    if (!isReady && location.pathname !== '/settings') {
      navigate('/settings', { replace: true })
    }
  }, [isReady, location.pathname, navigate])

  return (
    <div className="app">
      {!isFeedLike && (
        <header className="topbar">
          <div className="topbar__brand">EmbyTok</div>
        </header>
      )}

      <main className="screen">
        <Routes>
          <Route path="/" element={<Navigate to="/feed" replace />} />
          <Route
            path="/settings"
            element={<EmbyConfigScreen config={config} onSave={updateConfig} />}
          />
          <Route
            path="/profile"
            element={(
              <EmbyProfileScreen
                client={client}
                libraryId={config.libraryId}
                libraryName={libraryName}
                onOpenFeed={() => navigate('/feed')}
                onOpenFolder={(folderName) =>
                  navigate(`/folder/${encodeURIComponent(folderName)}`)
                }
              />
            )}
          />
          <Route
            path="/feed"
            element={(
              <EmbyVideoFeed
                client={client}
                libraryId={config.libraryId}
                libraryName={libraryName}
                onProfileSelect={(profileName) => navigate(`/folder/${encodeURIComponent(profileName)}`)}
              />
            )}
          />
          <Route
            path="/folder/:profileName"
            element={(
              <FolderRoute
                client={client}
                libraryId={config.libraryId}
              />
            )}
          />
        </Routes>
      </main>

      <nav className="bottom-nav" aria-label="Navegación principal">
        <NavLink
          to="/feed"
          className={({ isActive }) =>
            `bottom-nav__item${(isActive || location.pathname.startsWith('/folder')) ? ' bottom-nav__item--active' : ''}`
          }
          aria-label="Feed"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" fill="none">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Feed</span>
        </NavLink>
        <NavLink
          to="/profile"
          className={({ isActive }) => `bottom-nav__item${isActive ? ' bottom-nav__item--active' : ''}`}
          aria-label="Perfiles"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" fill="none">
            <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2"/>
            <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2"/>
            <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2"/>
            <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2"/>
          </svg>
          <span>Perfiles</span>
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) => `bottom-nav__item${isActive ? ' bottom-nav__item--active' : ''}`}
          aria-label="Ajustes"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" fill="none">
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="2"/>
          </svg>
          <span>Ajustes</span>
        </NavLink>
      </nav>
    </div>
  )
}

type FolderRouteProps = {
  client: ReturnType<typeof createEmbyClient> | null
  libraryId: string
}

function FolderRoute({ client, libraryId }: FolderRouteProps) {
  const { profileName } = useParams()
  const navigate = useNavigate()
  const decoded = profileName ? decodeURIComponent(profileName) : ''

  return (
    <EmbyFolderScreen
      client={client}
      libraryId={libraryId}
      folderName={decoded}
      onBack={() => navigate(-1)}
    />
  )
}

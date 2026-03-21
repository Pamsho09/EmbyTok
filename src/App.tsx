import { useEffect, useMemo, useState } from 'react'
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
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const client = useMemo(() => {
    if (!isReady || !config.serverUrl) {
      return null
    }
    return createEmbyClient(config)
  }, [config, isReady])

  const libraryName = config.libraryName || 'Mi carpeta'

  useEffect(() => {
    if (!isReady && location.pathname !== '/settings') {
      navigate('/settings', { replace: true })
    }
  }, [isReady, location.pathname, navigate])

  useEffect(() => {
    setIsMenuOpen(false)
  }, [location.pathname])

  const handleProfileSelect = (profileName: string) => {
    navigate(`/folder/${encodeURIComponent(profileName)}`)
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar__brand">EmbyTok</div>
        <button
          type="button"
          className="topbar__menu"
          aria-label="Abrir menu"
          onClick={() => setIsMenuOpen((prev) => !prev)}
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      {isMenuOpen ? (
        <div className="menu">
          <NavLink
            to="/feed"
            className={({ isActive }: { isActive: boolean }) => (isActive ? 'active' : '')}
          >
            Feed
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }: { isActive: boolean }) => (isActive ? 'active' : '')}
          >
            Perfil
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }: { isActive: boolean }) => (isActive ? 'active' : '')}
          >
            Configuracion
          </NavLink>
        </div>
      ) : null}

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
                onProfileSelect={handleProfileSelect}
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

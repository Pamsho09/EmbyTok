import { useEffect, useMemo, useState } from 'react'
import { authenticateByName, createEmbyClient } from '../emby/embyClient'
import type { EmbyConfig, EmbyLibrary } from '../emby/types'

type EmbyConfigScreenProps = {
  config: EmbyConfig
  onSave: (next: EmbyConfig) => void
}

export default function EmbyConfigScreen({ config, onSave }: EmbyConfigScreenProps) {
  const [draft, setDraft] = useState<EmbyConfig>(config)
  const [libraries, setLibraries] = useState<EmbyLibrary[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loginState, setLoginState] = useState({
    username: '',
    password: '',
    isLoading: false,
    message: '',
  })

  const client = useMemo(() => {
    if (!draft.serverUrl || !(draft.apiKey || draft.accessToken)) {
      return null
    }
    return createEmbyClient(draft)
  }, [draft])

  useEffect(() => {
    setDraft(config)
  }, [config])

  useEffect(() => {
    const loadLibraries = async () => {
      if (!client) {
        setLibraries([])
        return
      }
      try {
        setIsLoading(true)
        const response = await client.getLibraries()
        const mapped = response.map((library) => ({
          id: library.Id,
          name: library.Name,
          collectionType: library.CollectionType ?? 'unknown',
        }))
        setLibraries(mapped)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudieron cargar librerias')
      } finally {
        setIsLoading(false)
      }
    }

    loadLibraries()
  }, [client])

  const handleChange = (key: keyof EmbyConfig, value: string) => {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  const handleLibraryChange = (value: string) => {
    const selected = libraries.find((library) => library.id === value)
    setDraft((prev) => ({
      ...prev,
      libraryId: selected?.id ?? '',
      libraryName: selected?.name ?? prev.libraryName,
    }))
  }

  const handleLogin = async () => {
    if (!draft.serverUrl || !loginState.username || !loginState.password) {
      return
    }

    try {
      setLoginState((prev) => ({ ...prev, isLoading: true, message: '' }))
      const result = await authenticateByName({
        serverUrl: draft.serverUrl,
        username: loginState.username,
        password: loginState.password,
        apiKey: draft.apiKey,
      })

      setDraft((prev) => ({
        ...prev,
        accessToken: result.accessToken,
        userId: result.userId,
      }))
      setLoginState((prev) => ({
        ...prev,
        isLoading: false,
        message: 'Autenticacion exitosa. Token guardado.',
      }))
    } catch (err) {
      setLoginState((prev) => ({
        ...prev,
        isLoading: false,
        message: err instanceof Error ? err.message : 'No se pudo autenticar',
      }))
    }
  }

  return (
    <section className="config">
      <header className="config__header">
        <h1>Configurar Emby</h1>
        <p>Conecta tu NAS para ver el feed vertical.</p>
      </header>

      <div className="config__grid">
        <label className="field">
          <span>Server URL</span>
          <input
            type="text"
            placeholder="http://tu-nas:8096"
            value={draft.serverUrl}
            onChange={(event) => handleChange('serverUrl', event.target.value)}
          />
        </label>

        <label className="field">
          <span>API Key</span>
          <input
            type="text"
            placeholder="Tu API Key"
            value={draft.apiKey}
            onChange={(event) => handleChange('apiKey', event.target.value)}
          />
        </label>

        <label className="field">
          <span>Access Token (opcional)</span>
          <input
            type="text"
            placeholder="Token de usuario"
            value={draft.accessToken}
            onChange={(event) => handleChange('accessToken', event.target.value)}
          />
        </label>

        <label className="field">
          <span>User ID (opcional)</span>
          <input
            type="text"
            placeholder="Id del usuario"
            value={draft.userId}
            onChange={(event) => handleChange('userId', event.target.value)}
          />
        </label>
      </div>

      <div className="config__login">
        <h2>Login con Emby</h2>
        <div className="config__login-fields">
          <input
            type="text"
            placeholder="Usuario"
            value={loginState.username}
            onChange={(event) =>
              setLoginState((prev) => ({ ...prev, username: event.target.value }))
            }
          />
          <input
            type="password"
            placeholder="Password"
            value={loginState.password}
            onChange={(event) =>
              setLoginState((prev) => ({ ...prev, password: event.target.value }))
            }
          />
          <button
            className="button"
            type="button"
            onClick={handleLogin}
            disabled={loginState.isLoading}
          >
            {loginState.isLoading ? 'Autenticando...' : 'Autenticar'}
          </button>
        </div>
        {loginState.message ? (
          <div className="config__message">{loginState.message}</div>
        ) : null}
      </div>

      <div className="config__libraries">
        <h2>Biblioteca objetivo</h2>
        <div className="config__library-fields">
          <label className="field">
            <span>Libreria</span>
            <select
              value={draft.libraryId}
              onChange={(event) => handleLibraryChange(event.target.value)}
              disabled={isLoading || libraries.length === 0}
            >
              <option value="">Selecciona una libreria</option>
              {libraries.map((library) => (
                <option key={library.id} value={library.id}>
                  {library.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Library ID manual</span>
            <input
              type="text"
              placeholder="Id de la carpeta"
              value={draft.libraryId}
              onChange={(event) => handleChange('libraryId', event.target.value)}
            />
          </label>
          <label className="field">
            <span>Nombre personalizado</span>
            <input
              type="text"
              placeholder="Mi carpeta"
              value={draft.libraryName}
              onChange={(event) => handleChange('libraryName', event.target.value)}
            />
          </label>
        </div>
        {error ? <div className="config__error">{error}</div> : null}
      </div>

      <button className="button button--primary" type="button" onClick={() => onSave(draft)}>
        Guardar configuracion
      </button>
    </section>
  )
}

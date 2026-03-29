import type {
  EmbyAuthResult,
  EmbyConfig,
  EmbyFolderDto,
  EmbyItemsResponse,
  EmbyLibraryDto,
} from './types'

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
}

const CLIENT_INFO =
  'EmbyClient=EmbyTok,Device=Web,DeviceId=emby-tok-web,Version=1.0.0'

const normalizeUrl = (url: string) => url.replace(/\/+$/, '')

const buildUrl = (baseUrl: string, path: string, query?: URLSearchParams) => {
  const url = new URL(`${normalizeUrl(baseUrl)}${path}`)
  if (query) {
    query.forEach((value, key) => url.searchParams.set(key, value))
  }
  return url.toString()
}

const addApiKey = (query: URLSearchParams, apiKey: string, accessToken: string) => {
  const token = apiKey || accessToken
  if (token) {
    query.set('api_key', token)
  }
}

const createAuthHeaders = (accessToken: string): Record<string, string> =>
  accessToken ? { 'X-Emby-Token': accessToken } : {}

const fetchJson = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const res = await fetch(url, init)
  if (!res.ok) {
    const message = await res.text()
    throw new Error(message || `Emby request failed (${res.status})`)
  }
  return res.json() as Promise<T>
}

export type EmbyClient = {
  getItems: (params: {
    parentId: string
    startIndex: number
    limit: number
    randomize?: boolean
  }) => Promise<EmbyItemsResponse>
  getLibraries: () => Promise<EmbyLibraryDto[]>
  getFolders: (params: {
    parentId: string
    searchTerm?: string
    recursive?: boolean
  }) => Promise<EmbyFolderDto[]>
  getItemImageUrl: (id: string, maxWidth?: number) => string
  getItemBackdropUrl: (id: string, maxWidth?: number) => string
  getVideoStreamUrl: (id: string) => string
  deleteItem: (id: string) => Promise<void>
}

export const createEmbyClient = (config: EmbyConfig): EmbyClient => {
  const baseUrl = normalizeUrl(config.serverUrl)
  const authHeaders = createAuthHeaders(config.accessToken)

  return {
    getItems: async ({ parentId, startIndex, limit, randomize = false }) => {
      const query = new URLSearchParams({
        Recursive: 'true',
        IncludeItemTypes: 'Movie,Video',
        StartIndex: String(startIndex),
        Limit: String(limit),
        Fields: 'Overview,ParentId,RunTimeTicks,ImageTags,MediaStreams,Path',
      })

      if (randomize) {
        query.set('SortBy', 'Random')
        query.set('SortOrder', 'Ascending')
      }

      if (parentId) {
        query.set('ParentId', parentId)
      }

      addApiKey(query, config.apiKey, config.accessToken)

      const path = config.userId
        ? `/Users/${config.userId}/Items`
        : '/Items'

      const url = buildUrl(baseUrl, path, query)
      return fetchJson<EmbyItemsResponse>(url, {
        headers: {
          ...DEFAULT_HEADERS,
          ...authHeaders,
        },
      })
    },
    getLibraries: async () => {
      if (!config.userId) {
        return []
      }

      const query = new URLSearchParams()
      addApiKey(query, config.apiKey, config.accessToken)

      const url = buildUrl(baseUrl, `/Users/${config.userId}/Views`, query)
      const response = await fetchJson<{ Items: EmbyLibraryDto[] }>(url, {
        headers: {
          ...DEFAULT_HEADERS,
          ...authHeaders,
        },
      })

      return response.Items ?? []
    },
    getFolders: async ({ parentId, searchTerm, recursive = false }) => {
      if (!config.userId || !parentId) {
        return []
      }

      const query = new URLSearchParams({
        Recursive: recursive ? 'true' : 'false',
        IncludeItemTypes: 'Folder',
      })

      if (searchTerm) {
        query.set('SearchTerm', searchTerm)
      }

      query.set('ParentId', parentId)
      addApiKey(query, config.apiKey, config.accessToken)

      const url = buildUrl(baseUrl, `/Users/${config.userId}/Items`, query)
      const response = await fetchJson<EmbyItemsResponse>(url, {
        headers: {
          ...DEFAULT_HEADERS,
          ...authHeaders,
        },
      })

      return response.Items as EmbyFolderDto[]
    },
    getItemImageUrl: (id, maxWidth = 720) => {
      const query = new URLSearchParams({
        maxWidth: String(maxWidth),
      })
      addApiKey(query, config.apiKey, config.accessToken)
      return buildUrl(baseUrl, `/Items/${id}/Images/Primary`, query)
    },
    getItemBackdropUrl: (id, maxWidth = 1280) => {
      const query = new URLSearchParams({
        maxWidth: String(maxWidth),
      })
      addApiKey(query, config.apiKey, config.accessToken)
      return buildUrl(baseUrl, `/Items/${id}/Images/Backdrop`, query)
    },
    getVideoStreamUrl: (id) => {
      const query = new URLSearchParams({
        static: 'true',
      })
      addApiKey(query, config.apiKey, config.accessToken)
      return buildUrl(baseUrl, `/Videos/${id}/stream`, query)
    },
    deleteItem: async (id) => {
      const query = new URLSearchParams()
      addApiKey(query, config.apiKey, config.accessToken)

      const url = buildUrl(baseUrl, `/Items/${id}`, query)
      const res = await fetch(url, {
        method: 'DELETE',
        headers: {
          ...authHeaders,
        },
      })

      if (!res.ok) {
        const message = await res.text()
        throw new Error(message || `Emby request failed (${res.status})`)
      }
    },
  }
}

export const authenticateByName = async (params: {
  serverUrl: string
  username: string
  password: string
  apiKey: string
}): Promise<EmbyAuthResult> => {
  const query = new URLSearchParams()
  addApiKey(query, params.apiKey, '')

  const url = buildUrl(params.serverUrl, '/Users/AuthenticateByName', query)
  const body = {
    Username: params.username,
    Pw: params.password,
  }

  const response = await fetchJson<{ AccessToken: string; User: { Id: string }; ServerId: string }>(
    url,
    {
      method: 'POST',
      headers: {
        ...DEFAULT_HEADERS,
        'X-Emby-Authorization': CLIENT_INFO,
      },
      body: JSON.stringify(body),
    },
  )

  return {
    accessToken: response.AccessToken,
    userId: response.User.Id,
    serverId: response.ServerId,
  }
}

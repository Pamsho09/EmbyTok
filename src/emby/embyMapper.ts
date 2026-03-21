import type { EmbyItem, EmbyItemDto } from './types'
import type { EmbyClient } from './embyClient'

export const mapEmbyItem = (params: {
  item: EmbyItemDto
  client: EmbyClient
  libraryId: string
  libraryName: string
}): EmbyItem => {
  const { item, client, libraryId, libraryName } = params
  const profileName = inferProfileName(item.Path)

  return {
    id: item.Id,
    name: item.Name,
    overview: item.Overview ?? '',
    imageUrl: client.getItemImageUrl(item.Id),
    backdropUrl: client.getItemBackdropUrl(item.Id),
    videoUrl: client.getVideoStreamUrl(item.Id),
    libraryId,
    libraryName,
    mediaType: item.Type ?? 'Video',
    runtimeTicks: item.RunTimeTicks ?? 0,
    profileName,
  }
}

const inferProfileName = (path?: string) => {
  if (!path) {
    return ''
  }

  const normalized = path.replace(/\\/g, '/')
  const parts = normalized.split('/').filter(Boolean)
  const videoIndex = parts.findIndex((part) => part.toLowerCase() === 'videos')

  if (videoIndex > 0) {
    return parts[videoIndex - 1]
  }

  if (parts.length >= 2) {
    return parts[parts.length - 2]
  }

  return ''
}

export const formatRuntime = (runtimeTicks: number) => {
  if (!runtimeTicks) {
    return ''
  }

  const totalSeconds = Math.floor(runtimeTicks / 10_000_000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)

  if (hours > 0) {
    return `${hours}h ${minutes.toString().padStart(2, '0')}m`
  }

  return `${minutes}m`
}

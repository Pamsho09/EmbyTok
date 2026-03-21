export type EmbyConfig = {
  serverUrl: string
  apiKey: string
  accessToken: string
  userId: string
  libraryId: string
  libraryName: string
}

export type EmbyItemDto = {
  Id: string
  Name: string
  Overview?: string
  ParentId?: string
  RunTimeTicks?: number
  Path?: string
  ImageTags?: Record<string, string>
  Type?: string
  CollectionType?: string
}

export type EmbyItemsResponse = {
  Items: EmbyItemDto[]
  TotalRecordCount: number
}

export type EmbyLibraryDto = {
  Id: string
  Name: string
  CollectionType?: string
}

export type EmbyFolderDto = {
  Id: string
  Name: string
  Path?: string
}

export type EmbyLibrary = {
  id: string
  name: string
  collectionType: string
}

export type EmbyFolder = {
  id: string
  name: string
  path: string
}

export type EmbyItem = {
  id: string
  name: string
  overview: string
  imageUrl: string
  backdropUrl: string
  videoUrl: string
  libraryId: string
  libraryName: string
  mediaType: string
  runtimeTicks: number
  profileName: string
}

export type EmbyAuthResult = {
  userId: string
  accessToken: string
  serverId: string
}

export interface Torrent {
  id?: string
  title: string
  provider: string
  time: string
  size: string
  seeds: number
  peers: number
  magnet?: string
  desc?: string
  category?: string
  subcategory?: string
  url?: string
  infoHash?: string
  // Additional fields from torrent-search-api
  date?: string
  link?: string
  quality?: string
  language?: string
  uploader?: string
  verified?: boolean
}

export interface TorrentSearchResult {
  torrents: Torrent[]
  totalResults: number
  currentPage: number
  hasNextPage: boolean
}

export interface TorrentProvider {
  name: string
  public: boolean
  categories: string[]
}

export interface TorrentSearchParams {
  query: string
  category?: string
  limit?: number
  providers?: string[]
}

export interface TorrentDetails {
  title: string
  description: string
  files: Array<{
    name: string
    size: string
  }>
  comments: Array<{
    author: string
    text: string
    date: string
  }>
}

// Types for torrent-search-api integration
export interface TorrentSearchApiProvider {
  name: string
  public: boolean
  categories: string[]
}

export interface TorrentSearchApiConfig {
  providers: string[]
  categories: string[]
  defaultLimit: number
  enablePublicProviders: boolean
}

export interface TorrentSearchApiResponse {
  title: string
  provider: string
  time: string
  size: string
  seeds: number
  peers: number
  magnet?: string
  desc?: string
  category?: string
  subcategory?: string
  url?: string
  infoHash?: string
  date?: string
  link?: string
  quality?: string
  language?: string
  uploader?: string
  verified?: boolean
}

// New API-based torrent search types
export interface ApiTorrentSearchResult {
  name: string
  size: string
  seeders: string
  leechers: string
  category: string
  uploader: string
  url: string
  date: string
  hash: string
  magnet: string
}

export interface ApiTorrentSearchResponse {
  data: ApiTorrentSearchResult[]
  time: number
  total: number
}

export interface ApiTorrentSearchParams {
  site: string
  query: string
}

export interface TorrentPlayerState {
  isLoading: boolean
  error: string | null
  status: 'idle' | 'searching' | 'fetching' | 'loading' | 'playing' | 'failed' | 'completed'
  progress: number
  message: string
}

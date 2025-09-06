export interface Torrent {
  id: string
  title: string
  provider: string
  time: string
  size: string
  seeds: number
  peers: number
  magnet: string
  desc: string
  category: string
  subcategory?: string
  url: string
  infoHash?: string
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

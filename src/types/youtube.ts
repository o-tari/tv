export interface Video {
  id: string
  title: string
  description: string
  thumbnail: string
  channelTitle: string
  channelId: string
  publishedAt: string
  duration: string
  viewCount: string
  tags?: string[]
  categoryId?: string
}

export interface Channel {
  id: string
  title: string
  description: string
  thumbnail: string
  subscriberCount: string
  videoCount: string
  viewCount: string
  customUrl?: string
  country?: string
}


export interface SearchFilters {
  type?: 'video' | 'channel' | 'playlist'
  duration?: 'short' | 'medium' | 'long'
  uploadDate?: 'hour' | 'today' | 'week' | 'month' | 'year'
  sortBy?: 'relevance' | 'date' | 'rating' | 'title' | 'viewCount'
}

export interface SearchResponse {
  items: Video[]
  nextPageToken?: string
  totalResults: number
}

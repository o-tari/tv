// Anime types based on Consumet API and Jikan API
export interface Anime {
  id: string
  title: string
  image: string
  url: string
  genres?: string[]
  description?: string
  status?: string
  otherName?: string
  totalEpisodes?: number
  subOrDub?: string
  type?: string
  releaseDate?: string
  // Jikan-specific fields
  score?: number | null
  scoredBy?: number | null
  rank?: number | null
  popularity?: number | null
  members?: number | null
  favorites?: number | null
  year?: number | null
  season?: string | null
  duration?: string
  rating?: string
  studios?: string[]
  producers?: string[]
}

export interface AnimeEpisode {
  id: string
  episodeId: string
  episodeNumber: number
  title: string
  image: string
  url: string
}

export interface AnimeInfo extends Anime {
  description: string
  status: string
  otherName: string
  totalEpisodes: number
  subOrDub: string
  type: string
  releaseDate: string
  episodes: AnimeEpisode[]
}

export interface StreamingLink {
  url: string
  quality: string
  isM3U8: boolean
}

export interface AnimeServer {
  name: string
  url: string
}

// API response interface that matches Consumet API schema
export interface AnimeApiResponse {
  id: string
  title: string
  image: string
  releaseDate: string | null
  subOrDub: 'sub' | 'dub'
}

export interface AnimeSearchResponse {
  currentPage: number
  hasNextPage: boolean
  results: Anime[]
}

export interface AnimeEpisodesResponse {
  currentPage: number
  hasNextPage: boolean
  results: AnimeEpisode[]
}

// Generic media types for unified components
export type MediaType = 'video' | 'anime'

export interface BaseMedia {
  id: string
  title: string
  image: string
  url: string
  type: MediaType
}

export interface VideoMedia extends BaseMedia {
  type: 'video'
  description: string
  channelTitle: string
  channelId: string
  publishedAt: string
  duration: string
  viewCount: string
}

export interface AnimeMedia extends BaseMedia {
  type: 'anime'
  genres?: string[]
  description?: string
  status?: string
  totalEpisodes?: number
  subOrDub?: string
}

export type Media = VideoMedia | AnimeMedia

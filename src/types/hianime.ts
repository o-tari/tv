// HiAnime API types based on the API response structure

export interface HiAnimeEpisodes {
  sub: number | null
  dub: number | null
}

export interface HiAnimeSpotlight {
  rank: number
  id: string
  name: string
  description: string
  poster: string
  jname: string
  episodes: HiAnimeEpisodes
  otherInfo: string[]
}

export interface HiAnimeTrending {
  rank: number
  name: string
  id: string
  poster: string
}

export interface HiAnimeLatestEpisode {
  id: string
  name: string
  poster: string
  duration: string
  type: string
  rating: string | null
  episodes: HiAnimeEpisodes
}

export interface HiAnimeUpcoming {
  id: string
  name: string
  poster: string
  duration: string
  type: string
  rating: string | null
  episodes: HiAnimeEpisodes
}

export interface HiAnimeTop10 {
  id: string
  rank: number
  name: string
  poster: string
  episodes: HiAnimeEpisodes
}

export interface HiAnimeTop10Data {
  today: HiAnimeTop10[]
  week: HiAnimeTop10[]
  month: HiAnimeTop10[]
}

export interface HiAnimeTopAiring {
  id: string
  name: string
  jname: string
  poster: string
  otherInfo: string[]
}

export interface HiAnimeHomeResponse {
  spotlightAnimes: HiAnimeSpotlight[]
  trendingAnimes: HiAnimeTrending[]
  latestEpisodeAnimes: HiAnimeLatestEpisode[]
  topUpcomingAnimes: HiAnimeUpcoming[]
  top10Animes: HiAnimeTop10Data
  topAiringAnimes: HiAnimeTopAiring[]
  mostPopularAnimes: HiAnimeMostPopular[]
  mostFavoriteAnimes: HiAnimeMostFavorite[]
  latestCompletedAnimes: HiAnimeLatestCompleted[]
  genres: string[]
}

// Anime Info API types
export interface HiAnimeStats {
  rating: string
  quality: string
  episodes: HiAnimeEpisodes
  type: string
  duration: string
}

export interface HiAnimePromotionalVideo {
  title: string
  source: string
  thumbnail: string
}

export interface HiAnimeCharacter {
  id: string
  poster: string
  name: string
  cast: string
}

export interface HiAnimeVoiceActor {
  id: string
  poster: string
  name: string
  cast: string
}

export interface HiAnimeCharacterVoiceActor {
  character: HiAnimeCharacter
  voiceActor: HiAnimeVoiceActor
}

export interface HiAnimeInfo {
  id: string
  anilistId: number
  malId: number
  name: string
  poster: string
  description: string
  stats: HiAnimeStats
  promotionalVideos: HiAnimePromotionalVideo[]
  charactersVoiceActors: HiAnimeCharacterVoiceActor[]
}

export interface HiAnimeMoreInfo {
  japanese: string
  synonyms: string
  aired: string
  premiered: string
  duration: string
  status: string
  malscore: string
  genres: string[]
  studios: string
  producers: string[]
}

export interface HiAnimeMostPopular {
  id: string
  name: string
  poster: string
  jname: string
  episodes: HiAnimeEpisodes
  type: string
}

export interface HiAnimeMostFavorite {
  id: string
  name: string
  poster: string
  jname: string
  episodes: HiAnimeEpisodes
  type: string
}

// Season types
export interface HiAnimeSeason {
  id: string
  name: string
  title: string
  poster: string
  isCurrent: boolean
}

// Related and Recommended Anime types
export interface HiAnimeRelatedAnime {
  id: string
  name: string
  jname: string
  poster: string
  episodes: HiAnimeEpisodes
  type: string
}

export interface HiAnimeRecommendedAnime {
  id: string
  name: string
  jname: string
  poster: string
  duration: string
  type: string
  rating: string | null
  episodes: HiAnimeEpisodes
}

export interface HiAnimeLatestCompleted {
  id: string
  name: string
  poster: string
  jname: string
  episodes: HiAnimeEpisodes
  type: string
}

export interface HiAnimeInfoResponse {
  anime: {
    info: HiAnimeInfo
    moreInfo: HiAnimeMoreInfo
  }
  seasons: HiAnimeSeason[]
  mostPopularAnimes: HiAnimeMostPopular[]
  relatedAnimes: HiAnimeRelatedAnime[]
  recommendedAnimes: HiAnimeRecommendedAnime[]
}

// Re-export HiAnimeMedia from anime types for convenience
export type { HiAnimeMedia } from './anime'

// Episode types for watch page
export interface HiAnimeEpisode {
  title: string
  episodeId: string
  number: number
  isFiller: boolean
}

export interface HiAnimeEpisodesResponse {
  totalEpisodes: number
  episodes: HiAnimeEpisode[]
}

// Server types for streaming
export interface HiAnimeServer {
  serverName: string
  serverId: number
}

export interface HiAnimeServersResponse {
  sub: HiAnimeServer[]
  dub: HiAnimeServer[]
  raw: HiAnimeServer[]
  episodeId: string
  episodeNo: number
}

// Episode sources response
export interface HiAnimeEpisodeSources {
  headers: { Referer: string }
  tracks: Array<{ url: string; lang: string }>
  intro: { start: number; end: number }
  outro: { start: number; end: number }
  sources: Array<{ url: string; type: string }>
  anilistID: number
  malID: number
}

// Search types
export interface HiAnimeSearchAnime {
  id: string
  name: string
  jname: string
  poster: string
  duration: string
  type: string
  rating: string | null
  episodes: HiAnimeEpisodes
}

export interface HiAnimeSearchFilters {
  sort: string
  status: string
  rated: string
  genres: string
  type: string
  score: string
  language: string
  season: string
}

export interface HiAnimeSearchResponse {
  animes: HiAnimeSearchAnime[]
  mostPopularAnimes: HiAnimeMostPopular[]
  searchQuery: string
  searchFilters: HiAnimeSearchFilters
  totalPages: number
  hasNextPage: boolean
  currentPage: number
}

// Cache types
export interface HiAnimeCacheData {
  data: any
  timestamp: number
  expiresAt: number
}

export interface HiAnimeCache {
  [key: string]: HiAnimeCacheData
}

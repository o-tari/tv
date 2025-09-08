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
  seasons: any[]
  mostPopularAnimes: HiAnimeMostPopular[]
}

// Re-export HiAnimeMedia from anime types for convenience
export type { HiAnimeMedia } from './anime'

// Cache types
export interface HiAnimeCacheData {
  data: any
  timestamp: number
  expiresAt: number
}

export interface HiAnimeCache {
  [key: string]: HiAnimeCacheData
}

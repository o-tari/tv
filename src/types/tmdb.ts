export interface TMDBMovie {
  id: number
  title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string
  vote_average: number
  vote_count: number
  adult: boolean
  genre_ids: number[]
  original_language: string
  original_title: string
  popularity: number
  video: boolean
}

export interface TMDBTVShow {
  id: number
  name: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  first_air_date: string
  vote_average: number
  vote_count: number
  adult: boolean
  genre_ids: number[]
  origin_country: string[]
  original_language: string
  original_name: string
  popularity: number
}

export interface TMDBKeyword {
  id: number
  name: string
}

export interface TMDBVideo {
  id: string
  iso_639_1: string
  iso_3166_1: string
  key: string
  name: string
  official: boolean
  published_at: string
  site: string
  size: number
  type: string
}

export interface TMDBGenre {
  id: number
  name: string
}

export interface TMDBSeason {
  air_date: string
  episode_count: number
  id: number
  name: string
  overview: string
  poster_path: string | null
  season_number: number
}

export interface TMDBEpisode {
  air_date: string
  episode_number: number
  id: number
  name: string
  overview: string
  production_code: string
  season_number: number
  still_path: string | null
  vote_average: number
  vote_count: number
}

export interface TMDBMovieDetails extends TMDBMovie {
  genres: TMDBGenre[]
  runtime: number
  status: string
  tagline: string
  videos: {
    results: TMDBVideo[]
  }
}

export interface TMDBTVDetails extends TMDBTVShow {
  genres: TMDBGenre[]
  number_of_episodes: number
  number_of_seasons: number
  status: string
  tagline: string
  seasons: TMDBSeason[]
  videos: {
    results: TMDBVideo[]
  }
}

export interface TMDBResponse<T> {
  page: number
  results: T[]
  total_pages: number
  total_results: number
}

export interface TMDBKeywordResponse {
  page: number
  results: TMDBKeyword[]
  total_pages: number
  total_results: number
}

// Union types
export type TMDBContent = TMDBMovie | TMDBTVShow
export type TMDBContentDetails = TMDBMovieDetails | TMDBTVDetails

// Force reload - updated

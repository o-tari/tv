import axios, { type AxiosResponse } from 'axios'
import { requestCache } from '../utils/requestCache'

// Jikan API base URL
const JIKAN_BASE_URL = 'https://api.jikan.moe/v4'

// Jikan API types
export interface JikanAnime {
  mal_id: number
  url: string
  images: {
    jpg: {
      image_url: string
      small_image_url: string
      large_image_url: string
    }
    webp: {
      image_url: string
      small_image_url: string
      large_image_url: string
    }
  }
  trailer: {
    youtube_id: string | null
    url: string | null
    embed_url: string | null
  }
  approved: boolean
  titles: Array<{
    type: string
    title: string
  }>
  title: string
  title_english: string | null
  title_japanese: string | null
  title_synonyms: string[]
  type: string
  source: string
  episodes: number | null
  status: string
  airing: boolean
  aired: {
    from: string | null
    to: string | null
    prop: {
      from: {
        day: number | null
        month: number | null
        year: number | null
      }
      to: {
        day: number | null
        month: number | null
        year: number | null
      }
    }
    string: string
  }
  duration: string
  rating: string
  score: number | null
  scored_by: number | null
  rank: number | null
  popularity: number | null
  members: number | null
  favorites: number | null
  synopsis: string | null
  background: string | null
  season: string | null
  year: number | null
  broadcast: {
    day: string | null
    time: string | null
    timezone: string | null
    string: string | null
  }
  producers: Array<{
    mal_id: number
    type: string
    name: string
    url: string
  }>
  licensors: Array<{
    mal_id: number
    type: string
    name: string
    url: string
  }>
  studios: Array<{
    mal_id: number
    type: string
    name: string
    url: string
  }>
  genres: Array<{
    mal_id: number
    type: string
    name: string
    url: string
  }>
  explicit_genres: Array<{
    mal_id: number
    type: string
    name: string
    url: string
  }>
  themes: Array<{
    mal_id: number
    type: string
    name: string
    url: string
  }>
  demographics: Array<{
    mal_id: number
    type: string
    name: string
    url: string
  }>
}

export interface JikanPagination {
  last_visible_page: number
  has_next_page: boolean
  current_page: number
  items: {
    count: number
    total: number
    per_page: number
  }
}

export interface JikanSearchResponse {
  data: JikanAnime[]
  pagination: JikanPagination
}

export interface JikanRecommendation {
  entry: {
    mal_id: number
    url: string
    images: {
      jpg: {
        image_url: string
        small_image_url: string
        large_image_url: string
      }
      webp: {
        image_url: string
        small_image_url: string
        large_image_url: string
      }
    }
    title: string
  }
  url: string
  votes: number
}

export interface JikanVideoEpisode {
  mal_id: number
  title: string
  episode: string
  url: string
  images: {
    jpg: {
      image_url: string
    }
  }
}

export interface JikanVideoResponse {
  data: JikanVideoEpisode[]
  pagination: JikanPagination
}

export interface JikanEpisode {
  mal_id: number
  url: string | null
  title: string
  title_japanese: string | null
  title_romanji: string | null
  aired: string | null
  score: number | null
  filler: boolean
  recap: boolean
  forum_url: string | null
}

export interface JikanEpisodesResponse {
  data: JikanEpisode[]
  pagination: JikanPagination
}

// Search anime using Jikan API
export const searchAnime = async (
  query: string,
  page: number = 1,
  limit: number = 25,
  type?: string,
  status?: string,
  rating?: string,
  genres?: string,
  order_by?: string,
  sort?: string
): Promise<JikanSearchResponse> => {
  const params = {
    q: query,
    page,
    limit,
    ...(type && { type }),
    ...(status && { status }),
    ...(rating && { rating }),
    ...(genres && { genres }),
    ...(order_by && { order_by }),
    ...(sort && { sort })
  }

  return requestCache.get('/jikan/search', params, async () => {
    const response: AxiosResponse<JikanSearchResponse> = await axios.get(
      `${JIKAN_BASE_URL}/anime`,
      { params }
    )
    return response.data
  })
}

// Get top anime using Jikan API
export const getTopAnime = async (
  page: number = 1,
  limit: number = 25,
  type?: string,
  filter?: string,
  rating?: string,
  sfw?: boolean
): Promise<JikanSearchResponse> => {
  const params = {
    page,
    limit,
    ...(type && { type }),
    ...(filter && { filter }),
    ...(rating && { rating }),
    ...(sfw !== undefined && { sfw })
  }

  return requestCache.get('/jikan/top', params, async () => {
    const response: AxiosResponse<JikanSearchResponse> = await axios.get(
      `${JIKAN_BASE_URL}/top/anime`,
      { params }
    )
    return response.data
  })
}

// Get anime recommendations
export const getAnimeRecommendations = async (animeId: number): Promise<JikanRecommendation[]> => {
  return requestCache.get('/jikan/recommendations', { id: animeId }, async () => {
    const response: AxiosResponse<{ data: JikanRecommendation[] }> = await axios.get(
      `${JIKAN_BASE_URL}/anime/${animeId}/recommendations`
    )
    return response.data.data
  })
}

// Get anime episodes
export const getAnimeEpisodes = async (
  animeId: number,
  page: number = 1
): Promise<JikanEpisodesResponse> => {
  const params = { page }

  return requestCache.get('/jikan/episodes', { id: animeId, ...params }, async () => {
    const response: AxiosResponse<JikanEpisodesResponse> = await axios.get(
      `${JIKAN_BASE_URL}/anime/${animeId}/episodes`,
      { params }
    )
    return response.data
  })
}

// Get anime video episodes
export const getAnimeVideoEpisodes = async (
  animeId: number,
  page: number = 1
): Promise<JikanVideoResponse> => {
  const params = { page }

  return requestCache.get('/jikan/videos', { id: animeId, ...params }, async () => {
    const response: AxiosResponse<JikanVideoResponse> = await axios.get(
      `${JIKAN_BASE_URL}/anime/${animeId}/videos/episodes`,
      { params }
    )
    return response.data
  })
}

// Get anime by ID
export const getAnimeById = async (animeId: number): Promise<JikanAnime> => {
  return requestCache.get('/jikan/anime', { id: animeId }, async () => {
    const response: AxiosResponse<{ data: JikanAnime }> = await axios.get(
      `${JIKAN_BASE_URL}/anime/${animeId}`
    )
    return response.data.data
  })
}

// Convert Jikan anime to internal format
export const convertJikanAnimeToAnime = (jikanAnime: JikanAnime) => ({
  id: jikanAnime.mal_id.toString(),
  title: jikanAnime.title,
  image: jikanAnime.images.jpg.large_image_url || jikanAnime.images.jpg.image_url,
  url: `/anime/${jikanAnime.mal_id}`,
  genres: jikanAnime.genres.map(genre => genre.name),
  description: jikanAnime.synopsis || '',
  status: jikanAnime.status,
  otherName: jikanAnime.title_english || jikanAnime.title_japanese || '',
  totalEpisodes: jikanAnime.episodes || 0,
  subOrDub: 'sub', // Jikan doesn't provide this info
  type: jikanAnime.type,
  releaseDate: jikanAnime.aired.from || '',
  score: jikanAnime.score,
  scoredBy: jikanAnime.scored_by,
  rank: jikanAnime.rank,
  popularity: jikanAnime.popularity,
  members: jikanAnime.members,
  favorites: jikanAnime.favorites,
  year: jikanAnime.year,
  season: jikanAnime.season,
  duration: jikanAnime.duration,
  rating: jikanAnime.rating,
  studios: jikanAnime.studios.map(studio => studio.name),
  producers: jikanAnime.producers.map(producer => producer.name)
})

// Convert Jikan episode to internal format
export const convertJikanEpisodeToAnimeEpisode = (jikanEpisode: JikanEpisode, episodeNumber: number) => ({
  id: jikanEpisode.mal_id.toString(),
  episodeId: jikanEpisode.mal_id.toString(),
  episodeNumber,
  title: jikanEpisode.title,
  image: '', // Jikan episodes don't have images
  url: jikanEpisode.url || '',
  mal_id: jikanEpisode.mal_id,
  title_japanese: jikanEpisode.title_japanese,
  title_romanji: jikanEpisode.title_romanji,
  aired: jikanEpisode.aired,
  score: jikanEpisode.score,
  filler: jikanEpisode.filler,
  recap: jikanEpisode.recap,
  forum_url: jikanEpisode.forum_url
})

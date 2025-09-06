import axios, { type AxiosResponse } from 'axios'
import { 
  type AnimeInfo, 
  type AnimeSearchResponse, 
  type AnimeEpisodesResponse,
  type StreamingLink,
  type AnimeServer
} from '../types/anime'
import { requestCache } from '../utils/requestCache'
import { store } from '../store'
import { selectConsumetApiUrl } from '../store/slices/settingsSlice'

const getApiBaseUrl = () => {
  const state = store.getState()
  const baseUrl = selectConsumetApiUrl(state)
  return `${baseUrl}/anime/gogoanime`
}

// Search anime
export const searchAnime = async (
  query: string,
  page: number = 1
): Promise<AnimeSearchResponse> => {
  const params = { q: query, page }
  
  return requestCache.get('/search', params, async () => {
    const response: AxiosResponse = await axios.get(`${getApiBaseUrl()}/search`, { params })
    return response.data
  })
}

// Get top airing anime
export const getTopAiringAnime = async (page: number = 1): Promise<AnimeSearchResponse> => {
  const params = { page }
  
  return requestCache.get('/top-airing', params, async () => {
    const response: AxiosResponse = await axios.get(`${getApiBaseUrl()}/top-airing`, { params })
    return response.data
  })
}

// Get recent episodes
export const getRecentEpisodes = async (
  page: number = 1,
  type: number = 1
): Promise<AnimeEpisodesResponse> => {
  const params = { page, type }
  
  return requestCache.get('/recent-episodes', params, async () => {
    const response: AxiosResponse = await axios.get(`${getApiBaseUrl()}/recent-episodes`, { params })
    return response.data
  })
}

// Get anime info
export const getAnimeInfo = async (animeId: string): Promise<AnimeInfo> => {
  return requestCache.get('/info', { id: animeId }, async () => {
    const response: AxiosResponse = await axios.get(`${getApiBaseUrl()}/info/${animeId}`)
    return response.data
  })
}

// Get anime episode streaming links
export const getAnimeEpisodeStreamingLinks = async (
  episodeId: string,
  server: string = 'gogocdn'
): Promise<StreamingLink[]> => {
  return requestCache.get('/streaming-links', { episodeId, server }, async () => {
    const response: AxiosResponse = await axios.get(`${getApiBaseUrl()}/watch/${episodeId}`, {
      params: { server }
    })
    return response.data.sources || []
  })
}

// Get available servers for anime episode
export const getAnimeEpisodeServers = async (episodeId: string): Promise<AnimeServer[]> => {
  return requestCache.get('/servers', { episodeId }, async () => {
    const response: AxiosResponse = await axios.get(`${getApiBaseUrl()}/servers/${episodeId}`)
    return response.data || []
  })
}

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
import { mockAnimeSearchResponse, mockAnimeEpisodesResponse } from './animeMockData'

const getApiBaseUrl = () => {
  const state = store.getState()
  const baseUrl = selectConsumetApiUrl(state)
  return `${baseUrl}/anime/animepahe`
}

// Search anime
export const searchAnime = async (
  query: string,
  page: number = 1
): Promise<AnimeSearchResponse> => {
  const params = { page }
  
  return requestCache.get('/search', params, async () => {
    try {
      const response: AxiosResponse = await axios.get(`${getApiBaseUrl()}/${encodeURIComponent(query)}`, { params })
      return response.data
    } catch (error) {
      console.warn('Animepahe API not available, using mock data:', error)
      // Return filtered mock data based on query
      const filteredResults = mockAnimeSearchResponse.results.filter(anime => 
        anime.title.toLowerCase().includes(query.toLowerCase())
      )
      return {
        ...mockAnimeSearchResponse,
        results: filteredResults
      }
    }
  })
}

// Get top airing anime (using search with popular terms)
export const getTopAiringAnime = async (page: number = 1): Promise<AnimeSearchResponse> => {
  // Animepahe doesn't have a dedicated top airing endpoint, so we'll use a popular search term
  try {
    return await searchAnime('anime', page)
  } catch (error) {
    console.warn('Animepahe API not available, using mock data for top airing:', error)
    return mockAnimeSearchResponse
  }
}

// Get recent episodes (using search with recent terms)
export const getRecentEpisodes = async (
  page: number = 1,
  _type: number = 1
): Promise<AnimeEpisodesResponse> => {
  try {
    // Animepahe doesn't have a dedicated recent episodes endpoint, so we'll use search
    const searchResult = await searchAnime('new', page)
    // Convert search results to episodes format
    return {
      currentPage: searchResult.currentPage,
      hasNextPage: searchResult.hasNextPage,
      results: searchResult.results.map(anime => ({
        id: anime.id,
        episodeId: anime.id,
        episodeNumber: 1, // Default episode number
        title: anime.title,
        image: anime.image,
        url: anime.url,
      }))
    }
  } catch (error) {
    console.warn('Animepahe API not available, using mock data for recent episodes:', error)
    return mockAnimeEpisodesResponse
  }
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
  server: string = 'animepahe'
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

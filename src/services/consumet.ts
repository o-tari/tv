import axios, { type AxiosResponse } from 'axios'
import { 
  type AnimeInfo, 
  type AnimeSearchResponse, 
  type AnimeEpisodesResponse,
  type StreamingLink,
  type AnimeServer,
  type AnimeApiResponse,
  type Anime
} from '../types/anime'
import { requestCache } from '../utils/requestCache'
import { store } from '../store'
import { selectConsumetApiUrl, selectUseMockData } from '../store/slices/settingsSlice'
import { mockAnimeSearchResponse, mockAnimeEpisodesResponse } from './animeMockData'

const getApiBaseUrl = () => {
  const state = store.getState()
  const baseUrl = selectConsumetApiUrl(state)
  // Only return URL if one is configured
  if (!baseUrl || baseUrl.trim() === '') {
    return null
  }
  return `${baseUrl}/anime/zoro`
}

// Check if we should use mock data for anime services
const shouldUseMockData = () => {
  const state = store.getState()
  return selectUseMockData(state)
}

// Map API response to internal Anime format
const mapApiResponseToAnime = (apiResponse: AnimeApiResponse): Anime => ({
  id: apiResponse.id,
  title: apiResponse.title,
  image: apiResponse.image,
  url: `/anime/${apiResponse.id}`, // Generate URL based on ID
  releaseDate: apiResponse.releaseDate || undefined,
  subOrDub: apiResponse.subOrDub,
  // Set default values for fields not provided by API
  genres: [],
  description: '',
  status: 'Unknown',
  totalEpisodes: 0,
  type: 'TV'
})

// Search anime
export const searchAnime = async (
  query: string,
  page: number = 1
): Promise<AnimeSearchResponse> => {
  const params = { page }
  
  return requestCache.get('/search', params, async () => {
    // If mock data is enabled, always use mock data
    if (shouldUseMockData()) {
      console.log('Mock data enabled, using mock data for anime search')
      const filteredResults = mockAnimeSearchResponse.results.filter(anime => 
        anime.title.toLowerCase().includes(query.toLowerCase())
      )
      return {
        ...mockAnimeSearchResponse,
        results: filteredResults
      }
    }
    
    const baseUrl = getApiBaseUrl()
    
    // If no API URL is configured, throw error
    if (!baseUrl) {
      throw new Error('Consumet API URL is required. Please configure your API URL in settings.')
    }
    
    const url = `${baseUrl}/${encodeURIComponent(query)}`
    console.log('Making API request to:', url, 'with params:', params)
    const response: AxiosResponse<{totalPages: number, currentPage: number, hasNextPage: boolean, results: AnimeApiResponse[]}> = await axios.get(url, { params })
    console.log('API response received:', response.data)
    // Map API response to internal format
    const mappedResults = response.data.results.map(mapApiResponseToAnime)
    console.log('Mapped results:', mappedResults)
    return {
      currentPage: response.data.currentPage,
      hasNextPage: response.data.hasNextPage,
      results: mappedResults
    }
  })
}

// Get top airing anime (using search with popular terms)
export const getTopAiringAnime = async (page: number = 1): Promise<AnimeSearchResponse> => {
  // If mock data is enabled, always use mock data
  if (shouldUseMockData()) {
    console.log('Mock data enabled, using mock data for top airing anime')
    return mockAnimeSearchResponse
  }
  
  const baseUrl = getApiBaseUrl()
  
  // If no API URL is configured, throw error
  if (!baseUrl) {
    throw new Error('Consumet API URL is required. Please configure your API URL in settings.')
  }
  
  // Zoro doesn't have a dedicated top airing endpoint, so we'll use a popular search term
  return await searchAnime('anime', page)
}

// Get recent episodes (using search with recent terms)
export const getRecentEpisodes = async (
  page: number = 1,
  _type: number = 1
): Promise<AnimeEpisodesResponse> => {
  // If mock data is enabled, always use mock data
  if (shouldUseMockData()) {
    console.log('Mock data enabled, using mock data for recent episodes')
    return mockAnimeEpisodesResponse
  }
  
  const baseUrl = getApiBaseUrl()
  
  // If no API URL is configured, throw error
  if (!baseUrl) {
    throw new Error('Consumet API URL is required. Please configure your API URL in settings.')
  }
  
  // Zoro doesn't have a dedicated recent episodes endpoint, so we'll use search
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
}

// Get anime info
export const getAnimeInfo = async (animeId: string): Promise<AnimeInfo> => {
  return requestCache.get('/info', { id: animeId }, async () => {
    const baseUrl = getApiBaseUrl()
    
    // If no API URL is configured, throw error
    if (!baseUrl) {
      throw new Error('Consumet API URL is required. Please configure your API URL in settings.')
    }
    
    const response: AxiosResponse = await axios.get(`${baseUrl}/info`, { params: { id: animeId } })
    return response.data
  })
}

// Get anime episode streaming links
export const getAnimeEpisodeStreamingLinks = async (
  episodeId: string
): Promise<{ headers: any; sources: StreamingLink[] }> => {
  return requestCache.get('/streaming-links', { episodeId }, async () => {
    const baseUrl = getApiBaseUrl()
    
    // If no API URL is configured, throw error
    if (!baseUrl) {
      throw new Error('Consumet API URL is required. Please configure your API URL in settings.')
    }
    
    // URL encode the episode ID to handle special characters and slashes
    const response: AxiosResponse = await axios.get(`${baseUrl}/watch`, { 
      params: { 
        episodeId: episodeId,
        server: 'vidcloud'
      } 
    })
    return response.data
  })
}

// Get available servers for anime episode (Zoro supports multiple servers)
export const getAnimeEpisodeServers = async (episodeId: string): Promise<AnimeServer[]> => {
  // Zoro supports multiple servers, return the available options
  return [
    { name: 'vidcloud', url: 'vidcloud' },
    { name: 'streamsb', url: 'streamsb' },
    { name: 'vidstreaming', url: 'vidstreaming' },
    { name: 'streamtape', url: 'streamtape' }
  ]
}

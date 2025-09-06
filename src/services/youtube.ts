import axios, { type AxiosResponse } from 'axios'
import { 
  mockVideos, 
  mockChannel, 
  mockSearchResults, 
  mockRelatedVideos
} from './mockData'
import { type Video, type Channel, type SearchFilters, type SearchResponse } from '../types/youtube'
import { createApiInstance } from '../utils/apiConfig'
import { requestCache } from '../utils/requestCache'


// Create API instance with current configuration
const getApiInstance = () => {
  const config = createApiInstance()
  
  return axios.create({
    baseURL: config.baseURL,
    params: config.params,
  })
}

// Check if we should use mock data
const shouldUseMockData = () => {
  const config = createApiInstance()
  return config.useMockData
}

// Error handling helper
const handleApiError = (error: any) => {
  if (error.response?.status === 403) {
    throw new Error('API quota exceeded. Please try again later.')
  }
  if (error.response?.status === 400) {
    throw new Error('Invalid request. Please check your search parameters.')
  }
  throw error
}


// Search videos
export const searchVideos = async (
  query: string,
  filters: SearchFilters = {},
  pageToken?: string
): Promise<SearchResponse> => {
  if (shouldUseMockData()) {
    await new Promise(resolve => setTimeout(resolve, 600))
    // Filter mock videos based on query
    const filteredVideos = mockVideos.filter(video => 
      video.title.toLowerCase().includes(query.toLowerCase()) ||
      video.description.toLowerCase().includes(query.toLowerCase()) ||
      video.channelTitle.toLowerCase().includes(query.toLowerCase())
    )
    
    // For pagination, return different sets of videos
    if (pageToken) {
      const additionalVideos = filteredVideos.map((video, index) => ({
        ...video,
        id: `${video.id}-search-${index}`,
        title: `${video.title} (Search Page 2)`,
      }))
      return {
        items: additionalVideos,
        nextPageToken: undefined, // No more pages for demo
        totalResults: filteredVideos.length * 10,
      }
    }
    
    return {
      items: filteredVideos,
      nextPageToken: 'mock-search-next',
      totalResults: filteredVideos.length * 10, // Simulate more results
    }
  }

  const params: any = {
    part: 'snippet',
    q: query,
    type: filters.type || 'video',
    maxResults: 25,
    order: filters.sortBy || 'relevance',
  }

  if (pageToken) {
    params.pageToken = pageToken
  }

  if (filters.duration) {
    params.videoDuration = filters.duration
  }

  if (filters.uploadDate) {
    const now = new Date()
    let publishedAfter: string

    switch (filters.uploadDate) {
      case 'hour':
        publishedAfter = new Date(now.getTime() - 60 * 60 * 1000).toISOString()
        break
      case 'today':
        publishedAfter = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
        break
      case 'week':
        publishedAfter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
        break
      case 'month':
        publishedAfter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
        break
      case 'year':
        publishedAfter = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString()
        break
      default:
        publishedAfter = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
    }
    params.publishedAfter = publishedAfter
  }

  return requestCache.get('/search', params, async () => {
    const api = getApiInstance()
    const response: AxiosResponse = await api.get('/search', { params })
    
    return {
      items: response.data.items.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
        channelTitle: item.snippet.channelTitle,
        channelId: item.snippet.channelId,
        publishedAt: item.snippet.publishedAt,
        duration: '', // Will be filled by getVideoDetails
        viewCount: '', // Will be filled by getVideoDetails
      })),
      nextPageToken: response.data.nextPageToken,
      totalResults: response.data.pageInfo.totalResults,
    }
  })
}

// Get video details
export const getVideoDetails = async (videoId: string): Promise<Video> => {
  if (shouldUseMockData()) {
    await new Promise(resolve => setTimeout(resolve, 300))
    const video = mockVideos.find(v => v.id === videoId) || mockVideos[0]
    return video
  }

  try {
    const api = getApiInstance()
    const response: AxiosResponse = await api.get('/videos', {
      params: {
        id: videoId,
        part: 'snippet,statistics,contentDetails',
      },
    })

    const video = response.data.items[0]
    if (!video) {
      throw new Error('Video not found')
    }

    return {
      id: video.id,
      title: video.snippet.title,
      description: video.snippet.description,
      thumbnail: video.snippet.thumbnails.maxres?.url || video.snippet.thumbnails.high?.url,
      channelTitle: video.snippet.channelTitle,
      channelId: video.snippet.channelId,
      publishedAt: video.snippet.publishedAt,
      duration: video.contentDetails.duration,
      viewCount: video.statistics.viewCount,
    }
  } catch (error) {
    handleApiError(error)
    throw error // This will never be reached, but satisfies TypeScript
  }
}

// Get trending videos
export const getTrendingVideos = async (pageToken?: string): Promise<SearchResponse> => {
  if (shouldUseMockData()) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // For pagination, return different sets of videos
    if (pageToken) {
      // Return a different set of videos for pagination
      const additionalVideos = mockVideos.map((video, index) => ({
        ...video,
        id: `${video.id}-page2-${index}`,
        title: `${video.title} (Page 2)`,
      }))
      return {
        items: additionalVideos,
        nextPageToken: undefined, // No more pages for demo
        totalResults: 1000,
      }
    }
    
    return mockSearchResults
  }

  const params: any = {
    part: 'snippet,statistics,contentDetails',
    chart: 'mostPopular',
    maxResults: 25,
  }

  if (pageToken) {
    params.pageToken = pageToken
  }

  return requestCache.get('/videos', params, async () => {
    const api = getApiInstance()
    const response: AxiosResponse = await api.get('/videos', { params })
    
    return {
      items: response.data.items.map((item: any) => ({
        id: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
        channelTitle: item.snippet.channelTitle,
        channelId: item.snippet.channelId,
        publishedAt: item.snippet.publishedAt,
        duration: item.contentDetails.duration,
        viewCount: item.statistics.viewCount,
      })),
      nextPageToken: response.data.nextPageToken,
      totalResults: response.data.pageInfo.totalResults,
    }
  })
}

// Get channel details
export const getChannelDetails = async (channelId: string): Promise<Channel> => {
  if (shouldUseMockData()) {
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockChannel
  }

  try {
    const api = getApiInstance()
    const response: AxiosResponse = await api.get('/channels', {
      params: {
        id: channelId,
        part: 'snippet,statistics,brandingSettings',
      },
    })

    const channel = response.data.items[0]
    if (!channel) {
      throw new Error('Channel not found')
    }

    return {
      id: channel.id,
      title: channel.snippet.title,
      description: channel.snippet.description,
      thumbnail: channel.snippet.thumbnails.medium?.url || channel.snippet.thumbnails.default?.url,
      subscriberCount: channel.statistics.subscriberCount,
      videoCount: channel.statistics.videoCount,
      viewCount: channel.statistics.viewCount,
      customUrl: channel.snippet.customUrl,
      country: channel.snippet.country,
    }
  } catch (error) {
    handleApiError(error)
    throw error // This will never be reached, but satisfies TypeScript
  }
}

// Get channel videos
export const getChannelVideos = async (
  channelId: string,
  pageToken?: string
): Promise<SearchResponse> => {
  if (shouldUseMockData()) {
    await new Promise(resolve => setTimeout(resolve, 400))
    return {
      items: mockVideos.slice(0, 3), // Show first 3 videos for channel
      nextPageToken: 'mock-channel-next',
      totalResults: 150,
    }
  }

  const params: any = {
    part: 'snippet',
    channelId,
    type: 'video',
    maxResults: 25,
    order: 'date',
  }

  if (pageToken) {
    params.pageToken = pageToken
  }

  return requestCache.get('/search', params, async () => {
    const api = getApiInstance()
    const response: AxiosResponse = await api.get('/search', { params })
    
    return {
      items: response.data.items.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
        channelTitle: item.snippet.channelTitle,
        channelId: item.snippet.channelId,
        publishedAt: item.snippet.publishedAt,
        duration: '', // Will be filled by getVideoDetails
        viewCount: '', // Will be filled by getVideoDetails
      })),
      nextPageToken: response.data.nextPageToken,
      totalResults: response.data.pageInfo.totalResults,
    }
  })
}


// Get related videos
export const getRelatedVideos = async (
  videoId: string,
  pageToken?: string
): Promise<SearchResponse> => {
  if (shouldUseMockData()) {
    await new Promise(resolve => setTimeout(resolve, 400))
    return mockRelatedVideos
  }

  const params: any = {
    part: 'snippet',
    relatedToVideoId: videoId,
    type: 'video',
    maxResults: 25,
  }

  if (pageToken) {
    params.pageToken = pageToken
  }

  return requestCache.get('/search', params, async () => {
    const api = getApiInstance()
    const response: AxiosResponse = await api.get('/search', { params })
    
    return {
      items: response.data.items.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
        channelTitle: item.snippet.channelTitle,
        channelId: item.snippet.channelId,
        publishedAt: item.snippet.publishedAt,
        duration: '', // Will be filled by getVideoDetails
        viewCount: '', // Will be filled by getVideoDetails
      })),
      nextPageToken: response.data.nextPageToken,
      totalResults: response.data.pageInfo.totalResults,
    }
  })
}

// Get video categories
export const getVideoCategories = async () => {
  try {
    const api = getApiInstance()
    const response: AxiosResponse = await api.get('/videoCategories', {
      params: {
        part: 'snippet',
      },
    })

    return response.data.items.map((item: any) => ({
      id: item.id,
      title: item.snippet.title,
    }))
  } catch (error) {
    handleApiError(error)
    throw error // This will never be reached, but satisfies TypeScript
  }
}


import axios, { type AxiosResponse } from 'axios'
import { 
  mockVideos, 
  mockChannel, 
  mockRelatedVideos
} from './mockData'
import { type Video, type Channel, type SearchFilters, type SearchResponse } from '../types/youtube'
import { createApiInstance } from '../utils/apiConfig'
import { localStorageCache } from '../utils/localStorageCache'
import { youtubeRateLimiter } from '../utils/rateLimiter'


// Create API instance with current settings
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
    const errorMessage = error.response?.data?.error?.message || 'Invalid request. Please check your search parameters.'
    throw new Error(`Bad Request: ${errorMessage}`)
  }
  if (error.response?.status === 401) {
    throw new Error('Invalid API key. Please check your YouTube API key in settings.')
  }
  if (error.response?.status === 404) {
    throw new Error('API endpoint not found. Please check your configuration.')
  }
  throw error
}

// Parse YouTube duration format (PT1M30S) to seconds
const parseDurationToSeconds = (duration: string): number => {
  if (!duration) return 0
  
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return 0
  
  const hours = parseInt(match[1] || '0', 10)
  const minutes = parseInt(match[2] || '0', 10)
  const seconds = parseInt(match[3] || '0', 10)
  
  return hours * 3600 + minutes * 60 + seconds
}


// Search videos
export const searchVideos = async (
  query: string,
  filters: SearchFilters = {},
  pageToken?: string,
  excludeShorts: boolean = true
): Promise<SearchResponse> => {
  if (shouldUseMockData()) {
    await new Promise(resolve => setTimeout(resolve, 600))
    // Filter mock videos based on query
    let filteredVideos = mockVideos.filter(video => 
      video.title.toLowerCase().includes(query.toLowerCase()) ||
      video.description.toLowerCase().includes(query.toLowerCase()) ||
      video.channelTitle.toLowerCase().includes(query.toLowerCase())
    )
    
    // Filter out shorts if requested
    if (excludeShorts) {
      filteredVideos = filteredVideos.filter(video => {
        const duration = video.duration || 'PT1M30S' // Default to 1.5 minutes for mock data
        const durationSeconds = parseDurationToSeconds(duration)
        return durationSeconds >= 60
      })
    }
    
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

  // Check if API key is available when not using mock data
  const config = createApiInstance()
  if (!config.params.key) {
    throw new Error('YouTube API key is required. Please configure your API key in settings or enable mock data mode.')
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

  if (filters.categoryId) {
    params.videoCategoryId = filters.categoryId
  }

  return localStorageCache.getSearchResults(query, params, async () => {
    const api = getApiInstance()
    const response: AxiosResponse = await api.get('/search', { params })
    
    let items = response.data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
      channelTitle: item.snippet.channelTitle,
      channelId: item.snippet.channelId,
      publishedAt: item.snippet.publishedAt,
      duration: '', // Will be filled by getVideoDetails
      viewCount: '', // Will be filled by getVideoDetails
    }))

    // Note: We can't filter by duration here since we don't have duration data from search results
    // The filtering will be done after getting video details if needed
    
    return {
      items,
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

  // Check if API key is available when not using mock data
  const config = createApiInstance()
  if (!config.params.key) {
    throw new Error('YouTube API key is required. Please configure your API key in settings or enable mock data mode.')
  }

  return localStorageCache.getVideoDetails(videoId, async () => {
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
        tags: video.snippet.tags || [],
        categoryId: video.snippet.categoryId,
      }
    } catch (error) {
      handleApiError(error)
      throw error // This will never be reached, but satisfies TypeScript
    }
  })
}

// Get trending videos
export const getTrendingVideos = async (pageToken?: string, excludeShorts: boolean = true): Promise<SearchResponse> => {
  if (shouldUseMockData()) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Filter out shorts from mock data if requested
    let filteredVideos = mockVideos
    if (excludeShorts) {
      filteredVideos = mockVideos.filter(video => {
        // Mock videos with duration under 60 seconds are considered shorts
        const duration = video.duration || 'PT1M30S' // Default to 1.5 minutes for mock data
        const durationSeconds = parseDurationToSeconds(duration)
        return durationSeconds >= 60
      })
    }
    
    // For pagination, return different sets of videos
    if (pageToken) {
      // Return a different set of videos for pagination
      const additionalVideos = filteredVideos.map((video, index) => ({
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
    
    return {
      items: filteredVideos,
      nextPageToken: 'mock-trending-next',
      totalResults: filteredVideos.length * 10,
    }
  }

  // Check if API key is available when not using mock data
  const config = createApiInstance()
  if (!config.params.key) {
    throw new Error('YouTube API key is required. Please configure your API key in settings or enable mock data mode.')
  }

  const params: any = {
    part: 'snippet,statistics,contentDetails',
    chart: 'mostPopular',
    maxResults: 25,
  }

  if (pageToken) {
    params.pageToken = pageToken
  }

  try {
    return localStorageCache.getTrendingVideos(params, async () => {
      const api = getApiInstance()
      const response: AxiosResponse = await api.get('/videos', { params })
      
      let items = response.data.items.map((item: any) => ({
        id: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
        channelTitle: item.snippet.channelTitle,
        channelId: item.snippet.channelId,
        publishedAt: item.snippet.publishedAt,
        duration: item.contentDetails.duration,
        viewCount: item.statistics.viewCount,
      }))

      // Filter out shorts if requested
      if (excludeShorts) {
        items = items.filter((item: any) => {
          const durationSeconds = parseDurationToSeconds(item.duration)
          return durationSeconds >= 60 // Videos must be at least 60 seconds to not be considered shorts
        })
      }
      
      return {
        items,
        nextPageToken: response.data.nextPageToken,
        totalResults: response.data.pageInfo.totalResults,
      }
    })
  } catch (error) {
    // If API call fails, fall back to mock data
    console.warn('YouTube API call failed, falling back to mock data:', error)
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Filter out shorts from mock data if requested
    let filteredVideos = mockVideos
    if (excludeShorts) {
      filteredVideos = mockVideos.filter(video => {
        const duration = video.duration || 'PT1M30S' // Default to 1.5 minutes for mock data
        const durationSeconds = parseDurationToSeconds(duration)
        return durationSeconds >= 60
      })
    }
    
    // For pagination, return different sets of videos
    if (pageToken) {
      // Return a different set of videos for pagination
      const additionalVideos = filteredVideos.map((video, index) => ({
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
    
    return {
      items: filteredVideos,
      nextPageToken: 'mock-trending-next',
      totalResults: filteredVideos.length * 10,
    }
  }
}

// Get channel details
export const getChannelDetails = async (channelId: string): Promise<Channel> => {
  if (shouldUseMockData()) {
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockChannel
  }

  // Check if API key is available when not using mock data
  const config = createApiInstance()
  if (!config.params.key) {
    throw new Error('YouTube API key is required. Please configure your API key in settings or enable mock data mode.')
  }

  try {
    const api = getApiInstance()
    const response: AxiosResponse = await api.get('/channels', {
      params: {
        id: channelId,
        part: 'snippet,statistics,contentDetails,brandingSettings',
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
      uploadsPlaylistId: channel.contentDetails?.relatedPlaylists?.uploads,
    }
  } catch (error) {
    handleApiError(error)
    throw error // This will never be reached, but satisfies TypeScript
  }
}

// Get channel videos using playlistItems endpoint
export const getChannelVideos = async (
  channelId: string,
  pageToken?: string,
  uploadsPlaylistId?: string
): Promise<SearchResponse> => {
  if (shouldUseMockData()) {
    await new Promise(resolve => setTimeout(resolve, 400))
    return {
      items: mockVideos.slice(0, 3), // Show first 3 videos for channel
      nextPageToken: 'mock-channel-next',
      totalResults: 150,
    }
  }

  // Check if API key is available when not using mock data
  const config = createApiInstance()
  if (!config.params.key) {
    throw new Error('YouTube API key is required. Please configure your API key in settings or enable mock data mode.')
  }

  // If no uploadsPlaylistId provided, get it from channel details
  let playlistId = uploadsPlaylistId
  if (!playlistId) {
    try {
      const channelDetails = await getChannelDetails(channelId)
      playlistId = channelDetails.uploadsPlaylistId
      if (!playlistId) {
        throw new Error('Channel does not have an uploads playlist')
      }
    } catch (error) {
      console.error('Failed to get channel uploads playlist ID:', error)
      throw new Error('Failed to get channel uploads playlist')
    }
  }

  const params: any = {
    part: 'snippet,contentDetails',
    playlistId: playlistId,
    maxResults: 50,
  }

  if (pageToken) {
    params.pageToken = pageToken
  }

  return localStorageCache.getChannelVideos(channelId, params, async () => {
    // Apply rate limiting
    await youtubeRateLimiter.waitIfNeeded()
    
    try {
      const api = getApiInstance()
      const response: AxiosResponse = await api.get('/playlistItems', { params })
      
      // Convert playlist items to our video format
      const videoItems = response.data.items.map((item: any) => ({
        id: item.contentDetails.videoId,
        title: item.snippet.title,
        description: item.snippet.description || '',
        thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || '',
        channelTitle: item.snippet.channelTitle,
        channelId: item.snippet.channelId,
        publishedAt: item.snippet.publishedAt,
        duration: '', // Will be filled by getVideoDetails if needed
        viewCount: '', // Will be filled by getVideoDetails if needed
      }))

      return {
        items: videoItems,
        nextPageToken: response.data.nextPageToken,
        totalResults: response.data.pageInfo?.totalResults || videoItems.length,
      }
    } catch (error) {
      console.error('Failed to fetch channel videos from playlist:', error)
      handleApiError(error)
      throw error
    }
  })
}


// Helper function to extract keywords from title and description
const extractKeywords = (title: string, description: string): string => {
  // Common words to filter out
  const commonWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that',
    'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her',
    'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their', 'mine', 'yours',
    'hers', 'ours', 'theirs', 'how', 'what', 'when', 'where', 'why', 'who', 'which',
    'whom', 'whose', 'if', 'then', 'else', 'because', 'so', 'than', 'as', 'like',
    'about', 'above', 'after', 'before', 'below', 'between', 'during', 'through',
    'under', 'up', 'down', 'out', 'off', 'over', 'around', 'near', 'far', 'here',
    'there', 'everywhere', 'nowhere', 'somewhere', 'anywhere', 'always', 'never',
    'sometimes', 'often', 'usually', 'rarely', 'seldom', 'frequently', 'occasionally'
  ])

  // Combine title and description
  const text = `${title} ${description}`.toLowerCase()
  
  // Extract words (alphanumeric characters only)
  const words = text.split(/\W+/)
    .filter(word => 
      word.length > 2 && 
      !commonWords.has(word) &&
      !/^\d+$/.test(word) && // Not just numbers
      !/^[a-z]$/.test(word)  // Not single letters
    )
  
  // Get unique words and limit to 5 most relevant
  const uniqueWords = [...new Set(words)].slice(0, 5)
  return uniqueWords.join(' ')
}

// Helper function to search with parameters and filter results
const searchWithParams = async (params: any, excludeVideoId: string, excludeChannelId?: string) => {
  const api = getApiInstance()
  const response = await api.get('/search', { params })
  
  // Filter out the current video and optionally videos from the same channel
  const filteredItems = response.data.items.filter((item: any) => {
    const isCurrentVideo = item.id.videoId === excludeVideoId
    const isSameChannel = excludeChannelId && item.snippet.channelId === excludeChannelId
    return !isCurrentVideo && !isSameChannel
  })
  
  return {
    items: filteredItems.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
      channelTitle: item.snippet.channelTitle,
      channelId: item.snippet.channelId,
      publishedAt: item.snippet.publishedAt,
      duration: '',
      viewCount: '',
    })),
    nextPageToken: response.data.nextPageToken,
    totalResults: response.data.pageInfo.totalResults,
  }
}

// Helper function to combine and deduplicate results
const combineAndDeduplicateResults = (results: Video[], excludeVideoId: string): Video[] => {
  const seen = new Set<string>()
  const deduplicated = results.filter(video => {
    if (seen.has(video.id) || video.id === excludeVideoId) {
      return false
    }
    seen.add(video.id)
    return true
  })
  
  // Sort by relevance (simple scoring based on title similarity)
  return deduplicated.sort((a, b) => {
    // You can implement more sophisticated scoring here
    return a.title.localeCompare(b.title)
  })
}

// Strategy 1: Search by keywords (40% of results)
const searchByKeywords = async (videoDetails: Video, totalResults: number): Promise<Video[]> => {
  const keywords = extractKeywords(videoDetails.title, videoDetails.description)
  if (!keywords.trim()) return []

  const maxResults = Math.ceil(totalResults * 0.4)
  const params = {
    part: 'snippet',
    q: keywords,
    type: 'video',
    maxResults: Math.min(maxResults, 25), // Increased from 15 to 25
    order: 'relevance',
    videoEmbeddable: true,
    publishedAfter: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(), // Last year
  }

  try {
    const result = await searchWithParams(params, videoDetails.id, videoDetails.channelId)
    return result.items
  } catch (error) {
    console.warn('Keyword search failed:', error)
    return []
  }
}

// Strategy 2: Search by category (30% of results)
const searchByCategory = async (videoDetails: Video, totalResults: number): Promise<Video[]> => {
  if (!videoDetails.categoryId) return []

  const maxResults = Math.ceil(totalResults * 0.3)
  const params = {
    part: 'snippet',
    type: 'video',
    maxResults: Math.min(maxResults, 20), // Increased from 12 to 20
    order: 'relevance',
    videoCategoryId: videoDetails.categoryId,
    videoEmbeddable: true,
    publishedAfter: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(), // Last 6 months
  }

  try {
    const result = await searchWithParams(params, videoDetails.id, videoDetails.channelId)
    return result.items
  } catch (error) {
    console.warn('Category search failed:', error)
    return []
  }
}

// Strategy 3: Search by tags (20% of results)
const searchByTags = async (videoDetails: Video, totalResults: number): Promise<Video[]> => {
  if (!videoDetails.tags || videoDetails.tags.length === 0) return []

  const maxResults = Math.ceil(totalResults * 0.2)
  const tagQuery = videoDetails.tags.slice(0, 3).join(' ') // Use first 3 tags
  const params = {
    part: 'snippet',
    q: tagQuery,
    type: 'video',
    maxResults: Math.min(maxResults, 15), // Increased from 10 to 15
    order: 'relevance',
    videoEmbeddable: true,
    publishedAfter: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // Last 3 months
  }

  try {
    const result = await searchWithParams(params, videoDetails.id, videoDetails.channelId)
    return result.items
  } catch (error) {
    console.warn('Tag search failed:', error)
    return []
  }
}

// Strategy 4: Search by trending in same category (10% of results)
const searchByTrending = async (videoDetails: Video, totalResults: number): Promise<Video[]> => {
  const maxResults = Math.ceil(totalResults * 0.1)
  const params: any = {
    part: 'snippet',
    type: 'video',
    maxResults: Math.min(maxResults, 12), // Increased from 8 to 12
    order: 'viewCount', // Trending by view count
    videoEmbeddable: true,
    publishedAfter: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Last 30 days
  }

  // Add category filter if available
  if (videoDetails.categoryId) {
    params.videoCategoryId = videoDetails.categoryId
  }

  try {
    const result = await searchWithParams(params, videoDetails.id, videoDetails.channelId)
    return result.items
  } catch (error) {
    console.warn('Trending search failed:', error)
    return []
  }
}

// Get related videos using search endpoint with video title as query
export const getRelatedVideosBySearch = async (
  videoId: string,
  pageToken?: string
): Promise<SearchResponse> => {
  // Check if API key is available first
  const config = createApiInstance()
  
  // If we have an API key, use real API calls regardless of mock data setting
  if (config.params.key) {
    // Use real API calls
  } else if (shouldUseMockData()) {
    // Only use mock data if no API key and mock data is enabled
    await new Promise(resolve => setTimeout(resolve, 400))
    return mockRelatedVideos
  } else {
    throw new Error('YouTube API key is required. Please configure your API key in settings or enable mock data mode.')
  }

  return localStorageCache.getRelatedVideos(videoId, async () => {
    try {
      // Get video details to extract title and category
      const videoDetails = await getVideoDetails(videoId)
      
      // Use video title as search query
      const searchQuery = videoDetails.title
      
      const params: any = {
        part: 'snippet',
        q: searchQuery,
        type: 'video',
        maxResults: 50,
        order: 'relevance',
        videoEmbeddable: true,
        safeSearch: 'moderate',
        videoDefinition: 'high', // Prefer HD videos
        videoDuration: 'medium', // Prefer medium length videos (4-20 minutes)
        relevanceLanguage: 'en', // Prefer English content
      }

      // Add category ID if available
      if (videoDetails.categoryId) {
        params.videoCategoryId = videoDetails.categoryId
      }

      // Add pagination token if provided
      if (pageToken) {
        params.pageToken = pageToken
      }

      console.log('🔍 Searching for related videos with query:', searchQuery)
      console.log('📂 Using category ID:', videoDetails.categoryId)
      console.log('📺 Channel ID:', videoDetails.channelId)
      console.log('🏷️ Video tags:', videoDetails.tags?.slice(0, 5)) // Show first 5 tags

      const api = getApiInstance()
      const response: AxiosResponse = await api.get('/search', { params })

      const videos = response.data.items.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description || '',
        thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || '',
        channelTitle: item.snippet.channelTitle,
        channelId: item.snippet.channelId,
        publishedAt: item.snippet.publishedAt,
        duration: '', // Will be filled by getVideoDetails if needed
        viewCount: '', // Will be filled by getVideoDetails if needed
        tags: [], // Will be filled by getVideoDetails if needed
        categoryId: videoDetails.categoryId, // Use the same category as the original video
      }))

      // Filter out the current video from results
      const filteredVideos = videos.filter((video: any) => video.id !== videoId)

      console.log('✅ Found', filteredVideos.length, 'related videos')
      console.log('📄 Next page token:', response.data.nextPageToken ? 'Available' : 'None')
      console.log('📊 Total results:', response.data.pageInfo?.totalResults || filteredVideos.length)

      return {
        items: filteredVideos,
        nextPageToken: response.data.nextPageToken,
        totalResults: response.data.pageInfo?.totalResults || filteredVideos.length,
      }

    } catch (error) {
      console.error('Error fetching related videos by search:', error)
      handleApiError(error)
      throw error
    }
  })
}

// Get related videos using hybrid approach with channel priority (keeping for backward compatibility)
export const getRelatedVideos = async (
  videoId: string,
  pageToken?: string
): Promise<SearchResponse> => {
  // Check if API key is available first
  const config = createApiInstance()
  
  // If we have an API key, use real API calls regardless of mock data setting
  if (config.params.key) {
    // Use real API calls
  } else if (shouldUseMockData()) {
    // Only use mock data if no API key and mock data is enabled
    await new Promise(resolve => setTimeout(resolve, 400))
    return mockRelatedVideos
  } else {
    throw new Error('YouTube API key is required. Please configure your API key in settings or enable mock data mode.')
  }

  return localStorageCache.getRelatedVideos(videoId, async () => {
    try {
      // Get video details to extract information for better search
      const videoDetails = await getVideoDetails(videoId)
      const totalResults = 50 // Increased from 25 to 50

      // Execute all search strategies in parallel, including channel videos
      const [channelResults, keywordResults, categoryResults, tagResults, trendingResults] = await Promise.all([
        getRandomVideosFromChannel(videoDetails.channelId, Math.ceil(totalResults * 0.4)), // 40% from same channel
        searchByKeywords(videoDetails, Math.ceil(totalResults * 0.3)), // 30% from keywords
        searchByCategory(videoDetails, Math.ceil(totalResults * 0.2)), // 20% from category
        searchByTags(videoDetails, Math.ceil(totalResults * 0.1)), // 10% from tags
        searchByTrending(videoDetails, Math.ceil(totalResults * 0.1)) // 10% from trending
      ])

      // Combine all results with channel videos first
      const allResults = [
        ...channelResults,
        ...keywordResults,
        ...categoryResults,
        ...tagResults,
        ...trendingResults
      ]

      // Deduplicate and sort results
      const finalResults = combineAndDeduplicateResults(allResults, videoId)

      return {
        items: finalResults.slice(0, totalResults),
        nextPageToken: undefined, // For now, we don't support pagination with hybrid approach
        totalResults: finalResults.length,
      }

    } catch (error) {
      console.warn('Hybrid related videos approach failed, trying fallback:', error)
      
      // Fallback to basic search approach
      try {
        const videoDetails = await getVideoDetails(videoId)
        const keywords = extractKeywords(videoDetails.title, videoDetails.description)
        
        const params: any = {
          part: 'snippet',
          q: keywords || 'trending',
          type: 'video',
          maxResults: 50, // Increased from 25 to 50
          order: 'relevance',
          videoEmbeddable: true,
          publishedAfter: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        }

        if (pageToken) {
          params.pageToken = pageToken
        }

        const result = await searchWithParams(params, videoDetails.id, videoDetails.channelId)
        return {
          items: result.items,
          nextPageToken: result.nextPageToken,
          totalResults: result.totalResults,
        }
      } catch (fallbackError) {
        console.warn('Fallback approach also failed, using mock data:', fallbackError)
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 400))
        
        // For pagination, return different sets of videos
        if (pageToken) {
          const additionalVideos = mockVideos.slice(1, 51).map((video, index) => ({
            ...video,
            id: `${video.id}-related-page2-${index}`,
            title: `${video.title} (Related Page 2)`,
          }))
          return {
            items: additionalVideos,
            nextPageToken: undefined,
            totalResults: 500,
          }
        }
        
        // Return 50+ mock videos for better testing
        const extendedMockVideos = [
          ...mockRelatedVideos.items,
          ...mockVideos.slice(0, 30).map((video, index) => ({
            ...video,
            id: `${video.id}-mock-${index}`,
            title: `${video.title} (Mock Related)`,
          }))
        ]
        
        return {
          items: extendedMockVideos.slice(0, 50),
          nextPageToken: undefined,
          totalResults: extendedMockVideos.length,
        }
      }
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

// YouTube category mapping
export const YOUTUBE_CATEGORIES = {
  '23': 'Comedy',
  '24': 'Entertainment', 
  '28': 'Science & Technology',
  '1': 'Film & Animation',
  '20': 'Gaming',
  '10': 'Music',
  '15': 'Pets & Animals',
  '19': 'Travel & Events',
  '22': 'People & Blogs',
  '25': 'News & Politics',
  '26': 'Howto & Style',
  '27': 'Education',
  '2': 'Autos & Vehicles'
} as const

// Category display names for the UI (some categories share the same YouTube category ID)
export const CATEGORY_DISPLAY_NAMES = {
  '23': 'Comedy',
  '24': 'Entertainment', 
  '28': 'Science & Technology',
  '1': 'Film & Animation',
  '20': 'Gaming',
  '10': 'Music',
  '15': 'Pets & Animals',
  '19': 'Travel & Events',
  '22': 'People & Blogs',
  '25': 'News & Politics',
  '26': 'Howto & Style',
  '27': 'Education',
  'movies': 'Movies', // Uses Film & Animation category
  'shows': 'Shows', // Uses Entertainment category  
  'trailers': 'Trailers', // Uses Film & Animation category
  '2': 'Autos & Vehicles'
} as const

// Get videos by category
export const getVideosByCategory = async (
  categoryId: string,
  pageToken?: string,
  maxResults: number = 25
): Promise<SearchResponse> => {
  if (shouldUseMockData()) {
    await new Promise(resolve => setTimeout(resolve, 400))
    
    // Filter mock videos by category (simulate different categories)
    const categoryKeywords: Record<string, string[]> = {
      '23': ['comedy', 'funny', 'joke', 'humor', 'laugh', 'standup', 'comedy'],
      '24': ['entertainment', 'show', 'movie', 'celebrity', 'hollywood', 'entertainment'],
      '28': ['science', 'tech', 'technology', 'innovation', 'research', 'science'],
      '1': ['film', 'animation', 'movie', 'cinema', 'trailer', 'movies', 'shows', 'trailers'],
      '20': ['gaming', 'game', 'play', 'stream', 'twitch', 'gaming'],
      '10': ['music', 'song', 'album', 'artist', 'concert', 'music'],
      '15': ['pets', 'animals', 'dog', 'cat', 'pet', 'animal'],
      '19': ['travel', 'trip', 'vacation', 'destination', 'adventure', 'travel'],
      '22': ['people', 'blogs', 'vlog', 'personal', 'lifestyle', 'people'],
      '25': ['news', 'politics', 'breaking', 'update', 'report', 'news'],
      '26': ['howto', 'style', 'tutorial', 'fashion', 'beauty', 'howto'],
      '27': ['education', 'tutorial', 'learn', 'course', 'lesson', 'education'],
      '2': ['auto', 'vehicle', 'car', 'motorcycle', 'racing', 'autos']
    }
    
    const keywords = categoryKeywords[categoryId] || ['video', 'content']
    let filteredVideos = mockVideos.filter(video => 
      keywords.some((keyword: string) => 
        video.title.toLowerCase().includes(keyword) ||
        video.description.toLowerCase().includes(keyword)
      )
    )
    
    if (pageToken) {
      const additionalVideos = filteredVideos.map((video, index) => ({
        ...video,
        id: `${video.id}-category-${categoryId}-${index}`,
        title: `${video.title} (Category Page 2)`,
      }))
      return {
        items: additionalVideos,
        nextPageToken: undefined,
        totalResults: 1000,
      }
    }
    
    return {
      items: filteredVideos,
      nextPageToken: 'mock-category-next',
      totalResults: filteredVideos.length * 10,
    }
  }

  // Check if API key is available when not using mock data
  const config = createApiInstance()
  if (!config.params.key) {
    throw new Error('YouTube API key is required. Please configure your API key in settings or enable mock data mode.')
  }

  const params: any = {
    part: 'snippet,statistics,contentDetails',
    chart: 'mostPopular',
    videoCategoryId: categoryId,
    maxResults,
  }

  if (pageToken) {
    params.pageToken = pageToken
  }

  try {
    return localStorageCache.getCategoryVideos(categoryId, params, async () => {
      const api = getApiInstance()
      const response: AxiosResponse = await api.get('/videos', { params })
      
      const items = response.data.items.map((item: any) => ({
        id: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
        channelTitle: item.snippet.channelTitle,
        channelId: item.snippet.channelId,
        publishedAt: item.snippet.publishedAt,
        duration: item.contentDetails.duration,
        viewCount: item.statistics.viewCount,
        categoryId: item.snippet.categoryId,
      }))
      
      return {
        items,
        nextPageToken: response.data.nextPageToken,
        totalResults: response.data.pageInfo.totalResults,
      }
    })
  } catch (error) {
    handleApiError(error)
    throw error
  }
}

// Get videos by search query (for specific categories)
export const getVideosByQuery = async (
  query: string,
  pageToken?: string,
  maxResults: number = 25,
  order: string = 'relevance'
): Promise<SearchResponse> => {
  if (shouldUseMockData()) {
    await new Promise(resolve => setTimeout(resolve, 400))
    
    let filteredVideos = mockVideos.filter(video => 
      video.title.toLowerCase().includes(query.toLowerCase()) ||
      video.description.toLowerCase().includes(query.toLowerCase()) ||
      video.channelTitle.toLowerCase().includes(query.toLowerCase())
    )
    
    if (pageToken) {
      const additionalVideos = filteredVideos.map((video, index) => ({
        ...video,
        id: `${video.id}-query-${query}-${index}`,
        title: `${video.title} (Query Page 2)`,
      }))
      return {
        items: additionalVideos,
        nextPageToken: undefined,
        totalResults: 1000,
      }
    }
    
    return {
      items: filteredVideos,
      nextPageToken: 'mock-query-next',
      totalResults: filteredVideos.length * 10,
    }
  }

  // Check if API key is available when not using mock data
  const config = createApiInstance()
  if (!config.params.key) {
    throw new Error('YouTube API key is required. Please configure your API key in settings or enable mock data mode.')
  }

  const params: any = {
    part: 'snippet',
    q: query,
    type: 'video',
    maxResults,
    order,
    videoEmbeddable: true,
  }

  if (pageToken) {
    params.pageToken = pageToken
  }

  try {
    return localStorageCache.getQueryVideos(query, params, async () => {
      const api = getApiInstance()
      const response: AxiosResponse = await api.get('/search', { params })
      
      const items = response.data.items.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
        channelTitle: item.snippet.channelTitle,
        channelId: item.snippet.channelId,
        publishedAt: item.snippet.publishedAt,
        duration: '', // Will be filled by getVideoDetails if needed
        viewCount: '', // Will be filled by getVideoDetails if needed
      }))
      
      return {
        items,
        nextPageToken: response.data.nextPageToken,
        totalResults: response.data.pageInfo.totalResults,
      }
    })
  } catch (error) {
    handleApiError(error)
    throw error
  }
}

// Get random videos from a specific channel
export const getRandomVideosFromChannel = async (channelId: string, count: number = 50): Promise<Video[]> => {
  if (shouldUseMockData()) {
    await new Promise(resolve => setTimeout(resolve, 400))
    // Return random videos from mock data that match the channel
    const channelVideos = mockVideos.filter(video => video.channelId === channelId)
    const shuffled = [...channelVideos].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)
  }

  // Check if API key is available when not using mock data
  const config = createApiInstance()
  if (!config.params.key) {
    throw new Error('YouTube API key is required. Please configure your API key in settings or enable mock data mode.')
  }

  try {
    // Apply rate limiting
    await youtubeRateLimiter.waitIfNeeded()
    
    const response = await getChannelVideos(channelId, undefined) // Get more to have better random selection
    
    // Shuffle and return random selection
    const shuffled = response.items.sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)
  } catch (error) {
    console.warn(`Failed to fetch random videos from channel ${channelId}:`, error)
    return []
  }
}

// Search videos from multiple channels using channel IDs
export const searchVideosFromChannels = async (
  channelIds: string[],
  maxResults: number = 50,
  order: string = 'date'
): Promise<SearchResponse> => {
  if (shouldUseMockData()) {
    await new Promise(resolve => setTimeout(resolve, 400))
    
    // Filter mock videos based on channel IDs
    let filteredVideos = mockVideos.filter(video => 
      channelIds.includes(video.channelId)
    )
    
    // Sort by date if requested
    if (order === 'date') {
      filteredVideos = filteredVideos.sort((a, b) => 
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      )
    }
    
    return {
      items: filteredVideos.slice(0, maxResults),
      nextPageToken: undefined,
      totalResults: filteredVideos.length,
    }
  }

  // Check if API key is available when not using mock data
  const config = createApiInstance()
  if (!config.params.key) {
    throw new Error('YouTube API key is required. Please configure your API key in settings or enable mock data mode.')
  }

  // For multiple channels, we need to make separate requests and combine results
  // YouTube API doesn't support searching multiple channels in a single request
  const allVideos: any[] = []
  
  try {
    // Process channels in batches to avoid rate limiting
    const batchSize = 5
    for (let i = 0; i < channelIds.length; i += batchSize) {
      const batch = channelIds.slice(i, i + batchSize)
      
      const batchPromises = batch.map(async (channelId) => {
        const params: any = {
          part: 'snippet',
          channelId: channelId,
          type: 'video',
          maxResults: Math.min(Math.ceil(maxResults / channelIds.length), 25), // Distribute results across channels
          order: order,
          videoEmbeddable: true,
        }

        const api = getApiInstance()
        const response: AxiosResponse = await api.get('/search', { params })
        
        return response.data.items.map((item: any) => ({
          id: item.id.videoId,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
          channelTitle: item.snippet.channelTitle,
          channelId: item.snippet.channelId,
          publishedAt: item.snippet.publishedAt,
          duration: '', // Will be filled by getVideoDetails if needed
          viewCount: '', // Will be filled by getVideoDetails if needed
        }))
      })
      
      const batchResults = await Promise.all(batchPromises)
      allVideos.push(...batchResults.flat())
      
      // Add delay between batches to avoid rate limiting
      if (i + batchSize < channelIds.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
    
    // Sort all videos by date (newest first)
    allVideos.sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )
    
    return {
      items: allVideos.slice(0, maxResults),
      nextPageToken: undefined,
      totalResults: allVideos.length,
    }
  } catch (error) {
    handleApiError(error)
    throw error
  }
}

// Get random videos from saved channels (optimized to use cached data)
export const getRandomVideosFromSavedChannels = async (count: number = 200): Promise<Video[]> => {
  if (shouldUseMockData()) {
    await new Promise(resolve => setTimeout(resolve, 400))
    // Return random videos from mock data
    const shuffled = [...mockVideos].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)
  }

  // Check if API key is available when not using mock data
  const config = createApiInstance()
  if (!config.params.key) {
    throw new Error('YouTube API key is required. Please configure your API key in settings or enable mock data mode.')
  }

  // Get saved channels from localStorage
  const savedChannels = JSON.parse(localStorage.getItem('savedChannels') || '[]')
  
  if (savedChannels.length === 0) {
    return []
  }

  const allVideos: Video[] = []
  
  // Try to get videos from cache first, only fetch if not cached
  for (const channel of savedChannels) {
    try {
      const cacheKey = `youtube_channel_videos_${channel.id}`
      const cachedData = localStorage.getItem(cacheKey)
      
      if (cachedData) {
        const parsedData = JSON.parse(cachedData)
        if (parsedData && parsedData.items) {
          console.log(`📦 Using cached videos for random selection from channel: ${channel.title}`)
          allVideos.push(...parsedData.items)
          continue
        }
      }
      
      // Only fetch if not cached and we don't have enough videos yet
      if (allVideos.length < count) {
        console.log(`🌐 Fetching videos for random selection from channel: ${channel.title}`)
        
        // Apply rate limiting
        await youtubeRateLimiter.waitIfNeeded()
        
        const response = await getChannelVideos(channel.id)
        allVideos.push(...response.items)
      }
    } catch (error) {
      console.warn(`Failed to fetch videos for channel ${channel.title}:`, error)
    }
  }

  // Shuffle and return random selection
  const shuffled = allVideos.sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}


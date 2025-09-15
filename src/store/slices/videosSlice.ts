import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import { type Video, type Channel, type SearchResponse } from '../../types/youtube'
import * as youtubeService from '../../services/youtube'
import { requestCache } from '../../utils/requestCache'
import { getCachedData, setCachedData, isCached, YOUTUBE_CACHE_KEYS } from '../../utils/cache'

interface RelatedVideosState {
  videos: Video[]
  loading: boolean
  error: string | null
  nextPageToken: string | null
}

interface VideosState {
  // Home page
  trendingVideos: Video[]
  trendingLoading: boolean
  trendingError: string | null
  trendingNextPageToken: string | null

  // Search
  searchResults: Video[]
  searchLoading: boolean
  searchError: string | null
  searchNextPageToken: string | null
  searchTotalResults: number

  // Current video
  currentVideo: Video | null
  currentVideoLoading: boolean
  currentVideoError: string | null

  // Related videos - now stored per video ID
  relatedVideos: Record<string, RelatedVideosState>

  // Random videos from saved channels for Up Next
  randomVideos: Video[]
  randomVideosLoading: boolean
  randomVideosError: string | null

  // Random videos from channels for Up Next - stored per channel
  channelRandomVideos: Record<string, {
    videos: Video[]
    loading: boolean
    error: string | null
  }>

  // Channel
  currentChannel: Channel | null
  channelLoading: boolean
  channelError: string | null
  channelVideos: Video[]
  channelVideosLoading: boolean
  channelVideosError: string | null
  channelVideosNextPageToken: string | null

  // Category videos - stored per category
  categoryVideos: Record<string, {
    videos: Video[]
    loading: boolean
    error: string | null
    nextPageToken: string | null
  }>

  // Query videos - stored per query
  queryVideos: Record<string, {
    videos: Video[]
    loading: boolean
    error: string | null
    nextPageToken: string | null
  }>
}

const initialState: VideosState = {
  trendingVideos: [],
  trendingLoading: false,
  trendingError: null,
  trendingNextPageToken: null,

  searchResults: [],
  searchLoading: false,
  searchError: null,
  searchNextPageToken: null,
  searchTotalResults: 0,

  currentVideo: null,
  currentVideoLoading: false,
  currentVideoError: null,

  relatedVideos: {},

  randomVideos: [],
  randomVideosLoading: false,
  randomVideosError: null,

  channelRandomVideos: {},

  currentChannel: null,
  channelLoading: false,
  channelError: null,
  channelVideos: [],
  channelVideosLoading: false,
  channelVideosError: null,
  channelVideosNextPageToken: null,

  categoryVideos: {},
  queryVideos: {},
}

// Async thunks
export const fetchTrendingVideos = createAsyncThunk<SearchResponse, string | undefined>(
  'videos/fetchTrendingVideos',
  async (pageToken?: string) => {
    const cacheKey = pageToken ? `${YOUTUBE_CACHE_KEYS.TRENDING}:${pageToken}` : YOUTUBE_CACHE_KEYS.TRENDING
    
    // Check cache first
    if (!pageToken && isCached(cacheKey)) {
      const cachedData = getCachedData(cacheKey) as SearchResponse
      if (cachedData) {
        console.log('Using cached trending videos')
        return cachedData
      }
    }
    
    // Fetch from API (exclude shorts by default)
    console.log('Fetching trending videos from API (excluding shorts)')
    const response = await youtubeService.getTrendingVideos(pageToken, true)
    
    // Cache the response (only cache initial load, not pagination)
    if (!pageToken) {
      setCachedData(cacheKey, response)
    }
    
    return response
  }
)

export const searchVideos = createAsyncThunk(
  'videos/searchVideos',
  async ({ query, filters, pageToken }: { query: string; filters?: any; pageToken?: string }) => {
    const excludeShorts = filters?.excludeShorts !== false // Default to true unless explicitly set to false
    const response = await youtubeService.searchVideos(query, filters, pageToken, excludeShorts)
    return response
  }
)

export const fetchVideoDetails = createAsyncThunk(
  'videos/fetchVideoDetails',
  async (videoId: string) => {
    const video = await youtubeService.getVideoDetails(videoId)
    return video
  }
)

export const fetchRelatedVideos = createAsyncThunk(
  'videos/fetchRelatedVideos',
  async ({ videoId, pageToken }: { videoId: string; pageToken?: string }) => {
    const response = await youtubeService.getRelatedVideosBySearch(videoId, pageToken)
    return response
  }
)


export const fetchChannelDetails = createAsyncThunk(
  'videos/fetchChannelDetails',
  async (channelId: string) => {
    const channel = await youtubeService.getChannelDetails(channelId)
    return channel
  }
)

export const fetchChannelVideos = createAsyncThunk(
  'videos/fetchChannelVideos',
  async ({ channelId, pageToken, uploadsPlaylistId }: { channelId: string; pageToken?: string; uploadsPlaylistId?: string }) => {
    const response = await youtubeService.getChannelVideos(channelId, pageToken, uploadsPlaylistId)
    return response
  }
)

// Global flag to prevent multiple simultaneous calls
let isFetchingRandomVideos = false

export const fetchRandomVideosFromChannel = createAsyncThunk(
  'videos/fetchRandomVideosFromChannel',
  async ({ channelId, count = 50 }: { channelId: string; count?: number }) => {
    const cacheKey = `${YOUTUBE_CACHE_KEYS.RANDOM_VIDEOS}:channel:${channelId}:${count}`
    
    // Check cache first
    if (isCached(cacheKey)) {
      const cachedData = getCachedData<Video[]>(cacheKey)
      if (cachedData) {
        console.log(`Using cached random videos from channel ${channelId}`)
        return cachedData
      }
    }
    
    console.log(`Fetching random videos from channel ${channelId}`)
    
    const videos = await youtubeService.getRandomVideosFromChannel(channelId, count)
    
    // Cache the response
    setCachedData(cacheKey, videos)
    
    return videos
  }
)

export const fetchRandomVideosFromSavedChannels = createAsyncThunk(
  'videos/fetchRandomVideosFromSavedChannels',
  async (count: number = 200) => {
    const cacheKey = `${YOUTUBE_CACHE_KEYS.RANDOM_VIDEOS}:${count}`
    
    // Check cache first
    if (isCached(cacheKey)) {
      const cachedData = getCachedData<Video[]>(cacheKey)
      if (cachedData) {
        console.log('Using cached random videos')
        return cachedData
      }
    }
    
    // Prevent multiple simultaneous calls
    if (isFetchingRandomVideos) {
      console.log('Random videos already being fetched, skipping...')
      throw new Error('Already fetching random videos')
    }
    
    isFetchingRandomVideos = true
    console.log('Fetching random videos from API')
    
    try {
      const videos = await youtubeService.getRandomVideosFromSavedChannels(count)
      
      // Cache the response
      setCachedData(cacheKey, videos)
      
      return videos
    } finally {
      isFetchingRandomVideos = false
    }
  }
)

export const fetchVideosByCategory = createAsyncThunk<SearchResponse, { categoryId: string; pageToken?: string }>(
  'videos/fetchVideosByCategory',
  async ({ categoryId, pageToken }) => {
    const cacheKey = pageToken ? `${YOUTUBE_CACHE_KEYS.CATEGORY}:${categoryId}:${pageToken}` : `${YOUTUBE_CACHE_KEYS.CATEGORY}:${categoryId}`
    
    // Check cache first (with 1-hour duration for categories)
    if (!pageToken && isCached(cacheKey, 60 * 60 * 1000)) { // 1 hour cache
      const cachedData = getCachedData(cacheKey) as SearchResponse
      if (cachedData) {
        console.log(`Using cached videos for category ${categoryId}`)
        return cachedData
      }
    }
    
    console.log(`Fetching videos for category ${categoryId} from API`)
    const response = await youtubeService.getVideosByCategory(categoryId, pageToken)
    
    // Cache the response (only cache initial load, not pagination)
    if (!pageToken) {
      setCachedData(cacheKey, response, 60 * 60 * 1000) // 1 hour cache
    }
    
    return response
  }
)

export const fetchVideosByQuery = createAsyncThunk<SearchResponse, { query: string; pageToken?: string; order?: string }>(
  'videos/fetchVideosByQuery',
  async ({ query, pageToken, order = 'relevance' }) => {
    const cacheKey = pageToken ? `${YOUTUBE_CACHE_KEYS.QUERY}:${query}:${pageToken}` : `${YOUTUBE_CACHE_KEYS.QUERY}:${query}`
    
    // Check cache first
    if (!pageToken && isCached(cacheKey)) {
      const cachedData = getCachedData(cacheKey) as SearchResponse
      if (cachedData) {
        console.log(`Using cached videos for query "${query}"`)
        return cachedData
      }
    }
    
    console.log(`Fetching videos for query "${query}" from API`)
    const response = await youtubeService.getVideosByQuery(query, pageToken, 25, order)
    
    // Cache the response (only cache initial load, not pagination)
    if (!pageToken) {
      setCachedData(cacheKey, response)
    }
    
    return response
  }
)

const videosSlice = createSlice({
  name: 'videos',
  initialState,
  reducers: {
    clearSearchResults: (state) => {
      state.searchResults = []
      state.searchNextPageToken = null
      state.searchTotalResults = 0
      state.searchError = null
    },
    clearCurrentVideo: (state) => {
      state.currentVideo = null
      state.currentVideoError = null
      // Don't clear relatedVideos as they are now stored per video ID
    },
    clearChannel: (state) => {
      state.currentChannel = null
      state.channelVideos = []
      state.channelError = null
      state.channelVideosError = null
    },
    clearChannelRandomVideos: (state, action: PayloadAction<string>) => {
      const channelId = action.payload
      delete state.channelRandomVideos[channelId]
    },
    clearCategoryCache: (state) => {
      // Clear all category videos from Redux state
      state.categoryVideos = {}
    },
    clearAllData: (state) => {
      // Clear all video data when settings change
      state.trendingVideos = []
      state.trendingLoading = false
      state.trendingError = null
      state.trendingNextPageToken = null
      
      state.searchResults = []
      state.searchLoading = false
      state.searchError = null
      state.searchNextPageToken = null
      state.searchTotalResults = 0
      
      state.currentVideo = null
      state.currentVideoLoading = false
      state.currentVideoError = null
      
      state.relatedVideos = {}
      
      state.channelRandomVideos = {}
      
      state.currentChannel = null
      state.channelLoading = false
      state.channelError = null
      
      state.channelVideos = []
      state.channelVideosLoading = false
      state.channelVideosError = null
      state.channelVideosNextPageToken = null
      
      // Clear request cache to prevent using cached API responses
      requestCache.clear()
    },
  },
  extraReducers: (builder) => {
    // Trending videos
    builder
      .addCase(fetchTrendingVideos.pending, (state) => {
        state.trendingLoading = true
        state.trendingError = null
      })
      .addCase(fetchTrendingVideos.fulfilled, (state, action) => {
        state.trendingLoading = false
        if (action.meta.arg) {
          // Load more
          state.trendingVideos = [...state.trendingVideos, ...action.payload.items]
        } else {
          // Initial load
          state.trendingVideos = action.payload.items
        }
        state.trendingNextPageToken = action.payload.nextPageToken || null
      })
      .addCase(fetchTrendingVideos.rejected, (state, action) => {
        state.trendingLoading = false
        state.trendingError = action.error.message || 'Failed to fetch trending videos'
      })

    // Search videos
    builder
      .addCase(searchVideos.pending, (state) => {
        state.searchLoading = true
        state.searchError = null
      })
      .addCase(searchVideos.fulfilled, (state, action) => {
        state.searchLoading = false
        if (action.meta.arg.pageToken) {
          // Load more
          state.searchResults = [...state.searchResults, ...action.payload.items]
        } else {
          // Initial search
          state.searchResults = action.payload.items
        }
        state.searchNextPageToken = action.payload.nextPageToken || null
        state.searchTotalResults = action.payload.totalResults
      })
      .addCase(searchVideos.rejected, (state, action) => {
        state.searchLoading = false
        state.searchError = action.error.message || 'Failed to search videos'
      })

    // Video details
    builder
      .addCase(fetchVideoDetails.pending, (state) => {
        state.currentVideoLoading = true
        state.currentVideoError = null
      })
      .addCase(fetchVideoDetails.fulfilled, (state, action) => {
        state.currentVideoLoading = false
        state.currentVideo = action.payload
      })
      .addCase(fetchVideoDetails.rejected, (state, action) => {
        state.currentVideoLoading = false
        state.currentVideoError = action.error.message || 'Failed to fetch video details'
      })

    // Related videos
    builder
      .addCase(fetchRelatedVideos.pending, (state, action) => {
        const videoId = action.meta.arg.videoId
        if (!state.relatedVideos[videoId]) {
          state.relatedVideos[videoId] = {
            videos: [],
            loading: false,
            error: null,
            nextPageToken: null
          }
        }
        state.relatedVideos[videoId].loading = true
        state.relatedVideos[videoId].error = null
      })
      .addCase(fetchRelatedVideos.fulfilled, (state, action) => {
        const videoId = action.meta.arg.videoId
        if (!state.relatedVideos[videoId]) {
          state.relatedVideos[videoId] = {
            videos: [],
            loading: false,
            error: null,
            nextPageToken: null
          }
        }
        state.relatedVideos[videoId].loading = false
        if (action.meta.arg?.pageToken) {
          // Load more
          state.relatedVideos[videoId].videos = [...state.relatedVideos[videoId].videos, ...action.payload.items]
        } else {
          // Initial load
          state.relatedVideos[videoId].videos = action.payload.items
        }
        state.relatedVideos[videoId].nextPageToken = action.payload.nextPageToken || null
      })
      .addCase(fetchRelatedVideos.rejected, (state, action) => {
        const videoId = action.meta.arg.videoId
        if (!state.relatedVideos[videoId]) {
          state.relatedVideos[videoId] = {
            videos: [],
            loading: false,
            error: null,
            nextPageToken: null
          }
        }
        state.relatedVideos[videoId].loading = false
        state.relatedVideos[videoId].error = action.error.message || 'Failed to fetch related videos'
      })


    // Channel details
    builder
      .addCase(fetchChannelDetails.pending, (state) => {
        state.channelLoading = true
        state.channelError = null
      })
      .addCase(fetchChannelDetails.fulfilled, (state, action) => {
        state.channelLoading = false
        state.currentChannel = action.payload
      })
      .addCase(fetchChannelDetails.rejected, (state, action) => {
        state.channelLoading = false
        state.channelError = action.error.message || 'Failed to fetch channel details'
      })

    // Channel videos
    builder
      .addCase(fetchChannelVideos.pending, (state) => {
        state.channelVideosLoading = true
        state.channelVideosError = null
      })
      .addCase(fetchChannelVideos.fulfilled, (state, action) => {
        state.channelVideosLoading = false
        if (action.meta.arg.pageToken) {
          // Load more
          state.channelVideos = [...state.channelVideos, ...action.payload.items]
        } else {
          // Initial load
          state.channelVideos = action.payload.items
        }
        state.channelVideosNextPageToken = action.payload.nextPageToken || null
      })
      .addCase(fetchChannelVideos.rejected, (state, action) => {
        state.channelVideosLoading = false
        state.channelVideosError = action.error.message || 'Failed to fetch channel videos'
      })

    // Random videos from saved channels
    builder
      .addCase(fetchRandomVideosFromSavedChannels.pending, (state) => {
        state.randomVideosLoading = true
        state.randomVideosError = null
      })
      .addCase(fetchRandomVideosFromSavedChannels.fulfilled, (state, action) => {
        state.randomVideosLoading = false
        state.randomVideos = action.payload
      })
      .addCase(fetchRandomVideosFromSavedChannels.rejected, (state, action) => {
        state.randomVideosLoading = false
        state.randomVideosError = action.error.message || 'Failed to fetch random videos from saved channels'
      })

    // Random videos from specific channel
    builder
      .addCase(fetchRandomVideosFromChannel.pending, (state, action) => {
        const channelId = action.meta.arg.channelId
        if (!state.channelRandomVideos[channelId]) {
          state.channelRandomVideos[channelId] = {
            videos: [],
            loading: false,
            error: null
          }
        }
        state.channelRandomVideos[channelId].loading = true
        state.channelRandomVideos[channelId].error = null
      })
      .addCase(fetchRandomVideosFromChannel.fulfilled, (state, action) => {
        const channelId = action.meta.arg.channelId
        if (!state.channelRandomVideos[channelId]) {
          state.channelRandomVideos[channelId] = {
            videos: [],
            loading: false,
            error: null
          }
        }
        state.channelRandomVideos[channelId].loading = false
        state.channelRandomVideos[channelId].videos = action.payload
      })
      .addCase(fetchRandomVideosFromChannel.rejected, (state, action) => {
        const channelId = action.meta.arg.channelId
        if (!state.channelRandomVideos[channelId]) {
          state.channelRandomVideos[channelId] = {
            videos: [],
            loading: false,
            error: null
          }
        }
        state.channelRandomVideos[channelId].loading = false
        state.channelRandomVideos[channelId].error = action.error.message || 'Failed to fetch random videos from channel'
      })

    // Category videos
    builder
      .addCase(fetchVideosByCategory.pending, (state, action) => {
        const categoryId = action.meta.arg.categoryId
        if (!state.categoryVideos[categoryId]) {
          state.categoryVideos[categoryId] = {
            videos: [],
            loading: false,
            error: null,
            nextPageToken: null
          }
        }
        state.categoryVideos[categoryId].loading = true
        state.categoryVideos[categoryId].error = null
      })
      .addCase(fetchVideosByCategory.fulfilled, (state, action) => {
        const categoryId = action.meta.arg.categoryId
        if (!state.categoryVideos[categoryId]) {
          state.categoryVideos[categoryId] = {
            videos: [],
            loading: false,
            error: null,
            nextPageToken: null
          }
        }
        state.categoryVideos[categoryId].loading = false
        if (action.meta.arg.pageToken) {
          // Load more
          state.categoryVideos[categoryId].videos = [...state.categoryVideos[categoryId].videos, ...action.payload.items]
        } else {
          // Initial load
          state.categoryVideos[categoryId].videos = action.payload.items
        }
        state.categoryVideos[categoryId].nextPageToken = action.payload.nextPageToken || null
      })
      .addCase(fetchVideosByCategory.rejected, (state, action) => {
        const categoryId = action.meta.arg.categoryId
        if (!state.categoryVideos[categoryId]) {
          state.categoryVideos[categoryId] = {
            videos: [],
            loading: false,
            error: null,
            nextPageToken: null
          }
        }
        state.categoryVideos[categoryId].loading = false
        state.categoryVideos[categoryId].error = action.error.message || 'Failed to fetch category videos'
      })

    // Query videos
    builder
      .addCase(fetchVideosByQuery.pending, (state, action) => {
        const query = action.meta.arg.query
        if (!state.queryVideos[query]) {
          state.queryVideos[query] = {
            videos: [],
            loading: false,
            error: null,
            nextPageToken: null
          }
        }
        state.queryVideos[query].loading = true
        state.queryVideos[query].error = null
      })
      .addCase(fetchVideosByQuery.fulfilled, (state, action) => {
        const query = action.meta.arg.query
        if (!state.queryVideos[query]) {
          state.queryVideos[query] = {
            videos: [],
            loading: false,
            error: null,
            nextPageToken: null
          }
        }
        state.queryVideos[query].loading = false
        if (action.meta.arg.pageToken) {
          // Load more
          state.queryVideos[query].videos = [...state.queryVideos[query].videos, ...action.payload.items]
        } else {
          // Initial load
          state.queryVideos[query].videos = action.payload.items
        }
        state.queryVideos[query].nextPageToken = action.payload.nextPageToken || null
      })
      .addCase(fetchVideosByQuery.rejected, (state, action) => {
        const query = action.meta.arg.query
        if (!state.queryVideos[query]) {
          state.queryVideos[query] = {
            videos: [],
            loading: false,
            error: null,
            nextPageToken: null
          }
        }
        state.queryVideos[query].loading = false
        state.queryVideos[query].error = action.error.message || 'Failed to fetch query videos'
      })
  },
})

// Selectors
export const selectChannelRandomVideos = (channelId: string) => (state: { videos: VideosState }) => {
  return state.videos.channelRandomVideos[channelId] || {
    videos: [],
    loading: false,
    error: null
  }
}

export const { clearSearchResults, clearCurrentVideo, clearChannel, clearChannelRandomVideos, clearCategoryCache, clearAllData } = videosSlice.actions
export default videosSlice.reducer

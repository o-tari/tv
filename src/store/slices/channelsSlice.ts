import { createSlice, createAsyncThunk, createSelector, type PayloadAction } from '@reduxjs/toolkit'
import { type Channel, type Video, type SearchResponse } from '../../types/youtube'
import * as youtubeService from '../../services/youtube'
import { getCachedData, setCachedData, isCached, YOUTUBE_CACHE_KEYS } from '../../utils/cache'

interface ChannelsState {
  savedChannels: Channel[]
  channelVideos: { [channelId: string]: Video[] }
  channelVideosLoading: { [channelId: string]: boolean }
  channelVideosError: { [channelId: string]: string | null }
  channelVideosNextPageToken: { [channelId: string]: string | null }
  isLoading: boolean
  error: string | null
  // Pagination state
  videosPerPage: number
  currentPage: number
  totalVideos: number
  hasMoreVideos: boolean
  loadingMore: boolean
  // Optimized search state
  optimizedSearchVideos: Video[]
  optimizedSearchLoading: boolean
  optimizedSearchError: string | null
}

const loadFromStorage = (key: string, defaultValue: any) => {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    return defaultValue
  }
}

const saveToStorage = (key: string, value: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    // Failed to save to localStorage
  }
}

const savedChannels = loadFromStorage('savedChannels', [])

const initialState: ChannelsState = {
  savedChannels,
  channelVideos: {},
  channelVideosLoading: {},
  channelVideosError: {},
  channelVideosNextPageToken: {},
  isLoading: false,
  error: null,
  // Pagination state
  videosPerPage: 10,
  currentPage: 1,
  totalVideos: 0,
  hasMoreVideos: false,
  loadingMore: false,
  // Optimized search state
  optimizedSearchVideos: [],
  optimizedSearchLoading: false,
  optimizedSearchError: null,
}

// Async thunks
export const fetchChannelVideos = createAsyncThunk(
  'channels/fetchChannelVideos',
  async ({ channelId, pageToken }: { channelId: string; pageToken?: string }) => {
    const response = await youtubeService.getChannelVideos(channelId, pageToken)
    return { channelId, ...response }
  }
)

// Global flag to prevent multiple simultaneous calls
let isFetchingAllChannelVideos = false

export const fetchAllChannelVideos = createAsyncThunk<
  Array<{ channelId: string } & SearchResponse>,
  void,
  { state: { channels: ChannelsState } }
>(
  'channels/fetchAllChannelVideos',
  async (_, { getState }) => {
    const state = getState() as { channels: ChannelsState }
    const savedChannels = state.channels.savedChannels
    
    // Prevent multiple simultaneous calls
    if (isFetchingAllChannelVideos) {
      console.log('⏳ Channel videos already being fetched, skipping...')
      throw new Error('Already fetching channel videos')
    }
    
    isFetchingAllChannelVideos = true
    console.log('🌐 Fetching videos for all channels...')
    
    try {
      // Process channels sequentially with delays to avoid rate limiting
      const responses: SearchResponse[] = []
      for (let i = 0; i < savedChannels.length; i++) {
        const channel = savedChannels[i]
        const cacheKey = YOUTUBE_CACHE_KEYS.CHANNEL_VIDEOS(channel.id)
        
        // Check cache first
        if (isCached(cacheKey)) {
          const cachedData = getCachedData(cacheKey) as SearchResponse
          if (cachedData) {
            console.log(`📦 Using cached videos for channel: ${channel.title}`)
            responses.push(cachedData)
            continue
          }
        }
        
        // Fetch from API with delay between calls
        console.log(`🌐 Fetching videos for channel: ${channel.title} (${i + 1}/${savedChannels.length})`)
        const response = await youtubeService.getChannelVideos(channel.id)
        
        // Cache the response
        setCachedData(cacheKey, response)
        responses.push(response)
        
        // Add delay between API calls to prevent rate limiting (except for last channel)
        if (i < savedChannels.length - 1) {
          console.log('⏳ Waiting 1 second before next API call...')
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }
      
      return responses.map((response: SearchResponse, index: number) => ({
        channelId: savedChannels[index].id,
        ...response
      }))
    } finally {
      isFetchingAllChannelVideos = false
    }
  }
)

// Load more videos from all channels
export const loadMoreChannelVideos = createAsyncThunk(
  'channels/loadMoreChannelVideos',
  async (_, { getState }) => {
    const state = getState() as { channels: ChannelsState }
    const savedChannels = state.channels.savedChannels
    
    if (savedChannels.length === 0) {
      return []
    }

    const responses = []
    for (let i = 0; i < savedChannels.length; i++) {
      const channel = savedChannels[i]
      const nextPageToken = state.channels.channelVideosNextPageToken[channel.id]
      
      if (!nextPageToken) {
        // No more pages for this channel
        continue
      }
      
      try {
        console.log(`🌐 Loading more videos for channel: ${channel.title}`)
        const response = await youtubeService.getChannelVideos(channel.id, nextPageToken)
        responses.push({ channelId: channel.id, ...response })
        
        // Add delay between API calls
        if (i < savedChannels.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      } catch (error) {
        console.warn(`Failed to load more videos for channel ${channel.title}:`, error)
      }
    }
    
    return responses
  }
)

// Fetch videos using optimized search with random channel selection
export const fetchOptimizedChannelVideos = createAsyncThunk<
  SearchResponse,
  { maxChannels?: number; maxResults?: number },
  { state: { channels: ChannelsState } }
>(
  'channels/fetchOptimizedChannelVideos',
  async ({ maxChannels = 20, maxResults = 50 }, { getState }) => {
    const state = getState() as { channels: ChannelsState }
    const savedChannels = state.channels.savedChannels
    
    if (savedChannels.length === 0) {
      return { items: [], nextPageToken: undefined, totalResults: 0 }
    }

    // Select random channels (up to maxChannels)
    const shuffledChannels = [...savedChannels].sort(() => 0.5 - Math.random())
    const selectedChannels = shuffledChannels.slice(0, Math.min(maxChannels, savedChannels.length))
    const channelIds = selectedChannels.map(channel => channel.id)
    
    console.log(`🔍 Searching videos from ${selectedChannels.length} random channels:`, selectedChannels.map(c => c.title))
    
    const response = await youtubeService.searchVideosFromChannels(channelIds, maxResults, 'date')
    
    console.log(`✅ Found ${response.items.length} videos from optimized search`)
    
    return response
  }
)

const channelsSlice = createSlice({
  name: 'channels',
  initialState,
  reducers: {
    addChannel: (state, action: PayloadAction<Channel>) => {
      const channel = action.payload
      const existingIndex = state.savedChannels.findIndex(ch => ch.id === channel.id)
      
      if (existingIndex === -1) {
        state.savedChannels.push(channel)
        saveToStorage('savedChannels', state.savedChannels)
      }
    },
    removeChannel: (state, action: PayloadAction<string>) => {
      const channelId = action.payload
      state.savedChannels = state.savedChannels.filter(ch => ch.id !== channelId)
      saveToStorage('savedChannels', state.savedChannels)
      
      // Clean up channel videos data
      delete state.channelVideos[channelId]
      delete state.channelVideosLoading[channelId]
      delete state.channelVideosError[channelId]
      delete state.channelVideosNextPageToken[channelId]
    },
    toggleChannel: (state, action: PayloadAction<Channel>) => {
      const channel = action.payload
      const existingIndex = state.savedChannels.findIndex(ch => ch.id === channel.id)
      
      if (existingIndex === -1) {
        state.savedChannels.push(channel)
      } else {
        state.savedChannels.splice(existingIndex, 1)
        // Clean up channel videos data when removing
        delete state.channelVideos[channel.id]
        delete state.channelVideosLoading[channel.id]
        delete state.channelVideosError[channel.id]
        delete state.channelVideosNextPageToken[channel.id]
      }
      saveToStorage('savedChannels', state.savedChannels)
    },
    clearChannels: (state) => {
      state.savedChannels = []
      state.channelVideos = {}
      state.channelVideosLoading = {}
      state.channelVideosError = {}
      state.channelVideosNextPageToken = {}
      saveToStorage('savedChannels', [])
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    // Pagination actions
    setVideosPerPage: (state, action: PayloadAction<number>) => {
      state.videosPerPage = action.payload
      state.currentPage = 1 // Reset to first page when changing page size
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload
    },
    resetPagination: (state) => {
      state.currentPage = 1
      state.totalVideos = 0
      state.hasMoreVideos = false
      state.loadingMore = false
    },
  },
  extraReducers: (builder) => {
    // Fetch channel videos
    builder
      .addCase(fetchChannelVideos.pending, (state, action) => {
        const channelId = action.meta.arg.channelId
        state.channelVideosLoading[channelId] = true
        state.channelVideosError[channelId] = null
      })
      .addCase(fetchChannelVideos.fulfilled, (state, action) => {
        const { channelId, items, nextPageToken } = action.payload
        state.channelVideosLoading[channelId] = false
        
        if (action.meta.arg.pageToken) {
          // Load more
          state.channelVideos[channelId] = [
            ...(state.channelVideos[channelId] || []),
            ...items
          ]
        } else {
          // Initial load
          state.channelVideos[channelId] = items
        }
        state.channelVideosNextPageToken[channelId] = nextPageToken || null
      })
      .addCase(fetchChannelVideos.rejected, (state, action) => {
        const channelId = action.meta.arg.channelId
        state.channelVideosLoading[channelId] = false
        state.channelVideosError[channelId] = action.error.message || 'Failed to fetch channel videos'
      })

    // Fetch all channel videos
    builder
      .addCase(fetchAllChannelVideos.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchAllChannelVideos.fulfilled, (state, action) => {
        state.isLoading = false
        action.payload.forEach(({ channelId, items, nextPageToken }) => {
          state.channelVideos[channelId] = items
          state.channelVideosNextPageToken[channelId] = nextPageToken || null
          state.channelVideosLoading[channelId] = false
          state.channelVideosError[channelId] = null
        })
        
        // Update pagination state
        const allVideos = Object.values(state.channelVideos).flat()
        state.totalVideos = allVideos.length
        state.hasMoreVideos = action.payload.some(response => response.nextPageToken)
      })
      .addCase(fetchAllChannelVideos.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Failed to fetch channel videos'
      })

    // Load more channel videos
    builder
      .addCase(loadMoreChannelVideos.pending, (state) => {
        state.loadingMore = true
        state.error = null
      })
      .addCase(loadMoreChannelVideos.fulfilled, (state, action) => {
        state.loadingMore = false
        action.payload.forEach(({ channelId, items, nextPageToken }) => {
          // Append new videos to existing ones
          state.channelVideos[channelId] = [
            ...(state.channelVideos[channelId] || []),
            ...items
          ]
          state.channelVideosNextPageToken[channelId] = nextPageToken || null
        })
        
        // Update pagination state
        const allVideos = Object.values(state.channelVideos).flat()
        state.totalVideos = allVideos.length
        state.hasMoreVideos = action.payload.some(response => response.nextPageToken)
      })
      .addCase(loadMoreChannelVideos.rejected, (state, action) => {
        state.loadingMore = false
        state.error = action.error.message || 'Failed to load more videos'
      })

    // Fetch optimized channel videos
    builder
      .addCase(fetchOptimizedChannelVideos.pending, (state) => {
        state.optimizedSearchLoading = true
        state.optimizedSearchError = null
      })
      .addCase(fetchOptimizedChannelVideos.fulfilled, (state, action) => {
        state.optimizedSearchLoading = false
        state.optimizedSearchVideos = action.payload.items
        state.optimizedSearchError = null
      })
      .addCase(fetchOptimizedChannelVideos.rejected, (state, action) => {
        state.optimizedSearchLoading = false
        state.optimizedSearchError = action.error.message || 'Failed to fetch optimized channel videos'
      })
  },
})

export const {
  addChannel,
  removeChannel,
  toggleChannel,
  clearChannels,
  setLoading,
  setError,
  setVideosPerPage,
  setCurrentPage,
  resetPagination,
} = channelsSlice.actions

export default channelsSlice.reducer

// Selectors
export const selectSavedChannels = (state: { channels: ChannelsState }) => state.channels.savedChannels
export const selectChannelVideos = (channelId: string) => (state: { channels: ChannelsState }) => 
  state.channels.channelVideos[channelId] || []
export const selectChannelVideosLoading = (channelId: string) => (state: { channels: ChannelsState }) => 
  state.channels.channelVideosLoading[channelId] || false
export const selectChannelVideosError = (channelId: string) => (state: { channels: ChannelsState }) => 
  state.channels.channelVideosError[channelId] || null
export const selectChannelVideosNextPageToken = (channelId: string) => (state: { channels: ChannelsState }) => 
  state.channels.channelVideosNextPageToken[channelId] || null
export const selectIsChannelSaved = (channelId: string) => (state: { channels: ChannelsState }) => 
  state.channels.savedChannels.some(ch => ch.id === channelId)
export const selectChannelsLoading = (state: { channels: ChannelsState }) => state.channels.isLoading
export const selectChannelsError = (state: { channels: ChannelsState }) => state.channels.error

// Pagination selectors
export const selectVideosPerPage = (state: { channels: ChannelsState }) => state.channels.videosPerPage
export const selectCurrentPage = (state: { channels: ChannelsState }) => state.channels.currentPage
export const selectTotalVideos = (state: { channels: ChannelsState }) => state.channels.totalVideos
export const selectHasMoreVideos = (state: { channels: ChannelsState }) => state.channels.hasMoreVideos
export const selectLoadingMore = (state: { channels: ChannelsState }) => state.channels.loadingMore


// Optimized search selectors
export const selectOptimizedSearchVideos = (state: { channels: ChannelsState }) => state.channels.optimizedSearchVideos
export const selectOptimizedSearchLoading = (state: { channels: ChannelsState }) => state.channels.optimizedSearchLoading
export const selectOptimizedSearchError = (state: { channels: ChannelsState }) => state.channels.optimizedSearchError

// Get all latest videos from saved channels (memoized)
export const selectLatestChannelVideos = createSelector(
  [(state: { channels: ChannelsState }) => state.channels.savedChannels, (state: { channels: ChannelsState }) => state.channels.channelVideos],
  (savedChannels, channelVideos) => {
    const allVideos: Video[] = []
    
    savedChannels.forEach(channel => {
      const videos = channelVideos[channel.id] || []
      // Take the latest 3 videos from each channel
      const latestVideos = videos.slice(0, 3)
      allVideos.push(...latestVideos)
    })
    
    // Sort by published date (newest first)
    return allVideos.sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )
  }
)

// Get all videos from saved channels sorted by date (memoized)
export const selectAllChannelVideosSortedByDate = createSelector(
  [(state: { channels: ChannelsState }) => state.channels.savedChannels, (state: { channels: ChannelsState }) => state.channels.channelVideos],
  (savedChannels, channelVideos) => {
    const allVideos: Video[] = []
    
    savedChannels.forEach(channel => {
      const videos = channelVideos[channel.id] || []
      allVideos.push(...videos)
    })
    
    // Sort by published date (newest first)
    return allVideos.sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )
  }
)

// Get paginated videos from saved channels (memoized)
export const selectPaginatedChannelVideos = createSelector(
  [selectAllChannelVideosSortedByDate, (state: { channels: ChannelsState }) => state.channels.videosPerPage, (state: { channels: ChannelsState }) => state.channels.currentPage],
  (allVideos, videosPerPage, currentPage) => {
    const startIndex = (currentPage - 1) * videosPerPage
    const endIndex = startIndex + videosPerPage
    
    return {
      videos: allVideos.slice(startIndex, endIndex),
      totalVideos: allVideos.length,
      totalPages: Math.ceil(allVideos.length / videosPerPage),
      currentPage,
      videosPerPage,
      hasNextPage: endIndex < allVideos.length,
      hasPreviousPage: currentPage > 1,
    }
  }
)


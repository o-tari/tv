import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import { type Channel, type Video } from '../../types/youtube'
import * as youtubeService from '../../services/youtube'

interface ChannelsState {
  savedChannels: Channel[]
  channelVideos: { [channelId: string]: Video[] }
  channelVideosLoading: { [channelId: string]: boolean }
  channelVideosError: { [channelId: string]: string | null }
  channelVideosNextPageToken: { [channelId: string]: string | null }
  isLoading: boolean
  error: string | null
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

const initialState: ChannelsState = {
  savedChannels: loadFromStorage('savedChannels', []),
  channelVideos: {},
  channelVideosLoading: {},
  channelVideosError: {},
  channelVideosNextPageToken: {},
  isLoading: false,
  error: null,
}

// Async thunks
export const fetchChannelVideos = createAsyncThunk(
  'channels/fetchChannelVideos',
  async ({ channelId, pageToken }: { channelId: string; pageToken?: string }) => {
    const response = await youtubeService.getChannelVideos(channelId, pageToken)
    return { channelId, ...response }
  }
)

export const fetchAllChannelVideos = createAsyncThunk(
  'channels/fetchAllChannelVideos',
  async (_, { getState }) => {
    const state = getState() as { channels: ChannelsState }
    const savedChannels = state.channels.savedChannels
    
    const promises = savedChannels.map(channel => 
      youtubeService.getChannelVideos(channel.id)
    )
    
    const responses = await Promise.all(promises)
    return responses.map((response, index) => ({
      channelId: savedChannels[index].id,
      ...response
    }))
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
      })
      .addCase(fetchAllChannelVideos.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Failed to fetch channel videos'
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

// Get all latest videos from saved channels
export const selectLatestChannelVideos = (state: { channels: ChannelsState }) => {
  const allVideos: Video[] = []
  const savedChannels = state.channels.savedChannels
  
  savedChannels.forEach(channel => {
    const channelVideos = state.channels.channelVideos[channel.id] || []
    // Take the latest 3 videos from each channel
    const latestVideos = channelVideos.slice(0, 3)
    allVideos.push(...latestVideos)
  })
  
  // Sort by published date (newest first)
  return allVideos.sort((a, b) => 
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )
}

// Get all videos from saved channels sorted by date
export const selectAllChannelVideosSortedByDate = (state: { channels: ChannelsState }) => {
  const allVideos: Video[] = []
  const savedChannels = state.channels.savedChannels
  
  savedChannels.forEach(channel => {
    const channelVideos = state.channels.channelVideos[channel.id] || []
    allVideos.push(...channelVideos)
  })
  
  // Sort by published date (newest first)
  return allVideos.sort((a, b) => 
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )
}

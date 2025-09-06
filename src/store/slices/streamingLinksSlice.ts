import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import { type StreamingLink } from '../../types/anime'

// Mock streaming links function since Jikan API doesn't provide streaming links
const getMockStreamingLinks = async (episodeId: string): Promise<{ sources: StreamingLink[], headers: any }> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Return mock streaming links
  return {
    sources: [
      {
        url: `https://example.com/stream/${episodeId}/1080p.mp4`,
        quality: '1080',
        isM3U8: false
      },
      {
        url: `https://example.com/stream/${episodeId}/720p.mp4`,
        quality: '720',
        isM3U8: false
      },
      {
        url: `https://example.com/stream/${episodeId}/480p.mp4`,
        quality: '480',
        isM3U8: false
      }
    ],
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  }
}

interface StreamingLinksState {
  streamingLinks: StreamingLink[]
  headers: any
  loading: boolean
  error: string | null
  currentEpisodeId: string | null
}

const initialState: StreamingLinksState = {
  streamingLinks: [],
  headers: null,
  loading: false,
  error: null,
  currentEpisodeId: null,
}

// Async thunk to fetch streaming links
export const fetchStreamingLinks = createAsyncThunk(
  'streamingLinks/fetchStreamingLinks',
  async (episodeId: string, { rejectWithValue }) => {
    try {
      const response = await getMockStreamingLinks(episodeId)
      return {
        episodeId,
        ...response,
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch streaming links')
    }
  }
)

const streamingLinksSlice = createSlice({
  name: 'streamingLinks',
  initialState,
  reducers: {
    clearStreamingLinks: (state) => {
      state.streamingLinks = []
      state.headers = null
      state.error = null
      state.currentEpisodeId = null
    },
    setCurrentEpisode: (state, action: PayloadAction<string>) => {
      state.currentEpisodeId = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStreamingLinks.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchStreamingLinks.fulfilled, (state, action) => {
        state.loading = false
        state.streamingLinks = action.payload.sources || []
        state.headers = action.payload.headers || null
        state.currentEpisodeId = action.payload.episodeId
        state.error = null
      })
      .addCase(fetchStreamingLinks.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
        state.streamingLinks = []
        state.headers = null
      })
  },
})

export const { clearStreamingLinks, setCurrentEpisode } = streamingLinksSlice.actions

export const selectStreamingLinks = (state: { streamingLinks: StreamingLinksState }) =>
  state.streamingLinks.streamingLinks

export const selectStreamingHeaders = (state: { streamingLinks: StreamingLinksState }) =>
  state.streamingLinks.headers

export const selectStreamingLoading = (state: { streamingLinks: StreamingLinksState }) =>
  state.streamingLinks.loading

export const selectStreamingError = (state: { streamingLinks: StreamingLinksState }) =>
  state.streamingLinks.error

export const selectCurrentEpisodeId = (state: { streamingLinks: StreamingLinksState }) =>
  state.streamingLinks.currentEpisodeId

export default streamingLinksSlice.reducer

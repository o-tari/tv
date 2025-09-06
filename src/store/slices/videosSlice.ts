import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { type Video, type Channel, type Comment } from '../../types/youtube'
import * as youtubeService from '../../services/youtube'

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

  // Related videos
  relatedVideos: Video[]
  relatedLoading: boolean
  relatedError: string | null
  relatedNextPageToken: string | null

  // Comments
  comments: Comment[]
  commentsLoading: boolean
  commentsError: string | null
  commentsNextPageToken: string | null

  // Channel
  currentChannel: Channel | null
  channelLoading: boolean
  channelError: string | null
  channelVideos: Video[]
  channelVideosLoading: boolean
  channelVideosError: string | null
  channelVideosNextPageToken: string | null
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

  relatedVideos: [],
  relatedLoading: false,
  relatedError: null,
  relatedNextPageToken: null,

  comments: [],
  commentsLoading: false,
  commentsError: null,
  commentsNextPageToken: null,

  currentChannel: null,
  channelLoading: false,
  channelError: null,
  channelVideos: [],
  channelVideosLoading: false,
  channelVideosError: null,
  channelVideosNextPageToken: null,
}

// Async thunks
export const fetchTrendingVideos = createAsyncThunk(
  'videos/fetchTrendingVideos',
  async (pageToken?: string) => {
    const response = await youtubeService.getTrendingVideos(pageToken)
    return response
  }
)

export const searchVideos = createAsyncThunk(
  'videos/searchVideos',
  async ({ query, filters, pageToken }: { query: string; filters?: any; pageToken?: string }) => {
    const response = await youtubeService.searchVideos(query, filters, pageToken)
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
    const response = await youtubeService.getRelatedVideos(videoId, pageToken)
    return response
  }
)

export const fetchVideoComments = createAsyncThunk(
  'videos/fetchVideoComments',
  async ({ videoId, pageToken }: { videoId: string; pageToken?: string }) => {
    const response = await youtubeService.getVideoComments(videoId, pageToken)
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
  async ({ channelId, pageToken }: { channelId: string; pageToken?: string }) => {
    const response = await youtubeService.getChannelVideos(channelId, pageToken)
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
      state.relatedVideos = []
      state.comments = []
    },
    clearChannel: (state) => {
      state.currentChannel = null
      state.channelVideos = []
      state.channelError = null
      state.channelVideosError = null
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
      .addCase(fetchRelatedVideos.pending, (state) => {
        state.relatedLoading = true
        state.relatedError = null
      })
      .addCase(fetchRelatedVideos.fulfilled, (state, action) => {
        state.relatedLoading = false
        if (action.meta.arg) {
          // Load more
          state.relatedVideos = [...state.relatedVideos, ...action.payload.items]
        } else {
          // Initial load
          state.relatedVideos = action.payload.items
        }
        state.relatedNextPageToken = action.payload.nextPageToken || null
      })
      .addCase(fetchRelatedVideos.rejected, (state, action) => {
        state.relatedLoading = false
        state.relatedError = action.error.message || 'Failed to fetch related videos'
      })

    // Comments
    builder
      .addCase(fetchVideoComments.pending, (state) => {
        state.commentsLoading = true
        state.commentsError = null
      })
      .addCase(fetchVideoComments.fulfilled, (state, action) => {
        state.commentsLoading = false
        if (action.meta.arg) {
          // Load more
          state.comments = [...state.comments, ...action.payload.items]
        } else {
          // Initial load
          state.comments = action.payload.items
        }
        state.commentsNextPageToken = action.payload.nextPageToken || null
      })
      .addCase(fetchVideoComments.rejected, (state, action) => {
        state.commentsLoading = false
        state.commentsError = action.error.message || 'Failed to fetch comments'
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
  },
})

export const { clearSearchResults, clearCurrentVideo, clearChannel } = videosSlice.actions
export default videosSlice.reducer

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { type Anime, type AnimeInfo, type AnimeEpisode } from '../../types/anime'
import * as consumetService from '../../services/consumet'
import { requestCache } from '../../utils/requestCache'

interface AnimeState {
  // Top airing anime
  topAiring: Anime[]
  topAiringLoading: boolean
  topAiringError: string | null
  topAiringNextPage: number | null
  topAiringHasNextPage: boolean

  // Recent episodes
  recentEpisodes: AnimeEpisode[]
  recentEpisodesLoading: boolean
  recentEpisodesError: string | null
  recentEpisodesNextPage: number | null
  recentEpisodesHasNextPage: boolean

  // Search results
  searchResults: Anime[]
  searchLoading: boolean
  searchError: string | null
  searchNextPage: number | null
  searchHasNextPage: boolean

  // Current anime
  currentAnime: AnimeInfo | null
  currentAnimeLoading: boolean
  currentAnimeError: string | null

  // Current episode
  currentEpisode: AnimeEpisode | null
  currentEpisodeLoading: boolean
  currentEpisodeError: string | null
}

const initialState: AnimeState = {
  topAiring: [],
  topAiringLoading: false,
  topAiringError: null,
  topAiringNextPage: null,
  topAiringHasNextPage: false,

  recentEpisodes: [],
  recentEpisodesLoading: false,
  recentEpisodesError: null,
  recentEpisodesNextPage: null,
  recentEpisodesHasNextPage: false,

  searchResults: [],
  searchLoading: false,
  searchError: null,
  searchNextPage: null,
  searchHasNextPage: false,

  currentAnime: null,
  currentAnimeLoading: false,
  currentAnimeError: null,

  currentEpisode: null,
  currentEpisodeLoading: false,
  currentEpisodeError: null,
}

// Async thunks
export const fetchTopAiringAnime = createAsyncThunk(
  'anime/fetchTopAiringAnime',
  async (page: number = 1) => {
    const response = await consumetService.getTopAiringAnime(page)
    return response
  }
)

export const fetchRecentEpisodes = createAsyncThunk(
  'anime/fetchRecentEpisodes',
  async ({ page = 1, type = 1 }: { page?: number; type?: number }) => {
    const response = await consumetService.getRecentEpisodes(page, type)
    return response
  }
)

export const searchAnime = createAsyncThunk(
  'anime/searchAnime',
  async ({ query, page = 1 }: { query: string; page?: number }) => {
    const response = await consumetService.searchAnime(query, page)
    return response
  }
)

export const fetchAnimeInfo = createAsyncThunk(
  'anime/fetchAnimeInfo',
  async (animeId: string) => {
    const response = await consumetService.getAnimeInfo(animeId)
    return response
  }
)

const animeSlice = createSlice({
  name: 'anime',
  initialState,
  reducers: {
    clearSearchResults: (state) => {
      state.searchResults = []
      state.searchLoading = false
      state.searchError = null
      state.searchNextPage = null
      state.searchHasNextPage = false
    },
    clearCurrentAnime: (state) => {
      state.currentAnime = null
      state.currentAnimeLoading = false
      state.currentAnimeError = null
    },
    clearCurrentEpisode: (state) => {
      state.currentEpisode = null
      state.currentEpisodeLoading = false
      state.currentEpisodeError = null
    },
    clearAllData: (state) => {
      // Clear all anime data when settings change
      state.topAiring = []
      state.topAiringLoading = false
      state.topAiringError = null
      state.topAiringNextPage = null
      state.topAiringHasNextPage = false

      state.recentEpisodes = []
      state.recentEpisodesLoading = false
      state.recentEpisodesError = null
      state.recentEpisodesNextPage = null
      state.recentEpisodesHasNextPage = false

      state.searchResults = []
      state.searchLoading = false
      state.searchError = null
      state.searchNextPage = null
      state.searchHasNextPage = false

      state.currentAnime = null
      state.currentAnimeLoading = false
      state.currentAnimeError = null

      state.currentEpisode = null
      state.currentEpisodeLoading = false
      state.currentEpisodeError = null

      // Clear request cache to prevent using cached API responses
      requestCache.clear()
    },
  },
  extraReducers: (builder) => {
    // Top airing anime
    builder
      .addCase(fetchTopAiringAnime.pending, (state) => {
        state.topAiringLoading = true
        state.topAiringError = null
      })
      .addCase(fetchTopAiringAnime.fulfilled, (state, action) => {
        state.topAiringLoading = false
        if (action.meta.arg > 1) {
          // Load more
          state.topAiring = [...state.topAiring, ...action.payload.results]
        } else {
          // Initial load
          state.topAiring = action.payload.results
        }
        state.topAiringNextPage = action.payload.currentPage + 1
        state.topAiringHasNextPage = action.payload.hasNextPage
      })
      .addCase(fetchTopAiringAnime.rejected, (state, action) => {
        state.topAiringLoading = false
        state.topAiringError = action.error.message || 'Failed to fetch top airing anime'
      })

    // Recent episodes
    builder
      .addCase(fetchRecentEpisodes.pending, (state) => {
        state.recentEpisodesLoading = true
        state.recentEpisodesError = null
      })
      .addCase(fetchRecentEpisodes.fulfilled, (state, action) => {
        state.recentEpisodesLoading = false
        if (action.meta.arg?.page && action.meta.arg.page > 1) {
          // Load more
          state.recentEpisodes = [...state.recentEpisodes, ...action.payload.results]
        } else {
          // Initial load
          state.recentEpisodes = action.payload.results
        }
        state.recentEpisodesNextPage = action.payload.currentPage + 1
        state.recentEpisodesHasNextPage = action.payload.hasNextPage
      })
      .addCase(fetchRecentEpisodes.rejected, (state, action) => {
        state.recentEpisodesLoading = false
        state.recentEpisodesError = action.error.message || 'Failed to fetch recent episodes'
      })

    // Search anime
    builder
      .addCase(searchAnime.pending, (state) => {
        state.searchLoading = true
        state.searchError = null
      })
      .addCase(searchAnime.fulfilled, (state, action) => {
        state.searchLoading = false
        if (action.meta.arg?.page && action.meta.arg.page > 1) {
          // Load more
          state.searchResults = [...state.searchResults, ...action.payload.results]
        } else {
          // Initial load
          state.searchResults = action.payload.results
        }
        state.searchNextPage = action.payload.currentPage + 1
        state.searchHasNextPage = action.payload.hasNextPage
      })
      .addCase(searchAnime.rejected, (state, action) => {
        state.searchLoading = false
        state.searchError = action.error.message || 'Failed to search anime'
      })

    // Anime info
    builder
      .addCase(fetchAnimeInfo.pending, (state) => {
        state.currentAnimeLoading = true
        state.currentAnimeError = null
      })
      .addCase(fetchAnimeInfo.fulfilled, (state, action) => {
        state.currentAnimeLoading = false
        state.currentAnime = action.payload
      })
      .addCase(fetchAnimeInfo.rejected, (state, action) => {
        state.currentAnimeLoading = false
        state.currentAnimeError = action.error.message || 'Failed to fetch anime info'
      })
  },
})

export const {
  clearSearchResults,
  clearCurrentAnime,
  clearCurrentEpisode,
  clearAllData,
} = animeSlice.actions

export default animeSlice.reducer

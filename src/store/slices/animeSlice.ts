import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { type Anime, type AnimeInfo, type AnimeEpisode } from '../../types/anime'
import * as jikanService from '../../services/jikan'
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

  // Jikan API data
  topAnime: Anime[]
  topAnimeLoading: boolean
  topAnimeError: string | null
  topAnimeNextPage: number | null
  topAnimeHasNextPage: boolean

  recommendations: Anime[]
  recommendationsLoading: boolean
  recommendationsError: string | null

  videoEpisodes: AnimeEpisode[]
  videoEpisodesLoading: boolean
  videoEpisodesError: string | null
  videoEpisodesNextPage: number | null
  videoEpisodesHasNextPage: boolean
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

  // Jikan API data
  topAnime: [],
  topAnimeLoading: false,
  topAnimeError: null,
  topAnimeNextPage: null,
  topAnimeHasNextPage: false,

  recommendations: [],
  recommendationsLoading: false,
  recommendationsError: null,

  videoEpisodes: [],
  videoEpisodesLoading: false,
  videoEpisodesError: null,
  videoEpisodesNextPage: null,
  videoEpisodesHasNextPage: false,
}

// Async thunks
export const fetchTopAiringAnime = createAsyncThunk(
  'anime/fetchTopAiringAnime',
  async (page: number = 1) => {
    const response = await jikanService.getTopAnime(page, 25, 'tv', 'airing')
    return {
      currentPage: response.pagination.current_page,
      hasNextPage: response.pagination.has_next_page,
      results: response.data.map(jikanService.convertJikanAnimeToAnime)
    }
  }
)

export const fetchRecentEpisodes = createAsyncThunk(
  'anime/fetchRecentEpisodes',
  async ({ page = 1, type = 1 }: { page?: number; type?: number }) => {
    // Use Jikan's top anime with airing filter for recent episodes
    const response = await jikanService.getTopAnime(page, 25, 'tv', 'airing')
    return {
      currentPage: response.pagination.current_page,
      hasNextPage: response.pagination.has_next_page,
      results: response.data.map(anime => ({
        id: anime.mal_id.toString(),
        episodeId: anime.mal_id.toString(),
        episodeNumber: 1, // Default episode number
        title: anime.title,
        image: anime.images.jpg.large_image_url || anime.images.jpg.image_url,
        url: `/anime/${anime.mal_id}`,
      }))
    }
  }
)

export const searchAnime = createAsyncThunk(
  'anime/searchAnime',
  async ({ query, page = 1 }: { query: string; page?: number }) => {
    const response = await jikanService.searchAnime(query, page, 25)
    return {
      currentPage: response.pagination.current_page,
      hasNextPage: response.pagination.has_next_page,
      results: response.data.map(jikanService.convertJikanAnimeToAnime)
    }
  }
)

export const fetchAnimeInfo = createAsyncThunk(
  'anime/fetchAnimeInfo',
  async (animeId: string) => {
    const anime = await jikanService.getAnimeById(parseInt(animeId))
    return jikanService.convertJikanAnimeToAnime(anime)
  }
)

// Jikan API thunks
export const fetchTopAnime = createAsyncThunk(
  'anime/fetchTopAnime',
  async ({ page = 1, filter = 'bypopularity' }: { page?: number; filter?: string } = {}) => {
    const response = await jikanService.getTopAnime(page, 25, 'tv', filter)
    return {
      currentPage: response.pagination.current_page,
      hasNextPage: response.pagination.has_next_page,
      results: response.data.map(jikanService.convertJikanAnimeToAnime)
    }
  }
)


export const fetchAnimeRecommendations = createAsyncThunk(
  'anime/fetchAnimeRecommendations',
  async (animeId: number) => {
    const response = await jikanService.getAnimeRecommendations(animeId)
    return response.map(rec => jikanService.convertJikanAnimeToAnime(rec.entry))
  }
)

export const fetchAnimeVideoEpisodes = createAsyncThunk(
  'anime/fetchAnimeVideoEpisodes',
  async ({ animeId, page = 1 }: { animeId: number; page?: number }) => {
    const response = await jikanService.getAnimeVideoEpisodes(animeId, page)
    return {
      currentPage: response.pagination.current_page,
      hasNextPage: response.pagination.has_next_page,
      results: response.data.map(episode => ({
        id: episode.mal_id.toString(),
        episodeId: episode.mal_id.toString(),
        episodeNumber: parseInt(episode.episode) || 0,
        title: episode.title,
        image: episode.images.jpg.image_url,
        url: episode.url
      }))
    }
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

      // Clear Jikan data
      state.topAnime = []
      state.topAnimeLoading = false
      state.topAnimeError = null
      state.topAnimeNextPage = null
      state.topAnimeHasNextPage = false

      state.recommendations = []
      state.recommendationsLoading = false
      state.recommendationsError = null

      state.videoEpisodes = []
      state.videoEpisodesLoading = false
      state.videoEpisodesError = null
      state.videoEpisodesNextPage = null
      state.videoEpisodesHasNextPage = false

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

    // Top anime (Jikan)
    builder
      .addCase(fetchTopAnime.pending, (state) => {
        state.topAnimeLoading = true
        state.topAnimeError = null
      })
      .addCase(fetchTopAnime.fulfilled, (state, action) => {
        state.topAnimeLoading = false
        if (action.meta.arg?.page && action.meta.arg.page > 1) {
          // Load more
          state.topAnime = [...state.topAnime, ...action.payload.results]
        } else {
          // Initial load
          state.topAnime = action.payload.results
        }
        state.topAnimeNextPage = action.payload.currentPage + 1
        state.topAnimeHasNextPage = action.payload.hasNextPage
      })
      .addCase(fetchTopAnime.rejected, (state, action) => {
        state.topAnimeLoading = false
        state.topAnimeError = action.error.message || 'Failed to fetch top anime'
      })


    // Anime recommendations (Jikan)
    builder
      .addCase(fetchAnimeRecommendations.pending, (state) => {
        state.recommendationsLoading = true
        state.recommendationsError = null
      })
      .addCase(fetchAnimeRecommendations.fulfilled, (state, action) => {
        state.recommendationsLoading = false
        state.recommendations = action.payload
      })
      .addCase(fetchAnimeRecommendations.rejected, (state, action) => {
        state.recommendationsLoading = false
        state.recommendationsError = action.error.message || 'Failed to fetch recommendations'
      })

    // Video episodes (Jikan)
    builder
      .addCase(fetchAnimeVideoEpisodes.pending, (state) => {
        state.videoEpisodesLoading = true
        state.videoEpisodesError = null
      })
      .addCase(fetchAnimeVideoEpisodes.fulfilled, (state, action) => {
        state.videoEpisodesLoading = false
        if (action.meta.arg?.page && action.meta.arg.page > 1) {
          // Load more
          state.videoEpisodes = [...state.videoEpisodes, ...action.payload.results]
        } else {
          // Initial load
          state.videoEpisodes = action.payload.results
        }
        state.videoEpisodesNextPage = action.payload.currentPage + 1
        state.videoEpisodesHasNextPage = action.payload.hasNextPage
      })
      .addCase(fetchAnimeVideoEpisodes.rejected, (state, action) => {
        state.videoEpisodesLoading = false
        state.videoEpisodesError = action.error.message || 'Failed to fetch video episodes'
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

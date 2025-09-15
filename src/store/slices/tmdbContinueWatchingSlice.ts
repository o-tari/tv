import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { TMDBContent } from '../../types/tmdb'

interface TMDBContinueWatchingItem {
  id: string // unique identifier combining type and id
  type: 'movie' | 'tv'
  tmdbId: number
  title: string
  thumbnail: string | null
  overview: string
  rating: number
  publishedAt: string
  lastWatchedTime: number
  lastWatchedEpisode?: {
    seasonNumber: number
    episodeNumber: number
    airDate: string
  }
  hasNewEpisodes?: boolean
  newEpisodesCount?: number
}

interface TMDBContinueWatchingState {
  items: TMDBContinueWatchingItem[]
}

const initialState: TMDBContinueWatchingState = {
  items: [],
}

// Load from localStorage on initialization
const loadFromStorage = (): TMDBContinueWatchingState => {
  try {
    const stored = localStorage.getItem('tmdbContinueWatching')
    if (stored) {
      const parsed = JSON.parse(stored)
      return {
        items: parsed.items || [],
      }
    }
  } catch (error) {
    console.error('Error loading TMDB continue watching from localStorage:', error)
  }
  return initialState
}

// Save to localStorage
const saveToStorage = (state: TMDBContinueWatchingState) => {
  try {
    localStorage.setItem('tmdbContinueWatching', JSON.stringify(state))
  } catch (error) {
    console.error('Error saving TMDB continue watching to localStorage:', error)
  }
}

const tmdbContinueWatchingSlice = createSlice({
  name: 'tmdbContinueWatching',
  initialState: loadFromStorage(),
  reducers: {
    addMovieToContinueWatching: (state, action: PayloadAction<{
      content: TMDBContent
      type: 'movie'
    }>) => {
      const { content, type } = action.payload
      const item: TMDBContinueWatchingItem = {
        id: `movie-${content.id}`,
        type,
        tmdbId: content.id,
        title: 'title' in content ? content.title : content.name,
        thumbnail: content.poster_path,
        overview: content.overview,
        rating: content.vote_average,
        publishedAt: 'release_date' in content ? content.release_date : content.first_air_date,
        lastWatchedTime: Date.now(),
      }
      
      // Remove if already exists
      const existingIndex = state.items.findIndex(existingItem => existingItem.id === item.id)
      if (existingIndex !== -1) {
        state.items.splice(existingIndex, 1)
      }
      
      // Add to beginning
      state.items.unshift(item)
      saveToStorage(state)
    },
    
    addTVToContinueWatching: (state, action: PayloadAction<{
      content: TMDBContent
      type: 'tv'
    }>) => {
      const { content, type } = action.payload
      const item: TMDBContinueWatchingItem = {
        id: `tv-${content.id}`,
        type,
        tmdbId: content.id,
        title: 'name' in content ? content.name : content.title,
        thumbnail: content.poster_path,
        overview: content.overview,
        rating: content.vote_average,
        publishedAt: 'first_air_date' in content ? content.first_air_date : content.release_date,
        lastWatchedTime: Date.now(),
      }
      
      // Remove if already exists
      const existingIndex = state.items.findIndex(existingItem => existingItem.id === item.id)
      if (existingIndex !== -1) {
        state.items.splice(existingIndex, 1)
      }
      
      // Add to beginning
      state.items.unshift(item)
      saveToStorage(state)
    },
    
    
    removeFromTMDBContinueWatching: (state, action: PayloadAction<string>) => {
      const itemId = action.payload
      state.items = state.items.filter(item => item.id !== itemId)
      saveToStorage(state)
    },
    
    clearTMDBContinueWatching: (state) => {
      state.items = []
      saveToStorage(state)
    },
    
    updateTMDBLastWatchedTime: (state, action: PayloadAction<string>) => {
      const itemId = action.payload
      const item = state.items.find(item => item.id === itemId)
      if (item) {
        item.lastWatchedTime = Date.now()
        saveToStorage(state)
      }
    },

    updateLastWatchedEpisode: (state, action: PayloadAction<{
      itemId: string
      seasonNumber: number
      episodeNumber: number
      airDate: string
    }>) => {
      const { itemId, seasonNumber, episodeNumber, airDate } = action.payload
      const item = state.items.find(item => item.id === itemId)
      if (item && item.type === 'tv') {
        item.lastWatchedEpisode = {
          seasonNumber,
          episodeNumber,
          airDate
        }
        item.lastWatchedTime = Date.now()
        saveToStorage(state)
      }
    },

    updateProcessedItems: (state, action: PayloadAction<TMDBContinueWatchingItem[]>) => {
      state.items = action.payload
      saveToStorage(state)
    },
  },
})

export const {
  addMovieToContinueWatching,
  addTVToContinueWatching,
  removeFromTMDBContinueWatching,
  clearTMDBContinueWatching,
  updateTMDBLastWatchedTime,
  updateLastWatchedEpisode,
  updateProcessedItems,
} = tmdbContinueWatchingSlice.actions

export const selectTMDBContinueWatching = (state: { tmdbContinueWatching: TMDBContinueWatchingState }) => 
  state.tmdbContinueWatching.items

export default tmdbContinueWatchingSlice.reducer

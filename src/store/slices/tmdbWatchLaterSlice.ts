import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { TMDBContent } from '../../types/tmdb'

interface TMDBWatchLaterItem {
  id: string // unique identifier combining type and id
  type: 'movie' | 'tv'
  tmdbId: number
  title: string
  thumbnail: string | null
  overview: string
  rating: number
  publishedAt: string
  addedAt: number
}

interface TMDBWatchLaterState {
  items: TMDBWatchLaterItem[]
}

const initialState: TMDBWatchLaterState = {
  items: [],
}

// Load from localStorage on initialization
const loadFromStorage = (): TMDBWatchLaterState => {
  try {
    const stored = localStorage.getItem('tmdbWatchLater')
    if (stored) {
      const parsed = JSON.parse(stored)
      return {
        items: parsed.items || [],
      }
    }
  } catch (error) {
    console.error('Error loading TMDB watch later from localStorage:', error)
  }
  return initialState
}

// Save to localStorage
const saveToStorage = (state: TMDBWatchLaterState) => {
  try {
    localStorage.setItem('tmdbWatchLater', JSON.stringify(state))
  } catch (error) {
    console.error('Error saving TMDB watch later to localStorage:', error)
  }
}

const tmdbWatchLaterSlice = createSlice({
  name: 'tmdbWatchLater',
  initialState: loadFromStorage(),
  reducers: {
    addToWatchLater: (state, action: PayloadAction<{
      content: TMDBContent
      type: 'movie' | 'tv'
    }>) => {
      const { content, type } = action.payload
      const item: TMDBWatchLaterItem = {
        id: `${type}-${content.id}`,
        type,
        tmdbId: content.id,
        title: 'title' in content ? content.title : content.name,
        thumbnail: content.poster_path,
        overview: content.overview,
        rating: content.vote_average,
        publishedAt: 'release_date' in content ? content.release_date : content.first_air_date,
        addedAt: Date.now(),
      }
      
      // Check if already exists
      const existingIndex = state.items.findIndex(existingItem => existingItem.id === item.id)
      if (existingIndex === -1) {
        // Add to beginning
        state.items.unshift(item)
        saveToStorage(state)
      }
    },
    
    removeFromWatchLater: (state, action: PayloadAction<string>) => {
      const itemId = action.payload
      state.items = state.items.filter(item => item.id !== itemId)
      saveToStorage(state)
    },
    
    clearWatchLater: (state) => {
      state.items = []
      saveToStorage(state)
    },
    
    moveToTop: (state, action: PayloadAction<string>) => {
      const itemId = action.payload
      const itemIndex = state.items.findIndex(item => item.id === itemId)
      if (itemIndex !== -1) {
        const item = state.items[itemIndex]
        state.items.splice(itemIndex, 1)
        state.items.unshift(item)
        saveToStorage(state)
      }
    },
  },
})

export const {
  addToWatchLater,
  removeFromWatchLater,
  clearWatchLater,
  moveToTop,
} = tmdbWatchLaterSlice.actions

export const selectTMDBWatchLater = (state: { tmdbWatchLater: TMDBWatchLaterState }) => 
  state.tmdbWatchLater.items

export const selectIsInWatchLater = (tmdbId: number, type: 'movie' | 'tv') => 
  (state: { tmdbWatchLater: TMDBWatchLaterState }) => 
    state.tmdbWatchLater.items.some(item => item.tmdbId === tmdbId && item.type === type)

export default tmdbWatchLaterSlice.reducer

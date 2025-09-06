import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { AnimeMedia } from '../../types/anime'

interface AnimeContinueWatchingState {
  anime: AnimeMedia[]
}

const loadFromStorage = (): AnimeMedia[] => {
  try {
    const stored = localStorage.getItem('animeContinueWatching')
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

const saveToStorage = (anime: AnimeMedia[]) => {
  try {
    localStorage.setItem('animeContinueWatching', JSON.stringify(anime))
  } catch (error) {
    console.error('Error saving anime continue watching to localStorage:', error)
  }
}

const initialState: AnimeContinueWatchingState = {
  anime: loadFromStorage(),
}

const animeContinueWatchingSlice = createSlice({
  name: 'animeContinueWatching',
  initialState,
  reducers: {
    addToAnimeContinueWatching: (state, action: PayloadAction<AnimeMedia>) => {
      const existingIndex = state.anime.findIndex(item => item.id === action.payload.id)
      
      if (existingIndex >= 0) {
        // Update existing entry
        state.anime[existingIndex] = action.payload
      } else {
        // Add new entry to the beginning
        state.anime.unshift(action.payload)
      }
      
      saveToStorage(state.anime)
    },
    removeFromAnimeContinueWatching: (state, action: PayloadAction<string>) => {
      state.anime = state.anime.filter(item => item.id !== action.payload)
      saveToStorage(state.anime)
    },
    clearAnimeContinueWatching: (state) => {
      state.anime = []
      saveToStorage([])
    },
    updateAnimeLastWatched: (state, action: PayloadAction<{ id: string; lastWatched: number }>) => {
      const item = state.anime.find(item => item.id === action.payload.id)
      if (item) {
        // Update the last watched time (this would be stored in a separate field if needed)
        // For now, we'll just update the existing item
        const index = state.anime.findIndex(item => item.id === action.payload.id)
        if (index >= 0) {
          state.anime[index] = { ...state.anime[index] }
        }
        saveToStorage(state.anime)
      }
    },
  },
})

export const {
  addToAnimeContinueWatching,
  removeFromAnimeContinueWatching,
  clearAnimeContinueWatching,
  updateAnimeLastWatched,
} = animeContinueWatchingSlice.actions

// Selectors
export const selectAnimeContinueWatching = (state: { animeContinueWatching: AnimeContinueWatchingState }) => 
  state.animeContinueWatching.anime

export default animeContinueWatchingSlice.reducer

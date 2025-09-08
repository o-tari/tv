import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { AnimeMedia } from '../../types/anime'

interface AnimeContinueWatchingState {
  anime: AnimeMedia[]
}

interface AnimeEpisodeProgress {
  animeId: string
  episodeId: string
  episodeNumber: number
  episodeTitle: string
  lastWatched: number
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

const saveEpisodeProgress = (progress: AnimeEpisodeProgress) => {
  try {
    localStorage.setItem(`anime-${progress.animeId}-episode-progress`, JSON.stringify(progress))
  } catch (error) {
    console.error('Error saving anime episode progress to localStorage:', error)
  }
}

const getEpisodeProgress = (animeId: string): AnimeEpisodeProgress | null => {
  try {
    const stored = localStorage.getItem(`anime-${animeId}-episode-progress`)
    return stored ? JSON.parse(stored) : null
  } catch (error) {
    console.error('Error loading anime episode progress from localStorage:', error)
    return null
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
    saveAnimeEpisodeProgress: (_, action: PayloadAction<{
      animeId: string
      episodeId: string
      episodeNumber: number
      episodeTitle: string
    }>) => {
      const progress: AnimeEpisodeProgress = {
        ...action.payload,
        lastWatched: Date.now()
      }
      saveEpisodeProgress(progress)
    },
  },
})

export const {
  addToAnimeContinueWatching,
  removeFromAnimeContinueWatching,
  clearAnimeContinueWatching,
  updateAnimeLastWatched,
  saveAnimeEpisodeProgress,
} = animeContinueWatchingSlice.actions

// Selectors
export const selectAnimeContinueWatching = (state: { animeContinueWatching: AnimeContinueWatchingState }) => 
  state.animeContinueWatching.anime

export const selectAnimeEpisodeProgress = (animeId: string) => getEpisodeProgress(animeId)

export default animeContinueWatchingSlice.reducer

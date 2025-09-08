import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { HiAnimeMedia } from '../../types/anime'

interface HiAnimeContinueWatchingState {
  anime: HiAnimeMedia[]
}

interface HiAnimeEpisodeProgress {
  animeId: string
  episodeId: string
  episodeNumber: number
  episodeTitle: string
  lastWatched: number
  serverId?: number
  serverName?: string
  language: 'sub' | 'dub'
}

const loadFromStorage = (): HiAnimeMedia[] => {
  try {
    const stored = localStorage.getItem('hianimeContinueWatching')
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

const saveToStorage = (anime: HiAnimeMedia[]) => {
  try {
    localStorage.setItem('hianimeContinueWatching', JSON.stringify(anime))
  } catch (error) {
    console.error('Error saving HiAnime continue watching to localStorage:', error)
  }
}

const saveEpisodeProgress = (progress: HiAnimeEpisodeProgress) => {
  try {
    localStorage.setItem(`hianime-${progress.animeId}-episode-progress`, JSON.stringify(progress))
  } catch (error) {
    console.error('Error saving HiAnime episode progress to localStorage:', error)
  }
}

const getEpisodeProgress = (animeId: string): HiAnimeEpisodeProgress | null => {
  try {
    const stored = localStorage.getItem(`hianime-${animeId}-episode-progress`)
    return stored ? JSON.parse(stored) : null
  } catch (error) {
    console.error('Error loading HiAnime episode progress from localStorage:', error)
    return null
  }
}

const initialState: HiAnimeContinueWatchingState = {
  anime: loadFromStorage(),
}

const hianimeContinueWatchingSlice = createSlice({
  name: 'hianimeContinueWatching',
  initialState,
  reducers: {
    addToHiAnimeContinueWatching: (state, action: PayloadAction<HiAnimeMedia>) => {
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
    removeFromHiAnimeContinueWatching: (state, action: PayloadAction<string>) => {
      state.anime = state.anime.filter(item => item.id !== action.payload)
      saveToStorage(state.anime)
    },
    clearHiAnimeContinueWatching: (state) => {
      state.anime = []
      saveToStorage([])
    },
    updateHiAnimeLastWatched: (state, action: PayloadAction<{ id: string; lastWatched: number }>) => {
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
    saveHiAnimeEpisodeProgress: (_, action: PayloadAction<{
      animeId: string
      episodeId: string
      episodeNumber: number
      episodeTitle: string
      serverId?: number
      serverName?: string
      language: 'sub' | 'dub'
    }>) => {
      const progress: HiAnimeEpisodeProgress = {
        ...action.payload,
        lastWatched: Date.now()
      }
      saveEpisodeProgress(progress)
    },
  },
})

export const {
  addToHiAnimeContinueWatching,
  removeFromHiAnimeContinueWatching,
  clearHiAnimeContinueWatching,
  updateHiAnimeLastWatched,
  saveHiAnimeEpisodeProgress,
} = hianimeContinueWatchingSlice.actions

// Selectors
export const selectHiAnimeContinueWatching = (state: { hianimeContinueWatching: HiAnimeContinueWatchingState }) => 
  state.hianimeContinueWatching.anime

export const selectHiAnimeEpisodeProgress = (animeId: string) => getEpisodeProgress(animeId)

export default hianimeContinueWatchingSlice.reducer

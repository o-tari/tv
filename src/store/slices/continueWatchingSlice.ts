import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { Video } from '../../types/youtube'

interface ContinueWatchingState {
  videos: Video[]
  lastWatchedTimes: Record<string, number> // videoId -> timestamp
}

const initialState: ContinueWatchingState = {
  videos: [],
  lastWatchedTimes: {},
}

// Load from localStorage on initialization
const loadFromStorage = (): ContinueWatchingState => {
  try {
    const stored = localStorage.getItem('continueWatching')
    if (stored) {
      const parsed = JSON.parse(stored)
      return {
        videos: parsed.videos || [],
        lastWatchedTimes: parsed.lastWatchedTimes || {},
      }
    }
  } catch (error) {
    console.error('Error loading continue watching from localStorage:', error)
  }
  return initialState
}

// Save to localStorage
const saveToStorage = (state: ContinueWatchingState) => {
  try {
    localStorage.setItem('continueWatching', JSON.stringify(state))
  } catch (error) {
    console.error('Error saving continue watching to localStorage:', error)
  }
}

const continueWatchingSlice = createSlice({
  name: 'continueWatching',
  initialState: loadFromStorage(),
  reducers: {
    addToContinueWatching: (state, action: PayloadAction<Video>) => {
      const video = action.payload
      const existingIndex = state.videos.findIndex(v => v.id === video.id)
      
      if (existingIndex !== -1) {
        // Move to front if already exists
        state.videos.splice(existingIndex, 1)
      }
      
      // Add to beginning
      state.videos.unshift(video)
      
      // Update last watched time
      state.lastWatchedTimes[video.id] = Date.now()
      
      saveToStorage(state)
    },
    
    removeFromContinueWatching: (state, action: PayloadAction<string>) => {
      const videoId = action.payload
      state.videos = state.videos.filter(v => v.id !== videoId)
      delete state.lastWatchedTimes[videoId]
      saveToStorage(state)
    },
    
    clearContinueWatching: (state) => {
      state.videos = []
      state.lastWatchedTimes = {}
      saveToStorage(state)
    },
    
    updateLastWatchedTime: (state, action: PayloadAction<string>) => {
      const videoId = action.payload
      if (state.videos.some(v => v.id === videoId)) {
        state.lastWatchedTimes[videoId] = Date.now()
        saveToStorage(state)
      }
    },
  },
})

export const {
  addToContinueWatching,
  removeFromContinueWatching,
  clearContinueWatching,
  updateLastWatchedTime,
} = continueWatchingSlice.actions

export const selectContinueWatching = (state: { continueWatching: ContinueWatchingState }) => state.continueWatching.videos
export const selectLastWatchedTimes = (state: { continueWatching: ContinueWatchingState }) => state.continueWatching.lastWatchedTimes

export default continueWatchingSlice.reducer

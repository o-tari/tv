import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { type Video } from '../../types/youtube'

interface HistoryState {
  watchHistory: Video[]
  watchLater: Video[]
  subscriptions: string[] // Channel IDs
}

const loadFromStorage = (key: string, defaultValue: any) => {
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : defaultValue
  } catch {
    return defaultValue
  }
}

const saveToStorage = (key: string, value: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    // Failed to save to localStorage
  }
}

const initialState: HistoryState = {
  watchHistory: loadFromStorage('watchHistory', []),
  watchLater: loadFromStorage('watchLater', []),
  subscriptions: loadFromStorage('subscriptions', []),
}

const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    addToHistory: (state, action: PayloadAction<Video>) => {
      const video = action.payload
      // Remove if already exists to avoid duplicates
      state.watchHistory = state.watchHistory.filter(v => v.id !== video.id)
      // Add to beginning
      state.watchHistory.unshift(video)
      // Keep only last 100 videos
      if (state.watchHistory.length > 100) {
        state.watchHistory = state.watchHistory.slice(0, 100)
      }
      saveToStorage('watchHistory', state.watchHistory)
    },
    removeFromHistory: (state, action: PayloadAction<string>) => {
      state.watchHistory = state.watchHistory.filter(v => v.id !== action.payload)
      saveToStorage('watchHistory', state.watchHistory)
    },
    clearHistory: (state) => {
      state.watchHistory = []
      saveToStorage('watchHistory', state.watchHistory)
    },
    addToWatchLater: (state, action: PayloadAction<Video>) => {
      const video = action.payload
      if (!state.watchLater.find(v => v.id === video.id)) {
        state.watchLater.unshift(video)
        saveToStorage('watchLater', state.watchLater)
      }
    },
    removeFromWatchLater: (state, action: PayloadAction<string>) => {
      state.watchLater = state.watchLater.filter(v => v.id !== action.payload)
      saveToStorage('watchLater', state.watchLater)
    },
    clearWatchLater: (state) => {
      state.watchLater = []
      saveToStorage('watchLater', state.watchLater)
    },
    subscribeToChannel: (state, action: PayloadAction<string>) => {
      const channelId = action.payload
      if (!state.subscriptions.includes(channelId)) {
        state.subscriptions.push(channelId)
        saveToStorage('subscriptions', state.subscriptions)
      }
    },
    unsubscribeFromChannel: (state, action: PayloadAction<string>) => {
      state.subscriptions = state.subscriptions.filter(id => id !== action.payload)
      saveToStorage('subscriptions', state.subscriptions)
    },
  },
})

export const {
  addToHistory,
  removeFromHistory,
  clearHistory,
  addToWatchLater,
  removeFromWatchLater,
  clearWatchLater,
  subscribeToChannel,
  unsubscribeFromChannel,
} = historySlice.actions

// Selectors
export const selectWatchHistory = (state: { history: HistoryState }) => state.history.watchHistory
export const selectWatchLater = (state: { history: HistoryState }) => state.history.watchLater
export const selectSubscriptions = (state: { history: HistoryState }) => state.history.subscriptions

export default historySlice.reducer

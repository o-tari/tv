import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface UIState {
  theme: 'light' | 'dark'
  sidebarOpen: boolean
  searchQuery: string
  searchFilters: {
    type: 'video' | 'channel' | 'playlist'
    duration: 'short' | 'medium' | 'long' | ''
    uploadDate: 'hour' | 'today' | 'week' | 'month' | 'year' | ''
    sortBy: 'relevance' | 'date' | 'rating' | 'title' | 'viewCount'
  }
  playerState: {
    isPlaying: boolean
    currentTime: number
    duration: number
    volume: number
    isMuted: boolean
    isFullscreen: boolean
  }
  autoplay: boolean
  notifications: Array<{
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    message: string
    timestamp: number
  }>
}

const initialState: UIState = {
  theme: (localStorage.getItem('theme') as 'light' | 'dark') || 'dark',
  sidebarOpen: localStorage.getItem('sidebarOpen') === 'true' || false,
  searchQuery: '',
  searchFilters: {
    type: 'video',
    duration: '',
    uploadDate: '',
    sortBy: 'relevance',
  },
  playerState: {
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isMuted: false,
    isFullscreen: false,
  },
  autoplay: localStorage.getItem('autoplay') === 'true' || true, // Default to true
  notifications: [],
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light'
      localStorage.setItem('theme', state.theme)
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload
      localStorage.setItem('theme', state.theme)
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
      localStorage.setItem('sidebarOpen', state.sidebarOpen.toString())
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload
      localStorage.setItem('sidebarOpen', state.sidebarOpen.toString())
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload
    },
    setSearchFilters: (state, action: PayloadAction<Partial<UIState['searchFilters']>>) => {
      state.searchFilters = { ...state.searchFilters, ...action.payload }
    },
    clearSearchFilters: (state) => {
      state.searchFilters = initialState.searchFilters
    },
    updatePlayerState: (state, action: PayloadAction<Partial<UIState['playerState']>>) => {
      state.playerState = { ...state.playerState, ...action.payload }
    },
    addNotification: (state, action: PayloadAction<Omit<UIState['notifications'][0], 'id' | 'timestamp'>>) => {
      const notification = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: Date.now(),
      }
      state.notifications.push(notification)
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload)
    },
    clearNotifications: (state) => {
      state.notifications = []
    },
    toggleAutoplay: (state) => {
      state.autoplay = !state.autoplay
      localStorage.setItem('autoplay', state.autoplay.toString())
    },
    setAutoplay: (state, action: PayloadAction<boolean>) => {
      state.autoplay = action.payload
      localStorage.setItem('autoplay', state.autoplay.toString())
    },
  },
})

export const {
  toggleTheme,
  setTheme,
  toggleSidebar,
  setSidebarOpen,
  setSearchQuery,
  setSearchFilters,
  clearSearchFilters,
  updatePlayerState,
  addNotification,
  removeNotification,
  clearNotifications,
  toggleAutoplay,
  setAutoplay,
} = uiSlice.actions

export default uiSlice.reducer

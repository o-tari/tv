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
  notifications: Array<{
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    message: string
    timestamp: number
  }>
}

const initialState: UIState = {
  theme: (localStorage.getItem('theme') as 'light' | 'dark') || 'dark',
  sidebarOpen: true,
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
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload
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
} = uiSlice.actions

export default uiSlice.reducer

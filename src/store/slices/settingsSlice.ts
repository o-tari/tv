import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

interface SettingsState {
  youtubeApiKey: string
  useMockData: boolean
  consumetApiUrl: string
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
    console.error('Error saving to localStorage:', error)
  }
}

// Check if environment API key is set
const hasEnvApiKey = import.meta.env.VITE_YT_API_KEY && 
  import.meta.env.VITE_YT_API_KEY !== 'your_youtube_api_key_here'

const initialState: SettingsState = {
  youtubeApiKey: loadFromStorage('youtubeApiKey', ''),
  useMockData: loadFromStorage('useMockData', !hasEnvApiKey), // Default to true if no env API key
  consumetApiUrl: loadFromStorage('consumetApiUrl', import.meta.env.VITE_CONSUMET_API_URL || 'https://api.consumet.org'),
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setYoutubeApiKey: (state, action: PayloadAction<string>) => {
      state.youtubeApiKey = action.payload
      saveToStorage('youtubeApiKey', action.payload)
    },
    setUseMockData: (state, action: PayloadAction<boolean>) => {
      state.useMockData = action.payload
      saveToStorage('useMockData', action.payload)
    },
    setConsumetApiUrl: (state, action: PayloadAction<string>) => {
      state.consumetApiUrl = action.payload
      saveToStorage('consumetApiUrl', action.payload)
    },
    resetSettings: (state) => {
      state.youtubeApiKey = ''
      state.useMockData = false
      state.consumetApiUrl = import.meta.env.VITE_CONSUMET_API_URL || 'https://api.consumet.org'
      saveToStorage('youtubeApiKey', '')
      saveToStorage('useMockData', false)
      saveToStorage('consumetApiUrl', state.consumetApiUrl)
    },
  },
})

export const {
  setYoutubeApiKey,
  setUseMockData,
  setConsumetApiUrl,
  resetSettings,
} = settingsSlice.actions

// Selectors
export const selectYoutubeApiKey = (state: { settings: SettingsState }) => state.settings.youtubeApiKey
export const selectUseMockData = (state: { settings: SettingsState }) => state.settings.useMockData
export const selectConsumetApiUrl = (state: { settings: SettingsState }) => state.settings.consumetApiUrl

export default settingsSlice.reducer

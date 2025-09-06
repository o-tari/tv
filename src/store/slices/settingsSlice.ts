import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

interface SettingsState {
  youtubeApiKey: string
  useMockData: boolean
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

const initialState: SettingsState = {
  youtubeApiKey: loadFromStorage('youtubeApiKey', ''),
  useMockData: loadFromStorage('useMockData', false),
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
    resetSettings: (state) => {
      state.youtubeApiKey = ''
      state.useMockData = false
      saveToStorage('youtubeApiKey', '')
      saveToStorage('useMockData', false)
    },
  },
})

export const {
  setYoutubeApiKey,
  setUseMockData,
  resetSettings,
} = settingsSlice.actions

// Selectors
export const selectYoutubeApiKey = (state: { settings: SettingsState }) => state.settings.youtubeApiKey
export const selectUseMockData = (state: { settings: SettingsState }) => state.settings.useMockData

export default settingsSlice.reducer

import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

interface SettingsState {
  youtubeApiKey: string
  useMockData: boolean
  consumetApiUrl: string
  regionCode: string
  language: string
  tmdbApiKey: string
  showUpcomingReleases: boolean
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
  useMockData: loadFromStorage('useMockData', false), // Default to false - user must explicitly enable mock data
  consumetApiUrl: loadFromStorage('consumetApiUrl', ''),
  regionCode: loadFromStorage('regionCode', 'US'),
  language: loadFromStorage('language', 'en'),
  tmdbApiKey: loadFromStorage('tmdbApiKey', ''),
  showUpcomingReleases: loadFromStorage('showUpcomingReleases', true),
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
    setRegionCode: (state, action: PayloadAction<string>) => {
      state.regionCode = action.payload
      saveToStorage('regionCode', action.payload)
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload
      saveToStorage('language', action.payload)
    },
    setTmdbApiKey: (state, action: PayloadAction<string>) => {
      state.tmdbApiKey = action.payload
      saveToStorage('tmdbApiKey', action.payload)
    },
    setShowUpcomingReleases: (state, action: PayloadAction<boolean>) => {
      state.showUpcomingReleases = action.payload
      saveToStorage('showUpcomingReleases', action.payload)
    },
    resetSettings: (state) => {
      state.youtubeApiKey = ''
      state.useMockData = false
      state.consumetApiUrl = ''
      state.regionCode = 'US'
      state.language = 'en'
      state.tmdbApiKey = ''
      state.showUpcomingReleases = true
      saveToStorage('youtubeApiKey', '')
      saveToStorage('useMockData', false)
      saveToStorage('consumetApiUrl', '')
      saveToStorage('regionCode', 'US')
      saveToStorage('language', 'en')
      saveToStorage('tmdbApiKey', '')
      saveToStorage('showUpcomingReleases', true)
    },
  },
})

export const {
  setYoutubeApiKey,
  setUseMockData,
  setConsumetApiUrl,
  setRegionCode,
  setLanguage,
  setTmdbApiKey,
  setShowUpcomingReleases,
  resetSettings,
} = settingsSlice.actions

// Selectors
export const selectYoutubeApiKey = (state: { settings: SettingsState }) => state.settings.youtubeApiKey
export const selectUseMockData = (state: { settings: SettingsState }) => state.settings.useMockData
export const selectConsumetApiUrl = (state: { settings: SettingsState }) => state.settings.consumetApiUrl
export const selectRegionCode = (state: { settings: SettingsState }) => state.settings.regionCode
export const selectLanguage = (state: { settings: SettingsState }) => state.settings.language
export const selectTmdbApiKey = (state: { settings: SettingsState }) => state.settings.tmdbApiKey
export const selectShowUpcomingReleases = (state: { settings: SettingsState }) => state.settings.showUpcomingReleases

export default settingsSlice.reducer

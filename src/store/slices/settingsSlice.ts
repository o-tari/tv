import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

interface SettingsState {
  youtubeApiKey: string
  useMockData: boolean
  regionCode: string
  language: string
  tmdbApiKey: string
  showUpcomingReleases: boolean
  hianimeApiKey: string
  torrentApiUrl: string
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
  useMockData: loadFromStorage('useMockData', true), // Default to true - use mock data by default
  regionCode: loadFromStorage('regionCode', 'US'),
  language: loadFromStorage('language', 'en'),
  tmdbApiKey: loadFromStorage('tmdbApiKey', ''),
  showUpcomingReleases: loadFromStorage('showUpcomingReleases', true),
  hianimeApiKey: loadFromStorage('hianimeApiKey', ''),
  torrentApiUrl: loadFromStorage('torrentApiUrl', 'https://torrent-api-py-nx0x.onrender.com'),
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
    setHianimeApiKey: (state, action: PayloadAction<string>) => {
      state.hianimeApiKey = action.payload
      saveToStorage('hianimeApiKey', action.payload)
    },
    setTorrentApiUrl: (state, action: PayloadAction<string>) => {
      state.torrentApiUrl = action.payload
      saveToStorage('torrentApiUrl', action.payload)
    },
    resetSettings: (state) => {
      state.youtubeApiKey = ''
      state.useMockData = true
      state.regionCode = 'US'
      state.language = 'en'
      state.tmdbApiKey = ''
      state.showUpcomingReleases = true
      state.hianimeApiKey = ''
      state.torrentApiUrl = 'https://torrent-api-py-nx0x.onrender.com'
      saveToStorage('youtubeApiKey', '')
      saveToStorage('useMockData', true)
      saveToStorage('regionCode', 'US')
      saveToStorage('language', 'en')
      saveToStorage('tmdbApiKey', '')
      saveToStorage('showUpcomingReleases', true)
      saveToStorage('hianimeApiKey', '')
      saveToStorage('torrentApiUrl', 'https://torrent-api-py-nx0x.onrender.com')
    },
  },
})

export const {
  setYoutubeApiKey,
  setUseMockData,
  setRegionCode,
  setLanguage,
  setTmdbApiKey,
  setShowUpcomingReleases,
  setHianimeApiKey,
  setTorrentApiUrl,
  resetSettings,
} = settingsSlice.actions

// Selectors
export const selectYoutubeApiKey = (state: { settings: SettingsState }) => state.settings.youtubeApiKey
export const selectUseMockData = (state: { settings: SettingsState }) => state.settings.useMockData
export const selectRegionCode = (state: { settings: SettingsState }) => state.settings.regionCode
export const selectLanguage = (state: { settings: SettingsState }) => state.settings.language
export const selectTmdbApiKey = (state: { settings: SettingsState }) => state.settings.tmdbApiKey
export const selectShowUpcomingReleases = (state: { settings: SettingsState }) => state.settings.showUpcomingReleases
export const selectHianimeApiKey = (state: { settings: SettingsState }) => state.settings.hianimeApiKey
export const selectTorrentApiUrl = (state: { settings: SettingsState }) => state.settings.torrentApiUrl

export default settingsSlice.reducer

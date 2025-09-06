import { store } from '../store'
import { selectYoutubeApiKey, selectUseMockData } from '../store/slices/settingsSlice'

export const getApiConfig = () => {
  const state = store.getState()
  const uiApiKey = selectYoutubeApiKey(state)
  const useMockData = selectUseMockData(state)
  
  // Priority: UI API key > Environment API key
  const apiKey = uiApiKey || import.meta.env.VITE_YT_API_KEY
  const shouldUseMockData = useMockData || !apiKey || apiKey === 'your_youtube_api_key_here'
  
  // Debug logging
  console.log('API Config Debug:', {
    uiApiKey,
    envApiKey: import.meta.env.VITE_YT_API_KEY,
    finalApiKey: apiKey,
    useMockData,
    shouldUseMockData
  })
  
  return {
    apiKey,
    useMockData: shouldUseMockData,
    regionCode: import.meta.env.VITE_REGION || 'US',
    language: import.meta.env.VITE_LANG || 'en',
  }
}

export const createApiInstance = () => {
  const config = getApiConfig()
  
  return {
    baseURL: 'https://www.googleapis.com/youtube/v3',
    params: {
      key: config.apiKey,
      regionCode: config.regionCode,
      hl: config.language,
    },
    useMockData: config.useMockData,
  }
}

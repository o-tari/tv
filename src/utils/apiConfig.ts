import { store } from '../store'
import { selectYoutubeApiKey, selectUseMockData, selectRegionCode, selectLanguage } from '../store/slices/settingsSlice'

export const getApiConfig = () => {
  const state = store.getState()
  const apiKey = selectYoutubeApiKey(state)
  const useMockData = selectUseMockData(state)
  const regionCode = selectRegionCode(state)
  const language = selectLanguage(state)
  
  // New logic: if mock data is checked, always use mock data
  // If unchecked, never use mock data (make real API requests)
  const shouldUseMockData = useMockData
  
  return {
    apiKey,
    useMockData: shouldUseMockData,
    regionCode,
    language,
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

import { useState, useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '../store'
import { selectYoutubeApiKey, selectUseMockData, selectRegionCode, selectLanguage, selectTmdbApiKey, selectShowUpcomingReleases, selectHianimeApiKey, setYoutubeApiKey, setUseMockData, setRegionCode, setLanguage, setTmdbApiKey, setShowUpcomingReleases, setHianimeApiKey, resetSettings } from '../store/slices/settingsSlice'
import { clearAllData } from '../store/slices/videosSlice'
import { useTheme } from '../app/providers/ThemeProvider'
import { localStorageCache } from '../utils/localStorageCache'

const SettingsPage = () => {
  const dispatch = useAppDispatch()
  const { theme, toggleTheme } = useTheme()
  const youtubeApiKey = useAppSelector(selectYoutubeApiKey)
  const useMockData = useAppSelector(selectUseMockData)
  const regionCode = useAppSelector(selectRegionCode)
  const language = useAppSelector(selectLanguage)
  const tmdbApiKey = useAppSelector(selectTmdbApiKey)
  const showUpcomingReleases = useAppSelector(selectShowUpcomingReleases)
  const hianimeApiKey = useAppSelector(selectHianimeApiKey)
  
  const [localApiKey, setLocalApiKey] = useState(youtubeApiKey)
  const [localUseMockData, setLocalUseMockData] = useState(useMockData)
  const [localRegionCode, setLocalRegionCode] = useState(regionCode)
  const [localLanguage, setLocalLanguage] = useState(language)
  const [localTmdbApiKey, setLocalTmdbApiKey] = useState(tmdbApiKey)
  const [localShowUpcomingReleases, setLocalShowUpcomingReleases] = useState(showUpcomingReleases)
  const [localHianimeApiKey, setLocalHianimeApiKey] = useState(hianimeApiKey)
  const [showApiKey, setShowApiKey] = useState(false)
  const [showTmdbApiKey, setShowTmdbApiKey] = useState(false)
  const [showHianimeApiKey, setShowHianimeApiKey] = useState(false)
  
  // Cache management state
  const [cacheStats, setCacheStats] = useState({
    totalEntries: 0,
    expiredEntries: 0,
    videoEntries: 0,
    totalSize: '0 MB'
  })
  const [isClearingCache, setIsClearingCache] = useState(false)

  // Load cache stats on component mount
  useEffect(() => {
    updateCacheStats()
  }, [])

  const updateCacheStats = () => {
    const stats = localStorageCache.getStats()
    setCacheStats(stats)
  }

  const handleClearCache = async () => {
    if (window.confirm('Are you sure you want to clear all cached data? This will require re-fetching all data from the API.')) {
      setIsClearingCache(true)
      try {
        localStorageCache.clear()
        updateCacheStats()
        // Also clear Redux cache
        dispatch(clearAllData())
        alert('Cache cleared successfully!')
      } catch (error) {
        console.error('Failed to clear cache:', error)
        alert('Failed to clear cache. Please try again.')
      } finally {
        setIsClearingCache(false)
      }
    }
  }

  const handleClearExpiredCache = () => {
    localStorageCache.clearExpired()
    updateCacheStats()
    alert('Expired cache entries cleared!')
  }

  const handleSave = () => {
    dispatch(setYoutubeApiKey(localApiKey))
    dispatch(setUseMockData(localUseMockData))
    dispatch(setRegionCode(localRegionCode))
    dispatch(setLanguage(localLanguage))
    dispatch(setTmdbApiKey(localTmdbApiKey))
    dispatch(setShowUpcomingReleases(localShowUpcomingReleases))
    dispatch(setHianimeApiKey(localHianimeApiKey))
    // Clear all cached data so it will be refetched with new settings
    dispatch(clearAllData())
  }

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all settings?')) {
      dispatch(resetSettings())
      setLocalApiKey('')
      setLocalUseMockData(false)
      setLocalRegionCode('US')
      setLocalLanguage('en')
      setLocalTmdbApiKey('')
      setLocalShowUpcomingReleases(true)
      setLocalHianimeApiKey('')
    }
  }

  const handleCancel = () => {
    setLocalApiKey(youtubeApiKey)
    setLocalUseMockData(useMockData)
    setLocalRegionCode(regionCode)
    setLocalLanguage(language)
    setLocalTmdbApiKey(tmdbApiKey)
    setLocalShowUpcomingReleases(showUpcomingReleases)
    setLocalHianimeApiKey(hianimeApiKey)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Configure your application preferences and API settings
          </p>
        </div>

        {/* Settings Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <div className="space-y-8">
              {/* Theme Selection */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Theme
                </label>
                <div className="flex space-x-4">
                  <button
                    onClick={() => theme !== 'light' && toggleTheme()}
                    className={`flex items-center px-6 py-3 rounded-lg border-2 transition-all ${
                      theme === 'light'
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 shadow-sm'
                        : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                  >
                    <span className="mr-3 text-xl">☀️</span>
                    <span className="font-medium">Light mode</span>
                  </button>
                  <button
                    onClick={() => theme !== 'dark' && toggleTheme()}
                    className={`flex items-center px-6 py-3 rounded-lg border-2 transition-all ${
                      theme === 'dark'
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 shadow-sm'
                        : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                  >
                    <span className="mr-3 text-xl">🌙</span>
                    <span className="font-medium">Dark mode</span>
                  </button>
                </div>
              </div>

              {/* YouTube API Key */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  YouTube API Key
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={localApiKey}
                    onChange={(e) => setLocalApiKey(e.target.value)}
                    placeholder="Enter your YouTube API key"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-base"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                  >
                    {showApiKey ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Get your API key from the Google Cloud Console
                </p>
              </div>


              {/* Region Code */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Region Code
                </label>
                <input
                  type="text"
                  value={localRegionCode}
                  onChange={(e) => setLocalRegionCode(e.target.value.toUpperCase())}
                  placeholder="US"
                  maxLength={2}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-base"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Two-letter country code for YouTube API region (e.g., US, GB, JP)
                </p>
              </div>

              {/* Language */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Language
                </label>
                <input
                  type="text"
                  value={localLanguage}
                  onChange={(e) => setLocalLanguage(e.target.value.toLowerCase())}
                  placeholder="en"
                  maxLength={2}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-base"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Two-letter language code for YouTube API language (e.g., en, es, fr)
                </p>
              </div>

              {/* TMDB API Key */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  TMDB API Key
                </label>
                <div className="relative">
                  <input
                    type={showTmdbApiKey ? 'text' : 'password'}
                    value={localTmdbApiKey}
                    onChange={(e) => setLocalTmdbApiKey(e.target.value)}
                    placeholder="Enter your TMDB API key"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-base"
                  />
                  <button
                    type="button"
                    onClick={() => setShowTmdbApiKey(!showTmdbApiKey)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                  >
                    {showTmdbApiKey ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Get your API key from the TMDB website
                </p>
              </div>

              {/* HiAnime API Key */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  HiAnime API Key
                </label>
                <div className="relative">
                  <input
                    type={showHianimeApiKey ? 'text' : 'password'}
                    value={localHianimeApiKey}
                    onChange={(e) => setLocalHianimeApiKey(e.target.value)}
                    placeholder="Enter your HiAnime API key"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-base"
                  />
                  <button
                    type="button"
                    onClick={() => setShowHianimeApiKey(!showHianimeApiKey)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                  >
                    {showHianimeApiKey ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Get your API key from RapidAPI HiAnime
                </p>
              </div>

              {/* Use Mock Data */}
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={localUseMockData}
                    onChange={(e) => setLocalUseMockData(e.target.checked)}
                    className="h-5 w-5 text-red-600 focus:ring-red-500 border-gray-300 rounded mt-1"
                  />
                  <div className="ml-3">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      Use mock data (for testing)
                    </span>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      When enabled, the app will always use mock data instead of making real API requests. 
                      When disabled, the app will make real API requests like in production.
                    </p>
                  </div>
                </label>
              </div>

              {/* Show Upcoming Releases */}
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={localShowUpcomingReleases}
                    onChange={(e) => setLocalShowUpcomingReleases(e.target.checked)}
                    className="h-5 w-5 text-red-600 focus:ring-red-500 border-gray-300 rounded mt-1"
                  />
                  <div className="ml-3">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      Show upcoming releases
                    </span>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      When enabled, movies and TV shows will display upcoming releases. 
                      When disabled, only released content will be shown.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Cache Management Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Cache Management
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Manage local storage cache for improved performance and offline access.
              </p>
            </div>
            
            <div className="px-6 py-4">
              {/* Cache Statistics */}
              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                  Cache Statistics
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {cacheStats.totalEntries}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Total Entries
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {cacheStats.videoEntries}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Video Entries
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {cacheStats.expiredEntries}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Expired Entries
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {cacheStats.totalSize}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Cache Size
                    </div>
                  </div>
                </div>
              </div>

              {/* Cache Actions */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleClearExpiredCache}
                    className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Clear Expired Cache
                  </button>
                  <button
                    onClick={updateCacheStats}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Refresh Stats
                  </button>
                </div>
                
                <button
                  onClick={handleClearCache}
                  disabled={isClearingCache}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  {isClearingCache ? 'Clearing Cache...' : 'Clear All Cache'}
                </button>
                
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Cache expires after 24 hours. Clearing cache will require re-fetching all data from the API.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700 rounded-b-lg">
            <div className="flex space-x-4">
              <button
                onClick={handleSave}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Save Settings
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>

            {/* Reset Button */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              <button
                onClick={handleReset}
                className="w-full text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium py-2 px-4 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                Reset All Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage

import { useState, useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '../store'
import { selectYoutubeApiKey, selectUseMockData, selectRegionCode, selectLanguage, selectTmdbApiKey, selectShowUpcomingReleases, selectHianimeApiKey, selectTorrentApiUrl, setYoutubeApiKey, setUseMockData, setRegionCode, setLanguage, setTmdbApiKey, setShowUpcomingReleases, setHianimeApiKey, setTorrentApiUrl, resetSettings } from '../store/slices/settingsSlice'
import { clearAllData } from '../store/slices/videosSlice'
import { useTheme } from '../app/providers/ThemeProvider'
import { localStorageCache } from '../utils/localStorageCache'
import { selectSavedChannels, addChannel } from '../store/slices/channelsSlice'
import type { Channel } from '../types/youtube'

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
  const torrentApiUrl = useAppSelector(selectTorrentApiUrl)
  const savedChannels = useAppSelector(selectSavedChannels)
  
  const [localApiKey, setLocalApiKey] = useState(youtubeApiKey)
  const [localUseMockData, setLocalUseMockData] = useState(useMockData)
  const [localRegionCode, setLocalRegionCode] = useState(regionCode)
  const [localLanguage, setLocalLanguage] = useState(language)
  const [localTmdbApiKey, setLocalTmdbApiKey] = useState(tmdbApiKey)
  const [localShowUpcomingReleases, setLocalShowUpcomingReleases] = useState(showUpcomingReleases)
  const [localHianimeApiKey, setLocalHianimeApiKey] = useState(hianimeApiKey)
  const [localTorrentApiUrl, setLocalTorrentApiUrl] = useState(torrentApiUrl)
  const [showApiKey, setShowApiKey] = useState(false)
  const [showTmdbApiKey, setShowTmdbApiKey] = useState(false)
  const [showHianimeApiKey, setShowHianimeApiKey] = useState(false)
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'general' | 'import-export'>('general')
  
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
    dispatch(setTorrentApiUrl(localTorrentApiUrl))
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
      setLocalTorrentApiUrl('')
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
    setLocalTorrentApiUrl(torrentApiUrl)
  }

  // Import/Export functions
  const exportSettings = () => {
    const settings = {
      youtubeApiKey,
      useMockData,
      regionCode,
      language,
      tmdbApiKey,
      showUpcomingReleases,
      hianimeApiKey,
      torrentApiUrl
    }
    
    const dataStr = JSON.stringify(settings, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = 'tv-settings.json'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const settings = JSON.parse(e.target?.result as string)
        
        // Validate settings structure
        if (typeof settings === 'object' && settings !== null) {
          if (settings.youtubeApiKey !== undefined) setLocalApiKey(settings.youtubeApiKey)
          if (settings.useMockData !== undefined) setLocalUseMockData(settings.useMockData)
          if (settings.regionCode !== undefined) setLocalRegionCode(settings.regionCode)
          if (settings.language !== undefined) setLocalLanguage(settings.language)
          if (settings.tmdbApiKey !== undefined) setLocalTmdbApiKey(settings.tmdbApiKey)
          if (settings.showUpcomingReleases !== undefined) setLocalShowUpcomingReleases(settings.showUpcomingReleases)
          if (settings.hianimeApiKey !== undefined) setLocalHianimeApiKey(settings.hianimeApiKey)
          if (settings.torrentApiUrl !== undefined) setLocalTorrentApiUrl(settings.torrentApiUrl)
          
          alert('Settings imported successfully! Click "Save Settings" to apply them.')
        } else {
          alert('Invalid settings file format.')
        }
      } catch (error) {
        alert('Error parsing settings file. Please make sure it\'s a valid JSON file.')
      }
    }
    reader.readAsText(file)
    
    // Reset file input
    event.target.value = ''
  }

  const exportChannels = () => {
    const csvContent = [
      'Channel Id,Channel Url,Channel Title',
      ...savedChannels.map(channel => 
        `${channel.id},https://www.youtube.com/channel/${channel.id},"${channel.title}"`
      )
    ].join('\n')
    
    const dataBlob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = 'youtube-channels.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const importChannels = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const csvText = e.target?.result as string
        const lines = csvText.split('\n').filter(line => line.trim())
        
        if (lines.length < 2) {
          alert('CSV file must contain at least a header row and one data row.')
          return
        }

        // Skip header row
        const dataLines = lines.slice(1)
        const channels: Channel[] = []
        
        for (const line of dataLines) {
          const [channelId, , channelTitle] = line.split(',').map(field => field.trim().replace(/"/g, ''))
          
          if (channelId && channelTitle) {
            channels.push({
              id: channelId,
              title: channelTitle,
              description: '',
              thumbnail: '',
              subscriberCount: '0',
              videoCount: '0',
              viewCount: '0'
            })
          }
        }
        
        if (channels.length === 0) {
          alert('No valid channels found in the CSV file.')
          return
        }
        
        // Add channels to store
        channels.forEach(channel => {
          dispatch(addChannel(channel))
        })
        
        alert(`Successfully imported ${channels.length} channels!`)
      } catch (error) {
        alert('Error parsing CSV file. Please make sure it\'s in the correct format.')
      }
    }
    reader.readAsText(file)
    
    // Reset file input
    event.target.value = ''
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

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('general')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'general'
                    ? 'border-red-500 text-red-600 dark:text-red-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                General
              </button>
              <button
                onClick={() => setActiveTab('import-export')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'import-export'
                    ? 'border-red-500 text-red-600 dark:text-red-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Import / Export
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'general' && (
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

              {/* Torrent API URL */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Torrent API URL
                </label>
                <input
                  type="url"
                  value={localTorrentApiUrl}
                  onChange={(e) => setLocalTorrentApiUrl(e.target.value)}
                  placeholder="https://torrent-api-py-nx0x.onrender.com"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-base"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Base URL for the torrent search API. Leave empty to disable torrent search functionality.
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
        )}

        {/* Import/Export Tab */}
        {activeTab === 'import-export' && (
          <div className="space-y-6">
            {/* Settings Import/Export */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Settings Import / Export
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Import or export your application settings as a JSON file.
                </p>
              </div>
              
              <div className="px-6 py-4">
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={exportSettings}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      Export Settings
                    </button>
                    <label className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors cursor-pointer text-center">
                      Import Settings
                      <input
                        type="file"
                        accept=".json"
                        onChange={importSettings}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Settings will be exported as a JSON file. When importing, make sure to click "Save Settings" to apply the imported settings.
                  </p>
                </div>
              </div>
            </div>

            {/* YouTube Channels Import/Export */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  YouTube Channels Import / Export
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Import or export your saved YouTube channels as a CSV file.
                </p>
              </div>
              
              <div className="px-6 py-4">
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={exportChannels}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      Export Channels ({savedChannels.length})
                    </button>
                    <label className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors cursor-pointer text-center">
                      Import Channels
                      <input
                        type="file"
                        accept=".csv"
                        onChange={importChannels}
                        className="hidden"
                      />
                    </label>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      CSV Format
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      The CSV file should have the following format:
                    </p>
                    <div className="bg-gray-100 dark:bg-gray-600 rounded p-2 font-mono text-xs">
                      Channel Id,Channel Url,Channel Title<br/>
                      UC1XvxnHFtWruS9egyFasP1Q,http://www.youtube.com/channel/UC1XvxnHFtWruS9egyFasP1Q,"What about it!?"<br/>
                      UC28n0tlcNSa1iPe5mettocg,http://www.youtube.com/channel/UC28n0tlcNSa1iPe5mettocg,"voidzilla"
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Currently saved: {savedChannels.length} channels. Imported channels will be added to your existing collection.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SettingsPage

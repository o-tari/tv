import { useState } from 'react'
import { useAppSelector, useAppDispatch } from '../store'
import { selectYoutubeApiKey, selectUseMockData, selectRegionCode, selectLanguage, selectHianimeApiKey, selectTorrentApiUrl, setYoutubeApiKey, setUseMockData, setRegionCode, setLanguage, setHianimeApiKey, setTorrentApiUrl, resetSettings } from '../store/slices/settingsSlice'
import { clearAllData } from '../store/slices/videosSlice'
import { useTheme } from '../app/providers/ThemeProvider'

interface SettingsProps {
  isOpen: boolean
  onClose: () => void
}

const Settings = ({ isOpen, onClose }: SettingsProps) => {
  const dispatch = useAppDispatch()
  const { theme, toggleTheme } = useTheme()
  const youtubeApiKey = useAppSelector(selectYoutubeApiKey)
  const useMockData = useAppSelector(selectUseMockData)
  const regionCode = useAppSelector(selectRegionCode)
  const language = useAppSelector(selectLanguage)
  const hianimeApiKey = useAppSelector(selectHianimeApiKey)
  const torrentApiUrl = useAppSelector(selectTorrentApiUrl)
  
  const [localApiKey, setLocalApiKey] = useState(youtubeApiKey)
  const [localUseMockData, setLocalUseMockData] = useState(useMockData)
  const [localRegionCode, setLocalRegionCode] = useState(regionCode)
  const [localLanguage, setLocalLanguage] = useState(language)
  const [localHianimeApiKey, setLocalHianimeApiKey] = useState(hianimeApiKey)
  const [localTorrentApiUrl, setLocalTorrentApiUrl] = useState(torrentApiUrl)
  const [showApiKey, setShowApiKey] = useState(false)
  const [showHianimeApiKey, setShowHianimeApiKey] = useState(false)

  const handleSave = () => {
    dispatch(setYoutubeApiKey(localApiKey))
    dispatch(setUseMockData(localUseMockData))
    dispatch(setRegionCode(localRegionCode))
    dispatch(setLanguage(localLanguage))
    dispatch(setHianimeApiKey(localHianimeApiKey))
    dispatch(setTorrentApiUrl(localTorrentApiUrl))
    // Clear all cached data so it will be refetched with new settings
    dispatch(clearAllData())
    onClose()
  }

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all settings?')) {
      dispatch(resetSettings())
      setLocalApiKey('')
      setLocalUseMockData(false)
      setLocalRegionCode('US')
      setLocalLanguage('en')
      setLocalHianimeApiKey('')
      setLocalTorrentApiUrl('https://torrent-api-py-nx0x.onrender.com')
    }
  }

  const handleCancel = () => {
    setLocalApiKey(youtubeApiKey)
    setLocalUseMockData(useMockData)
    setLocalRegionCode(regionCode)
    setLocalLanguage(language)
    setLocalHianimeApiKey(hianimeApiKey)
    setLocalTorrentApiUrl(torrentApiUrl)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Settings
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Close settings"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Theme Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Theme
            </label>
            <div className="flex space-x-4">
              <button
                onClick={() => theme !== 'light' && toggleTheme()}
                className={`flex items-center px-4 py-2 rounded-md border transition-colors ${
                  theme === 'light'
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                    : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <span className="mr-2">☀️</span>
                Light mode
              </button>
              <button
                onClick={() => theme !== 'dark' && toggleTheme()}
                className={`flex items-center px-4 py-2 rounded-md border transition-colors ${
                  theme === 'dark'
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                    : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <span className="mr-2">🌙</span>
                Dark mode
              </button>
            </div>
          </div>

          {/* YouTube API Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              YouTube API Key
            </label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={localApiKey}
                onChange={(e) => setLocalApiKey(e.target.value)}
                placeholder="Enter your YouTube API key"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-2 top-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showApiKey ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Get your API key from the Google Cloud Console
            </p>
          </div>


          {/* Region Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Region Code
            </label>
            <input
              type="text"
              value={localRegionCode}
              onChange={(e) => setLocalRegionCode(e.target.value.toUpperCase())}
              placeholder="US"
              maxLength={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Two-letter country code for YouTube API region (e.g., US, GB, JP)
            </p>
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Language
            </label>
            <input
              type="text"
              value={localLanguage}
              onChange={(e) => setLocalLanguage(e.target.value.toLowerCase())}
              placeholder="en"
              maxLength={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Two-letter language code for YouTube API language (e.g., en, es, fr)
            </p>
          </div>

          {/* HiAnime API Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              HiAnime API Key
            </label>
            <div className="relative">
              <input
                type={showHianimeApiKey ? 'text' : 'password'}
                value={localHianimeApiKey}
                onChange={(e) => setLocalHianimeApiKey(e.target.value)}
                placeholder="Enter your HiAnime API key"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
              <button
                type="button"
                onClick={() => setShowHianimeApiKey(!showHianimeApiKey)}
                className="absolute right-2 top-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showHianimeApiKey ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Get your API key from RapidAPI HiAnime
            </p>
          </div>

          {/* Torrent API URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Torrent API URL
            </label>
            <input
              type="text"
              value={localTorrentApiUrl}
              onChange={(e) => setLocalTorrentApiUrl(e.target.value)}
              placeholder="https://torrent-api-py-nx0x.onrender.com"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Base URL for the torrent search API
            </p>
          </div>

          {/* Use Mock Data */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={localUseMockData}
                onChange={(e) => setLocalUseMockData(e.target.checked)}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Use mock data (for testing)
              </span>
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              When enabled, the app will always use mock data instead of making real API requests. 
              When disabled, the app will make real API requests like in production.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              onClick={handleSave}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-md transition-colors"
            >
              Cancel
            </button>
          </div>

          {/* Reset Button */}
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleReset}
              className="w-full text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium py-2 px-4 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              Reset All Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings

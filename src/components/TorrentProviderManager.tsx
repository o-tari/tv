import { useState, useEffect } from 'react'
import { 
  getProviders, 
  getActiveProviders, 
  enableProvider, 
  disableProvider,
  enableAllPublicProviders,
  disableAllProviders,
  isProviderActive
} from '../services/torrentSearch'
import { type TorrentProvider } from '../types/torrent'

interface TorrentProviderManagerProps {
  onProviderChange?: () => void
}

const TorrentProviderManager = ({ onProviderChange }: TorrentProviderManagerProps) => {
  const [providers, setProviders] = useState<TorrentProvider[]>([])
  const [activeProviders, setActiveProviders] = useState<TorrentProvider[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadProviders()
  }, [])

  const loadProviders = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const allProviders = getProviders()
      const active = getActiveProviders()
      setProviders(allProviders)
      setActiveProviders(active)
    } catch (err) {
      setError('Failed to load providers')
      console.error('Error loading providers:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleProvider = async (provider: TorrentProvider) => {
    setLoading(true)
    setError(null)
    
    try {
      const isActive = isProviderActive(provider.name)
      
      if (isActive) {
        const success = disableProvider(provider.name)
        if (success) {
          setActiveProviders(prev => prev.filter(p => p.name !== provider.name))
        }
      } else {
        const success = enableProvider(provider.name)
        if (success) {
          setActiveProviders(prev => [...prev, provider])
        }
      }
      
      onProviderChange?.()
    } catch (err) {
      setError(`Failed to toggle provider ${provider.name}`)
      console.error('Error toggling provider:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleEnableAllPublic = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const success = enableAllPublicProviders()
      if (success) {
        const active = getActiveProviders()
        setActiveProviders(active)
        onProviderChange?.()
      }
    } catch (err) {
      setError('Failed to enable all public providers')
      console.error('Error enabling all public providers:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDisableAll = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const success = disableAllProviders()
      if (success) {
        setActiveProviders([])
        onProviderChange?.()
      }
    } catch (err) {
      setError('Failed to disable all providers')
      console.error('Error disabling all providers:', err)
    } finally {
      setLoading(false)
    }
  }

  const isProviderEnabled = (providerName: string) => {
    return activeProviders.some(p => p.name === providerName)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Torrent Providers
        </h3>
        <div className="flex gap-2">
          <button
            onClick={handleEnableAllPublic}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-sm font-medium py-1 px-3 rounded-md transition-colors"
          >
            Enable All Public
          </button>
          <button
            onClick={handleDisableAll}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white text-sm font-medium py-1 px-3 rounded-md transition-colors"
          >
            Disable All
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 p-3 mb-4">
          <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      )}

      <div className="space-y-3">
        {providers.map((provider) => (
          <div
            key={provider.name}
            className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {provider.name}
                </h4>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    provider.public
                      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                      : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                  }`}
                >
                  {provider.public ? 'Public' : 'Private'}
                </span>
                {isProviderEnabled(provider.name) && (
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                    Active
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Categories: {provider.categories.join(', ')}
              </p>
            </div>
            
            <button
              onClick={() => handleToggleProvider(provider)}
              disabled={loading}
              className={`ml-4 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                isProviderEnabled(provider.name)
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              } disabled:bg-gray-400`}
            >
              {isProviderEnabled(provider.name) ? 'Disable' : 'Enable'}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <p>
          <strong>Active Providers:</strong> {activeProviders.length} of {providers.length}
        </p>
        <p className="mt-1">
          Public providers are free to use. Private providers may require authentication.
        </p>
      </div>
    </div>
  )
}

export default TorrentProviderManager

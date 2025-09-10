import { useState, useEffect } from 'react'
import { 
  searchTorrents, 
  getActiveProviders, 
  getMagnetUrl, 
  getPopularCategories,
  torrentSearchService
} from '../services/torrentSearch'
import { type Torrent, type TorrentSearchParams, type ApiTorrentSearchResponse } from '../types/torrent'
import LoadingSpinner from '../components/LoadingSpinner'
import TorrentProviderManager from '../components/TorrentProviderManager'
import { useAppSelector } from '../store'
import { selectUseMockData, selectTorrentApiUrl } from '../store/slices/settingsSlice'

// Torrent sites configuration
const TORRENT_SITES = [
  { id: 'piratebay', name: 'PirateBay', url: 'https://thepiratebay10.org', status: '❌' },
  { id: '1337x', name: '1337x', url: 'https://1337x.to', status: '❌' },
  { id: 'tgx', name: 'Torrent Galaxy', url: 'https://torrentgalaxy.to', status: '❌' },
  { id: 'torlock', name: 'Torlock', url: 'https://www.torlock.com', status: '❌' },
  { id: 'nyaasi', name: 'Nyaasi', url: 'https://nyaa.si', status: '❌' },
  { id: 'zooqle', name: 'Zooqle', url: 'https://zooqle.com', status: '❌' },
  { id: 'kickass', name: 'KickAss', url: 'https://kickasstorrents.to', status: '❌' },
  { id: 'bitsearch', name: 'Bitsearch', url: 'https://bitsearch.to', status: '❌' },
  { id: 'magnetdl', name: 'MagnetDL', url: 'https://www.magnetdl.com', status: '✅' },
  { id: 'libgen', name: 'Libgen', url: 'https://libgen.is', status: '❌' },
  { id: 'yts', name: 'YTS', url: 'https://yts.mx', status: '❌' },
  { id: 'limetorrent', name: 'Limetorrent', url: 'https://www.limetorrents.pro', status: '❌' },
  { id: 'torrentfunk', name: 'TorrentFunk', url: 'https://www.torrentfunk.com', status: '❌' },
  { id: 'glodls', name: 'Glodls', url: 'https://glodls.to', status: '❌' },
  { id: 'torrentproject', name: 'TorrentProject', url: 'https://torrentproject2.com', status: '❌' },
  { id: 'ybt', name: 'YourBittorrent', url: 'https://yourbittorrent.com', status: '❌' }
]

const TorrentSearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedProvider, setSelectedProvider] = useState('')
  const [selectedSite, setSelectedSite] = useState('piratebay')
  const [torrents, setTorrents] = useState<Torrent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [providers, setProviders] = useState<string[]>([])
  const [categories] = useState(getPopularCategories())
  const [showProviderManager, setShowProviderManager] = useState(false)
  const useMockData = useAppSelector(selectUseMockData)
  const torrentApiUrl = useAppSelector(selectTorrentApiUrl)

  useEffect(() => {
    // Load active providers
    const activeProviders = getActiveProviders()
    setProviders(activeProviders.map(p => p.name))
  }, [])

  const refreshProviders = () => {
    const activeProviders = getActiveProviders()
    setProviders(activeProviders.map(p => p.name))
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setLoading(true)
    setError(null)

    try {
      if (useMockData) {
        // Use the old mock data approach
        const params: TorrentSearchParams = {
          query: searchQuery.trim(),
          category: selectedCategory === 'All' ? undefined : selectedCategory,
          limit: 50,
          providers: selectedProvider ? [selectedProvider] : undefined
        }

        const result = await searchTorrents(params)
        setTorrents(result.torrents)
      } else {
        // Use the new API-based approach
        torrentSearchService.setBaseUrl(torrentApiUrl)
        const response: ApiTorrentSearchResponse = await torrentSearchService.searchTorrents({
          site: selectedSite,
          query: searchQuery.trim()
        })

        // Convert API response to Torrent format
        const convertedTorrents: Torrent[] = response.data.map((item, index) => ({
          id: `${selectedSite}-${index}-${Date.now()}`,
          title: item.name,
          provider: selectedSite,
          time: item.date,
          size: item.size,
          seeds: parseInt(item.seeders) || 0,
          peers: parseInt(item.leechers) || 0,
          magnet: item.magnet,
          category: item.category,
          url: item.url,
          infoHash: item.hash,
          uploader: item.uploader
        }))

        setTorrents(convertedTorrents)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search torrents. Please try again.'
      setError(errorMessage)
      console.error('Search error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleMagnetClick = async (torrent: Torrent) => {
    try {
      if (useMockData) {
        const magnetUrl = await getMagnetUrl(torrent)
        if (magnetUrl) {
          // Copy to clipboard
          await navigator.clipboard.writeText(magnetUrl)
          alert('Magnet link copied to clipboard!')
        } else {
          alert('Failed to get magnet link')
        }
      } else {
        // For API mode, use the magnet URL directly from the torrent
        if (torrent.magnet) {
          await navigator.clipboard.writeText(torrent.magnet)
          alert('Magnet link copied to clipboard!')
        } else {
          alert('No magnet link available for this torrent')
        }
      }
    } catch (err) {
      console.error('Error getting magnet:', err)
      alert('Failed to get magnet link')
    }
  }

  const formatFileSize = (size: string): string => {
    if (!size || size === 'Unknown') return 'Unknown'
    return size
  }

  const formatSeeds = (seeds: number): string => {
    if (seeds >= 1000) {
      return `${(seeds / 1000).toFixed(1)}K`
    }
    return seeds.toString()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Torrent Search
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Search torrents across multiple providers
              </p>
            </div>
            <button
              onClick={() => setShowProviderManager(true)}
              className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Manage Providers
            </button>
          </div>
          {useMockData ? (
            <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Demo Mode:</strong> This is a demonstration using mock data. In a production app, 
                you would integrate with actual torrent search APIs or implement web scraping for real torrent sites.
              </p>
            </div>
          ) : (
            <div className="mt-4 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-400 p-4">
              <p className="text-sm text-green-700 dark:text-green-300">
                <strong>API Mode:</strong> Using real torrent search API at <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">{torrentApiUrl}</code>. 
                Select a torrent site from the dropdown above to search.
              </p>
            </div>
          )}
        </div>

        {/* Search Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search Query
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter search terms..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Site Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Torrent Site
              </label>
              <select
                value={selectedSite}
                onChange={(e) => setSelectedSite(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {TORRENT_SITES.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name} {site.status}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Select - Only show in mock data mode */}
            {useMockData && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Provider Select - Only show in mock data mode */}
            {useMockData && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Provider
                </label>
                <select
                  value={selectedProvider}
                  onChange={(e) => setSelectedProvider(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Providers</option>
                  {providers.map((provider) => (
                    <option key={provider} value={provider}>
                      {provider}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Search Button */}
          <div className="mt-4">
            <button
              onClick={handleSearch}
              disabled={loading || !searchQuery.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-6 rounded-md transition-colors"
            >
              {loading ? 'Searching...' : 'Search Torrents'}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 p-4 mb-6">
            <p className="text-red-700 dark:text-red-300">{error}</p>
            {error.includes('API endpoint') && (
              <div className="mt-2">
                <a
                  href="/settings"
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                >
                  Open Settings
                </a>
              </div>
            )}
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        )}

        {/* Results */}
        {!loading && torrents.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Search Results ({torrents.length})
              </h2>
            </div>

            <div className="space-y-3">
              {torrents.map((torrent) => (
                <div
                  key={torrent.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 line-clamp-2">
                        {torrent.title}
                      </h3>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8z" clipRule="evenodd" />
                          </svg>
                          {torrent.provider}
                        </span>
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
                          </svg>
                          {formatFileSize(torrent.size)}
                        </span>
                        <span className="flex items-center text-green-600 dark:text-green-400">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          {formatSeeds(torrent.seeds)} seeds
                        </span>
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          {torrent.time}
                        </span>
                      </div>

                      {torrent.category && (
                        <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full">
                          {torrent.category}
                        </span>
                      )}
                    </div>

                    <div className="ml-4 flex flex-col gap-2">
                      <button
                        onClick={() => handleMagnetClick(torrent)}
                        className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors"
                      >
                        Copy Magnet
                      </button>
                      {torrent.url && (
                        <a
                          href={torrent.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors text-center"
                        >
                          View Details
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {!loading && torrents.length === 0 && searchQuery && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No torrents found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {useMockData 
                ? 'Try adjusting your search terms or category.'
                : 'Try adjusting your search terms or selecting a different torrent site.'
              }
            </p>
          </div>
        )}

        {/* Empty State */}
        {!loading && torrents.length === 0 && !searchQuery && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Search for torrents</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Enter a search term above to find torrents across multiple providers.
            </p>
          </div>
        )}

        {/* Provider Manager Modal */}
        {showProviderManager && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Torrent Provider Manager
                  </h2>
                  <button
                    onClick={() => setShowProviderManager(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <TorrentProviderManager onProviderChange={refreshProviders} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TorrentSearchPage

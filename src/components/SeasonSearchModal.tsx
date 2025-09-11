import { useState, useEffect } from 'react'
import { useAppSelector } from '../store'
import { selectIsTorrentEndpointConfigured } from '../store/slices/settingsSlice'
import { torrentSearchService } from '../services/torrentSearch'
import { type ApiTorrentSearchResponse } from '../types/torrent'
import TorrentsTable from './TorrentsTable'
import LoadingSpinner from './LoadingSpinner'

interface SeasonSearchModalProps {
  isOpen: boolean
  onClose: () => void
  showTitle: string
  seasonNumber: number
}

const SeasonSearchModal = ({ isOpen, onClose, showTitle, seasonNumber }: SeasonSearchModalProps) => {
  const isTorrentEndpointConfigured = useAppSelector(selectIsTorrentEndpointConfigured)
  const [searchResults, setSearchResults] = useState<ApiTorrentSearchResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && showTitle && seasonNumber) {
      searchForSeasonTorrents()
    }
  }, [isOpen, showTitle, seasonNumber])

  const searchForSeasonTorrents = async () => {
    if (!isTorrentEndpointConfigured) {
      setError('Torrent search endpoint not configured. Please configure it in settings.')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      console.log('🔍 Searching for season torrents:', {
        show: showTitle,
        season: seasonNumber
      })

      // Create search query for the season
      const seasonStr = seasonNumber.toString().padStart(2, '0')
      const searchQuery = `${showTitle} s${seasonStr}`
      
      console.log('🔍 Season search query:', searchQuery)
      
      const results = await torrentSearchService.searchTorrents({
        site: 'piratebay',
        query: searchQuery
      })
      
      console.log('🔍 Season torrent search results:', results)
      setSearchResults(results)
    } catch (error) {
      console.error('❌ Error searching for season torrents:', error)
      setError('Failed to search for torrents')
      setSearchResults(null)
    } finally {
      setLoading(false)
    }
  }

  const handleTorrentSelect = (torrent: any) => {
    console.log('🎬 Season torrent selected:', torrent.name)
    // You can add additional logic here if needed
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Search Results for {showTitle} Season {seasonNumber}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="bg-white dark:bg-gray-800 px-6 py-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner />
                <span className="ml-3 text-gray-600 dark:text-gray-400">
                  Searching for torrents...
                </span>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <div className="text-red-500 mb-4">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-600 dark:text-gray-400">{error}</p>
                <button
                  onClick={searchForSeasonTorrents}
                  className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <div>
                <TorrentsTable 
                  searchResults={searchResults}
                  selectedTorrent={null}
                  onTorrentSelect={handleTorrentSelect}
                />
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3 border-t border-gray-200 dark:border-gray-600">
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SeasonSearchModal

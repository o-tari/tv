import { useState, useCallback } from 'react'
import type { ApiTorrentSearchResponse } from '../types/torrent'
import TorrentQueryInput from './TorrentQueryInput'

interface TorrentsTableProps {
  searchResults: ApiTorrentSearchResponse | null
  selectedTorrent?: { name: string; size: string; seeders: string; leechers: string; category: string; uploader: string; date: string; magnet: string } | null
  onTorrentSelect?: (torrent: { name: string; size: string; seeders: string; leechers: string; category: string; uploader: string; date: string; magnet: string }) => void
  onQueryChange?: (query: string) => void
  currentQuery?: string
  className?: string
}

const TorrentsTable = ({
  searchResults,
  selectedTorrent,
  onTorrentSelect,
  onQueryChange,
  currentQuery = '',
  className = ''
}: TorrentsTableProps) => {
  const [displayedTorrents, setDisplayedTorrents] = useState(10)

  // Handle loading more torrents
  const handleLoadMore = useCallback(() => {
    setDisplayedTorrents(prev => Math.min(prev + 10, searchResults?.data.length || 0))
  }, [searchResults?.data.length])

  // Reset displayed torrents when new search results come in
  useState(() => {
    if (searchResults?.data) {
      setDisplayedTorrents(10)
    }
  })

  if (!searchResults || !searchResults.data || searchResults.data.length === 0) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 ${className}`}>
        {/* Show search input even when there are no results */}
        {onQueryChange && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                No torrents found
              </h3>
              <div className="w-80">
                <TorrentQueryInput
                  initialQuery={currentQuery}
                  onQueryChange={onQueryChange}
                  placeholder="Modify search query..."
                  debounceMs={500}
                />
              </div>
            </div>
          </div>
        )}
        
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.709M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No torrents found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            No torrents were found for this search. Try adjusting your search terms or check back later.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-4 ${className}`}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Found {searchResults.data.length} torrents
        </h3>
        {onQueryChange && (
          <div className="w-80">
            <TorrentQueryInput
              initialQuery={currentQuery}
              onQueryChange={onQueryChange}
              placeholder="Modify search query..."
              debounceMs={500}
            />
          </div>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-2 px-3 font-medium text-gray-900 dark:text-white">Name</th>
              <th className="text-left py-2 px-3 font-medium text-gray-900 dark:text-white">Size</th>
              <th className="text-left py-2 px-3 font-medium text-gray-900 dark:text-white">Seeders</th>
              <th className="text-center py-2 px-3 font-medium text-gray-900 dark:text-white">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {searchResults.data.slice(0, displayedTorrents).map((torrent, index) => (
              <tr
                key={index}
                onClick={() => onTorrentSelect?.(torrent)}
                className={`hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                  selectedTorrent?.magnet === torrent.magnet
                    ? 'bg-green-50 dark:bg-green-900/10'
                    : ''
                }`}
              >
                <td className="py-2 px-3">
                  <div className="font-medium text-gray-900 dark:text-white truncate max-w-xs" title={torrent.name}>
                    {torrent.name}
                  </div>
                </td>
                <td className="py-2 px-3 text-gray-600 dark:text-gray-400">
                  {torrent.size}
                </td>
                <td className="py-2 px-3 text-gray-600 dark:text-gray-400">
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    {torrent.seeders}
                  </span>
                </td>
                <td className="py-2 px-3 text-center">
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(torrent.magnet)
                          alert('Magnet link copied to clipboard!')
                        } catch (err) {
                          console.error('Failed to copy magnet:', err)
                          alert('Failed to copy magnet link')
                        }
                      }}
                      className="px-3 py-1 rounded text-xs font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Copy
                    </button>
                    <button
                      onClick={() => {
                        console.log('Opening torrent with magnet:', torrent.name)
                        console.log('Magnet URL:', torrent.magnet)
                        
                        // Create a temporary link element to trigger the magnet protocol
                        const link = document.createElement('a')
                        link.href = torrent.magnet
                        link.style.display = 'none'
                        document.body.appendChild(link)
                        link.click()
                        document.body.removeChild(link)
                        
                        // Open magnet link directly
                        window.open(torrent.magnet, '_blank')
                      }}
                      className="px-3 py-1 rounded text-xs font-medium transition-colors bg-green-600 hover:bg-green-700 text-white"
                    >
                      Play
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {searchResults.data.length > displayedTorrents && (
          <div className="mt-4 text-center">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Showing {displayedTorrents} of {searchResults.data.length} torrents
            </div>
            <button
              onClick={handleLoadMore}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Load More ({searchResults.data.length - displayedTorrents} remaining)
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default TorrentsTable

import { useState, useEffect, useCallback } from 'react'

interface TorrentQueryInputProps {
  initialQuery: string
  onQueryChange: (query: string) => void
  placeholder?: string
  className?: string
  debounceMs?: number
}

const TorrentQueryInput = ({
  initialQuery,
  onQueryChange,
  placeholder = "Search torrents...",
  className = "",
  debounceMs = 500
}: TorrentQueryInputProps) => {
  const [query, setQuery] = useState(initialQuery)
  const [isSearching, setIsSearching] = useState(false)

  // Update local query when initialQuery changes
  useEffect(() => {
    setQuery(initialQuery)
  }, [initialQuery])

  // Debounced search function
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout
      return (searchQuery: string) => {
        clearTimeout(timeoutId)
        setIsSearching(true)
        timeoutId = setTimeout(() => {
          onQueryChange(searchQuery)
          setIsSearching(false)
        }, debounceMs)
      }
    })(),
    [onQueryChange, debounceMs]
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value
    setQuery(newQuery)
    debouncedSearch(newQuery)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      // Clear any pending debounced search and search immediately
      onQueryChange(query)
      setIsSearching(false)
    }
  }

  const handleClear = () => {
    setQuery('')
    onQueryChange('')
  }

  return (
    <div className={`mb-4 ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg 
            className={`h-5 w-5 ${isSearching ? 'text-blue-500 animate-spin' : 'text-gray-400'}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            {isSearching ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            )}
          </svg>
        </div>
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="block w-full pl-10 pr-20 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <div className="absolute inset-y-0 right-0 flex items-center">
          {query && (
            <button
              onClick={handleClear}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mr-2"
              title="Clear search"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <div className="text-xs text-gray-500 dark:text-gray-400 mr-3">
            {isSearching ? 'Searching...' : 'Press Enter to search'}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TorrentQueryInput

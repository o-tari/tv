import { useState } from 'react'

interface SearchFiltersProps {
  filters: {
    type: 'video' | 'channel' | 'playlist'
    duration: 'short' | 'medium' | 'long' | ''
    uploadDate: 'hour' | 'today' | 'week' | 'month' | 'year' | ''
    sortBy: 'relevance' | 'date' | 'rating' | 'title' | 'viewCount'
    excludeShorts: boolean
  }
  onFilterChange: (filters: Partial<SearchFiltersProps['filters']>) => void
}

const SearchFilters = ({ filters, onFilterChange }: SearchFiltersProps) => {
  const [showFilters, setShowFilters] = useState(false)

  const typeOptions = [
    { value: 'video', label: 'Videos' },
    { value: 'channel', label: 'Channels' },
    { value: 'playlist', label: 'Playlists' },
  ]

  const durationOptions = [
    { value: '', label: 'Any duration' },
    { value: 'short', label: 'Under 4 minutes' },
    { value: 'medium', label: '4-20 minutes' },
    { value: 'long', label: 'Over 20 minutes' },
  ]

  const uploadDateOptions = [
    { value: '', label: 'Any time' },
    { value: 'hour', label: 'Last hour' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This week' },
    { value: 'month', label: 'This month' },
    { value: 'year', label: 'This year' },
  ]

  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'date', label: 'Upload date' },
    { value: 'rating', label: 'Rating' },
    { value: 'title', label: 'Title' },
    { value: 'viewCount', label: 'View count' },
  ]

  const activeFiltersCount = [
    filters.duration,
    filters.uploadDate,
    filters.sortBy !== 'relevance',
    !filters.excludeShorts,
  ].filter(Boolean).length

  return (
    <div className="space-y-4">
      {/* Filter toggle button */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span>Filters</span>
          {activeFiltersCount > 0 && (
            <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </button>

        {/* Quick filter chips */}
        <div className="flex items-center space-x-2">
          {typeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onFilterChange({ type: option.value as any })}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                filters.type === option.value
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Detailed filters */}
      {showFilters && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Duration filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Duration
              </label>
              <select
                value={filters.duration}
                onChange={(e) => onFilterChange({ duration: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                {durationOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Upload date filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Upload date
              </label>
              <select
                value={filters.uploadDate}
                onChange={(e) => onFilterChange({ uploadDate: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                {uploadDateOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort by filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sort by
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => onFilterChange({ sortBy: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Shorts filter */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="excludeShorts"
              checked={filters.excludeShorts}
              onChange={(e) => onFilterChange({ excludeShorts: e.target.checked })}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <label htmlFor="excludeShorts" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Exclude YouTube Shorts
            </label>
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchFilters

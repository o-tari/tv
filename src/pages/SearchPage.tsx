import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '../store'
import { searchVideos, clearSearchResults } from '../store/slices/videosSlice'
import { setSearchFilters } from '../store/slices/uiSlice'
import VideoGrid from '../components/VideoGrid'
import InfiniteScroll from '../components/InfiniteScroll'
import SearchFilters from '../components/SearchFilters'

const SearchPage = () => {
  const [searchParams] = useSearchParams()
  const dispatch = useAppDispatch()
  const { searchFilters } = useAppSelector((state) => state.ui)
  const {
    searchResults,
    searchLoading,
    searchError,
    searchNextPageToken,
    searchTotalResults,
  } = useAppSelector((state) => state.videos)

  const query = searchParams.get('q') || ''
  const [localFilters, setLocalFilters] = useState(searchFilters)

  useEffect(() => {
    if (query) {
      dispatch(clearSearchResults())
      dispatch(searchVideos({ query, filters: localFilters }))
    }
  }, [dispatch, query, localFilters])

  const loadMore = useCallback(() => {
    if (query && searchNextPageToken && !searchLoading) {
      dispatch(searchVideos({ query, filters: localFilters, pageToken: searchNextPageToken }))
    }
  }, [dispatch, query, localFilters, searchNextPageToken, searchLoading])

  const handleFilterChange = (newFilters: Partial<typeof searchFilters>) => {
    const updatedFilters = { ...localFilters, ...newFilters }
    setLocalFilters(updatedFilters)
    dispatch(setSearchFilters(updatedFilters))
  }

  if (searchError) {
    return (
      <div className="p-8 text-center">
        <div className="w-24 h-24 mx-auto mb-4 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
          <svg className="w-12 h-12 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Search failed
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {searchError}
        </p>
        <button
          onClick={() => dispatch(searchVideos({ query, filters: localFilters }))}
          className="btn-primary"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Search results for "{query}"
        </h1>
        {searchTotalResults > 0 && (
          <p className="text-gray-600 dark:text-gray-400">
            About {searchTotalResults.toLocaleString()} results
          </p>
        )}
      </div>

      <div className="mb-6">
        <SearchFilters
          filters={localFilters}
          onFilterChange={handleFilterChange}
        />
      </div>

      <InfiniteScroll
        onLoadMore={loadMore}
        hasMore={!!searchNextPageToken}
        loading={searchLoading}
      >
        <VideoGrid
          videos={searchResults}
          loading={searchLoading && searchResults.length === 0}
          searchType={localFilters.type}
        />
      </InfiniteScroll>
    </div>
  )
}

export default SearchPage

import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAppSelector } from '../store'
import { selectHianimeApiKey } from '../store/slices/settingsSlice'
import { hianimeService } from '../services/hianime'
import type { HiAnimeMedia } from '../types/hianime'
import MediaGrid from '../components/MediaGrid'
import LoadingSpinner from '../components/LoadingSpinner'
import SearchBar from '../components/SearchBar'

const HiAnimeSearchPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const hianimeApiKey = useAppSelector(selectHianimeApiKey)
  
  const query = searchParams.get('search') || ''
  const [searchResults, setSearchResults] = useState<HiAnimeMedia[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = (newQuery: string) => {
    if (newQuery.trim()) {
      navigate(`/hianime/search?search=${encodeURIComponent(newQuery.trim())}`)
    }
  }

  useEffect(() => {
    if (query && hianimeApiKey) {
      handleSearch(query)
    } else if (query && !hianimeApiKey) {
      setError('HiAnime API key is required. Please configure your API key in settings.')
    }
  }, [query, hianimeApiKey])

  const handleSearch = async (searchQuery: string) => {
    if (!hianimeApiKey || !searchQuery.trim()) {
      setSearchResults([])
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      hianimeService.setApiKey(hianimeApiKey)
      const response = await hianimeService.searchAnime(searchQuery)
      const mediaResults = response.animes.map(anime => 
        hianimeService.convertSearchAnimeToMedia(anime)
      )
      
      setSearchResults(mediaResults)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search anime')
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }

  if (!hianimeApiKey) {
    return (
      <div className="p-8 text-center">
        <div className="w-24 h-24 mx-auto mb-4 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
          <svg className="w-12 h-12 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          API Key Required
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Please configure your HiAnime API key in settings to search anime.
        </p>
        <a
          href="/settings"
          className="btn-primary"
        >
          Go to Settings
        </a>
      </div>
    )
  }

  if (error) {
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
          {error}
        </p>
        <button
          onClick={() => handleSearch(query)}
          className="btn-primary"
        >
          Try again
        </button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <LoadingSpinner />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Searching...
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Finding anime for "{query}"
        </p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          HiAnime Search
        </h1>
        
        {/* Search Input */}
        <div className="max-w-2xl mb-4">
          <SearchBar onSearch={handleSearch} />
        </div>
        
        {query && (
          <>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Search Results for "{query}"
            </h2>
            {searchResults.length > 0 && (
              <p className="text-gray-600 dark:text-gray-400">
                {searchResults.length} results found
              </p>
            )}
          </>
        )}
      </div>

      {query ? (
        searchResults.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No anime found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try searching with different keywords
            </p>
          </div>
        ) : (
          <MediaGrid media={searchResults} />
        )
      ) : (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Search HiAnime
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Enter a search term above to find anime
          </p>
        </div>
      )}
    </div>
  )
}

export default HiAnimeSearchPage

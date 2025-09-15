import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAppSelector } from '../store'
import { selectTmdbApiKey, selectShowUpcomingReleases } from '../store/slices/settingsSlice'
import { getTMDBService } from '../services/tmdb'
import type { TMDBMovie, TMDBTVShow, TMDBContent } from '../types/tmdb'
import TMDBMediaCard from '../components/TMDBMediaCard'
import LoadingSpinner from '../components/LoadingSpinner'
import SearchBar from '../components/SearchBar'

const MoviesTVSearchPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const tmdbApiKey = useAppSelector(selectTmdbApiKey)
  const showUpcomingReleases = useAppSelector(selectShowUpcomingReleases)
  
  const query = searchParams.get('search') || ''
  const [searchResults, setSearchResults] = useState<TMDBContent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearchSubmit = (newQuery: string) => {
    if (newQuery.trim()) {
      navigate(`/movies-tv/search?search=${encodeURIComponent(newQuery.trim())}`)
    }
  }

  const performSearch = async (searchQuery: string) => {
    if (!tmdbApiKey || !searchQuery.trim()) {
      setSearchResults([])
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      const tmdbService = getTMDBService(tmdbApiKey)
      
      const [moviesResponse, tvResponse] = await Promise.all([
        tmdbService.searchMovies(searchQuery),
        tmdbService.searchTV(searchQuery)
      ])

      const filteredMovies = tmdbService.filterByReleaseDate(moviesResponse.results, showUpcomingReleases)
      const filteredTV = tmdbService.filterByReleaseDate(tvResponse.results, showUpcomingReleases)

      setSearchResults([...filteredMovies, ...filteredTV])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search movies and TV shows')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (query && tmdbApiKey) {
      performSearch(query)
    } else if (query && !tmdbApiKey) {
      setError('TMDB API key is required. Please configure your API key in settings.')
    }
  }, [query, tmdbApiKey])

  if (!tmdbApiKey) {
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
          Please configure your TMDB API key in settings to search movies and TV shows.
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
          Finding movies and TV shows for "{query}"
        </p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Movies & TV Search
        </h1>
        
        {/* Search Input */}
        <div className="max-w-2xl mb-4">
          <SearchBar onSearch={handleSearchSubmit} />
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
              No results found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try searching with different keywords
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {searchResults.map((item) => (
              <TMDBMediaCard
                key={`${item.id}-${'title' in item ? 'movie' : 'tv'}`}
                id={item.id}
                title={'title' in item ? item.title : item.name}
                thumbnail={item.poster_path}
                duration={null}
                viewCount={item.vote_count}
                publishedAt={'release_date' in item ? item.release_date : item.first_air_date}
                channelTitle={null}
                type={'title' in item ? 'movie' : 'tv'}
                rating={item.vote_average}
                overview={item.overview}
                content={item}
              />
            ))}
          </div>
        )
      ) : (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Search Movies & TV Shows
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Enter a search term above to find movies and TV shows
          </p>
        </div>
      )}
    </div>
  )
}

export default MoviesTVSearchPage

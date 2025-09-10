import { useState, useEffect } from 'react'
import { useAppSelector } from '../store'
import { selectHianimeApiKey } from '../store/slices/settingsSlice'
import { hianimeService } from '../services/hianime'
import type { HiAnimeHomeResponse, HiAnimeMedia } from '../types/hianime'
import MediaGrid from '../components/MediaGrid'
import SearchBar from '../components/SearchBar'
import HiAnimeContinueWatching from '../components/HiAnimeContinueWatching'

const HiAnimePage = () => {
  const hianimeApiKey = useAppSelector(selectHianimeApiKey)
  const [homeData, setHomeData] = useState<HiAnimeHomeResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Search state
  const [searchResults, setSearchResults] = useState<HiAnimeMedia[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchResults, setShowSearchResults] = useState(false)

  useEffect(() => {
    if (!hianimeApiKey) {
      setError('HiAnime API key is not configured. Please add your API key in Settings.')
      setLoading(false)
      return
    }

    hianimeService.setApiKey(hianimeApiKey)
    loadHomeData()
  }, [hianimeApiKey])

  const loadHomeData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await hianimeService.getHomeData()
      setHomeData(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load HiAnime data')
    } finally {
      setLoading(false)
    }
  }

  const handleClearCache = () => {
    hianimeService.clearCache()
    loadHomeData()
  }

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setShowSearchResults(false)
      setSearchResults([])
      setSearchQuery('')
      return
    }

    try {
      setSearchLoading(true)
      setSearchError(null)
      setSearchQuery(query)
      
      const response = await hianimeService.searchAnime(query)
      const mediaResults = response.animes.map(anime => 
        hianimeService.convertSearchAnimeToMedia(anime)
      )
      
      setSearchResults(mediaResults)
      setShowSearchResults(true)
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'Failed to search anime')
      setSearchResults([])
    } finally {
      setSearchLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <svg className="w-12 h-12 text-gray-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Loading HiAnime data...
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Please wait while we fetch the latest anime content
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="w-24 h-24 mx-auto mb-4 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
          <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Something went wrong
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {error}
        </p>
        <button
          onClick={loadHomeData}
          className="btn-primary"
        >
          Try again
        </button>
      </div>
    )
  }

  if (!homeData) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No data available
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Unable to load HiAnime data
        </p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            HiAnime
          </h1>
          <button
            onClick={handleClearCache}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
          >
            Clear Cache
          </button>
        </div>

        {/* Search Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Search Anime
          </h2>
          <div className="max-w-2xl">
            <SearchBar onSearch={handleSearch} />
          </div>
          
          {/* Search Results */}
          {showSearchResults && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Search Results for "{searchQuery}"
                </h3>
                <button
                  onClick={() => {
                    setShowSearchResults(false)
                    setSearchResults([])
                    setSearchQuery('')
                  }}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  Clear Search
                </button>
              </div>
              
              {searchLoading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 mx-auto mb-4 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-gray-600 dark:text-gray-400">Searching anime...</p>
                </div>
              ) : searchError ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Search failed
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {searchError}
                  </p>
                  <button
                    onClick={() => handleSearch(searchQuery)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Try again
                  </button>
                </div>
              ) : searchResults.length > 0 ? (
                <MediaGrid media={searchResults} />
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No results found
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    Try searching with different keywords
                  </p>
                </div>
              )}
            </div>
          )}
        </div>


        {/* All Sections - Only show when not searching */}
        {!showSearchResults && (
          <div className="space-y-12">
          {/* Continue Watching Section */}
          <HiAnimeContinueWatching limit={6} />

          {/* Spotlight Section */}
          {homeData?.spotlightAnimes && homeData.spotlightAnimes.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                🌟 Spotlight Animes
              </h2>
              <MediaGrid
                media={homeData.spotlightAnimes.map(hianimeService.convertSpotlightToMedia)}
                loading={false}
              />
            </div>
          )}

          {/* Trending Section */}
          {homeData?.trendingAnimes && homeData.trendingAnimes.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                🔥 Trending Animes
              </h2>
              <MediaGrid
                media={homeData.trendingAnimes.map(hianimeService.convertTrendingToMedia)}
                loading={false}
              />
            </div>
          )}

          {/* Latest Episodes Section */}
          {homeData?.latestEpisodeAnimes && homeData.latestEpisodeAnimes.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                🆕 Latest Episodes
              </h2>
              <MediaGrid
                media={homeData.latestEpisodeAnimes.map(hianimeService.convertLatestEpisodeToMedia)}
                loading={false}
              />
            </div>
          )}

          {/* Upcoming Section */}
          {homeData?.topUpcomingAnimes && homeData.topUpcomingAnimes.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                📅 Upcoming Animes
              </h2>
              <MediaGrid
                media={homeData.topUpcomingAnimes.map(hianimeService.convertUpcomingToMedia)}
                loading={false}
              />
            </div>
          )}

          {/* Top 10 Today Section */}
          {homeData?.top10Animes?.today && homeData.top10Animes.today.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                🏆 Top 10 Today
              </h2>
              <MediaGrid
                media={homeData.top10Animes.today.map(hianimeService.convertTop10ToMedia)}
                loading={false}
              />
            </div>
          )}

          {/* Top Airing Section */}
          {homeData?.topAiringAnimes && homeData.topAiringAnimes.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                📺 Top Airing Anime
              </h2>
              <MediaGrid
                media={homeData.topAiringAnimes.map(hianimeService.convertTopAiringToMedia)}
                loading={false}
              />
            </div>
          )}

          {/* Most Popular Section */}
          {homeData?.mostPopularAnimes && homeData.mostPopularAnimes.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                🔥 Most Popular
              </h2>
              <MediaGrid
                media={homeData.mostPopularAnimes.map(hianimeService.convertMostPopularToMedia)}
                loading={false}
              />
            </div>
          )}

          {/* Most Favorite Section */}
          {homeData?.mostFavoriteAnimes && homeData.mostFavoriteAnimes.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                ❤️ Most Favorite
              </h2>
              <MediaGrid
                media={homeData.mostFavoriteAnimes.map(hianimeService.convertMostFavoriteToMedia)}
                loading={false}
              />
            </div>
          )}

          {/* Latest Completed Section */}
          {homeData?.latestCompletedAnimes && homeData.latestCompletedAnimes.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                ✅ Latest Completed
              </h2>
              <MediaGrid
                media={homeData.latestCompletedAnimes.map(hianimeService.convertLatestCompletedToMedia)}
                loading={false}
              />
            </div>
          )}

          {/* Genres Section */}
          {homeData?.genres && homeData.genres.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                🏷️ Available Genres
              </h2>
              <div className="flex flex-wrap gap-2">
                {homeData.genres.map((genre: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          )}
          </div>
        )}
      </div>
    </div>
  )
}

export default HiAnimePage
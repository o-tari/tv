import { useState, useEffect } from 'react'
import { useAppSelector } from '../store'
import { selectTmdbApiKey, selectShowUpcomingReleases } from '../store/slices/settingsSlice'
import { getTMDBService } from '../services/tmdb'
import type { TMDBMovie, TMDBTVShow, TMDBContent } from '../types/tmdb'
import TMDBMediaCard from '../components/TMDBMediaCard'
import SearchBar from '../components/SearchBar'
import LoadingSpinner from '../components/LoadingSpinner'

interface SectionState {
  displayedCount: number
  hasMore: boolean
}

const MoviesTVPage = () => {
  const tmdbApiKey = useAppSelector(selectTmdbApiKey)
  const showUpcomingReleases = useAppSelector(selectShowUpcomingReleases)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<TMDBContent[]>([])
  const [trendingMovies, setTrendingMovies] = useState<TMDBMovie[]>([])
  const [trendingTV, setTrendingTV] = useState<TMDBTVShow[]>([])
  const [tvRecommendations, setTvRecommendations] = useState<TMDBTVShow[]>([])
  const [discoverMovies, setDiscoverMovies] = useState<TMDBMovie[]>([])
  const [discoverTV, setDiscoverTV] = useState<TMDBTVShow[]>([])
  const [nowPlayingMovies, setNowPlayingMovies] = useState<TMDBMovie[]>([])
  const [popularMovies, setPopularMovies] = useState<TMDBMovie[]>([])
  const [topRatedMovies, setTopRatedMovies] = useState<TMDBMovie[]>([])
  const [loading, setLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'trending' | 'search'>('trending')
  
  // Section states for limiting items and load more functionality
  const [sectionStates, setSectionStates] = useState<Record<string, SectionState>>({
    tvRecommendations: { displayedCount: 15, hasMore: false },
    trendingMovies: { displayedCount: 15, hasMore: false },
    trendingTV: { displayedCount: 15, hasMore: false },
    discoverMovies: { displayedCount: 15, hasMore: false },
    discoverTV: { displayedCount: 15, hasMore: false },
    nowPlayingMovies: { displayedCount: 15, hasMore: false },
    popularMovies: { displayedCount: 15, hasMore: false },
    topRatedMovies: { displayedCount: 15, hasMore: false }
  })

  useEffect(() => {
    if (tmdbApiKey) {
      loadTrendingContent()
    }
  }, [tmdbApiKey, showUpcomingReleases])

  const loadTrendingContent = async () => {
    if (!tmdbApiKey) return

    setLoading(true)
    try {
      const tmdbService = getTMDBService(tmdbApiKey)
      
      const [
        moviesResponse, 
        tvResponse, 
        discoverMoviesResponse, 
        discoverTVResponse, 
        nowPlayingResponse, 
        popularMoviesResponse, 
        topRatedMoviesResponse
      ] = await Promise.all([
        tmdbService.getTrendingMovies('week'),
        tmdbService.getTrendingTV('week'),
        tmdbService.discoverMovies(),
        tmdbService.discoverTV(),
        tmdbService.getNowPlayingMovies(),
        tmdbService.getPopularMovies(),
        tmdbService.getTopRatedMovies()
      ])

      const filteredMovies = tmdbService.filterByReleaseDate(moviesResponse.results, showUpcomingReleases)
      const filteredTV = tmdbService.filterByReleaseDate(tvResponse.results, showUpcomingReleases)
      const filteredDiscoverMovies = tmdbService.filterByReleaseDate(discoverMoviesResponse.results, showUpcomingReleases)
      const filteredDiscoverTV = tmdbService.filterByReleaseDate(discoverTVResponse.results, showUpcomingReleases)
      const filteredNowPlaying = tmdbService.filterByReleaseDate(nowPlayingResponse.results, showUpcomingReleases)
      const filteredPopularMovies = tmdbService.filterByReleaseDate(popularMoviesResponse.results, showUpcomingReleases)
      const filteredTopRatedMovies = tmdbService.filterByReleaseDate(topRatedMoviesResponse.results, showUpcomingReleases)

      setTrendingMovies(filteredMovies)
      setTrendingTV(filteredTV)
      setDiscoverMovies(filteredDiscoverMovies)
      setDiscoverTV(filteredDiscoverTV)
      setNowPlayingMovies(filteredNowPlaying)
      setPopularMovies(filteredPopularMovies)
      setTopRatedMovies(filteredTopRatedMovies)

      // Update section states to reflect if there are more items to load
      setSectionStates(prev => ({
        ...prev,
        trendingMovies: { displayedCount: 15, hasMore: filteredMovies.length > 15 },
        trendingTV: { displayedCount: 15, hasMore: filteredTV.length > 15 },
        discoverMovies: { displayedCount: 15, hasMore: filteredDiscoverMovies.length > 15 },
        discoverTV: { displayedCount: 15, hasMore: filteredDiscoverTV.length > 15 },
        nowPlayingMovies: { displayedCount: 15, hasMore: filteredNowPlaying.length > 15 },
        popularMovies: { displayedCount: 15, hasMore: filteredPopularMovies.length > 15 },
        topRatedMovies: { displayedCount: 15, hasMore: filteredTopRatedMovies.length > 15 }
      }))

      // Load TV recommendations (using a popular TV show as reference)
      if (filteredTV.length > 0) {
        try {
          const recommendationsResponse = await tmdbService.getTVRecommendations(filteredTV[0].id)
          const filteredRecommendations = tmdbService.filterByReleaseDate(recommendationsResponse.results, showUpcomingReleases)
          setTvRecommendations(filteredRecommendations)
          
          // Update TV recommendations section state
          setSectionStates(prev => ({
            ...prev,
            tvRecommendations: { displayedCount: 15, hasMore: filteredRecommendations.length > 15 }
          }))
        } catch (error) {
          console.error('Error loading TV recommendations:', error)
        }
      }
    } catch (error) {
      console.error('Error loading trending content:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (query: string) => {
    if (!tmdbApiKey || !query.trim()) {
      setSearchResults([])
      setActiveTab('trending')
      return
    }

    setSearchLoading(true)
    setActiveTab('search')
    
    try {
      const tmdbService = getTMDBService(tmdbApiKey)
      
      const [moviesResponse, tvResponse] = await Promise.all([
        tmdbService.searchMovies(query),
        tmdbService.searchTV(query)
      ])

      const filteredMovies = tmdbService.filterByReleaseDate(moviesResponse.results, showUpcomingReleases)
      const filteredTV = tmdbService.filterByReleaseDate(tvResponse.results, showUpcomingReleases)

      setSearchResults([...filteredMovies, ...filteredTV])
    } catch (error) {
      console.error('Error searching:', error)
    } finally {
      setSearchLoading(false)
    }
  }

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    if (query.trim()) {
      handleSearch(query)
    } else {
      setSearchResults([])
      setActiveTab('trending')
    }
  }

  const handleLoadMore = (sectionKey: string) => {
    setSectionStates(prev => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        displayedCount: Math.min(prev[sectionKey].displayedCount + 15, getTotalItems(sectionKey)),
        hasMore: prev[sectionKey].displayedCount + 15 < getTotalItems(sectionKey)
      }
    }))
  }

  const getTotalItems = (sectionKey: string): number => {
    switch (sectionKey) {
      case 'tvRecommendations': return tvRecommendations.length
      case 'trendingMovies': return trendingMovies.length
      case 'trendingTV': return trendingTV.length
      case 'discoverMovies': return discoverMovies.length
      case 'discoverTV': return discoverTV.length
      case 'nowPlayingMovies': return nowPlayingMovies.length
      case 'popularMovies': return popularMovies.length
      case 'topRatedMovies': return topRatedMovies.length
      default: return 0
    }
  }

  const getSectionItems = (sectionKey: string): TMDBContent[] => {
    switch (sectionKey) {
      case 'tvRecommendations': return tvRecommendations
      case 'trendingMovies': return trendingMovies
      case 'trendingTV': return trendingTV
      case 'discoverMovies': return discoverMovies
      case 'discoverTV': return discoverTV
      case 'nowPlayingMovies': return nowPlayingMovies
      case 'popularMovies': return popularMovies
      case 'topRatedMovies': return topRatedMovies
      default: return []
    }
  }

  const renderSection = (title: string, sectionKey: string, type: 'movie' | 'tv') => {
    const items = getSectionItems(sectionKey)
    const sectionState = sectionStates[sectionKey]
    const displayedItems = items.slice(0, sectionState.displayedCount)

    if (loading) {
      return (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {title}
          </h2>
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner />
          </div>
        </div>
      )
    }

    if (displayedItems.length === 0) {
      return null
    }

    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          {title}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {displayedItems.map((item) => (
            <TMDBMediaCard
              key={`${sectionKey}-${item.id}`}
              id={item.id}
              title={'title' in item ? item.title : item.name}
              thumbnail={item.poster_path}
              duration={null}
              viewCount={item.vote_count}
              publishedAt={'release_date' in item ? item.release_date : item.first_air_date}
              channelTitle={null}
              type={type}
              rating={item.vote_average}
              overview={item.overview}
            />
          ))}
        </div>
        {sectionState.hasMore && (
          <div className="flex justify-center mt-6">
            <button
              onClick={() => handleLoadMore(sectionKey)}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    )
  }

  const renderContent = () => {
    if (activeTab === 'search') {
      if (searchLoading) {
        return (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner />
          </div>
        )
      }

      if (searchResults.length === 0 && searchQuery) {
        return (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No results found for "{searchQuery}"
            </p>
          </div>
        )
      }

      return (
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
            />
          ))}
        </div>
      )
    }

    return (
      <div className="space-y-12">
        {/* TV Recommendations - First section after search */}
        {renderSection('Recommended TV Shows', 'tvRecommendations', 'tv')}

        {/* Trending Movies */}
        {renderSection('Trending Movies', 'trendingMovies', 'movie')}

        {/* Trending TV Shows */}
        {renderSection('Trending TV Shows', 'trendingTV', 'tv')}

        {/* Discover Movies */}
        {renderSection('Discover Movies', 'discoverMovies', 'movie')}

        {/* Discover TV Shows */}
        {renderSection('Discover TV Shows', 'discoverTV', 'tv')}

        {/* Now Playing Movies */}
        {renderSection('Now Playing Movies', 'nowPlayingMovies', 'movie')}

        {/* Popular Movies */}
        {renderSection('Popular Movies', 'popularMovies', 'movie')}

        {/* Top Rated Movies */}
        {renderSection('Top Rated Movies', 'topRatedMovies', 'movie')}
      </div>
    )
  }

  if (!tmdbApiKey) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Movies & TV
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-8">
              Please configure your TMDB API key in settings to access movies and TV shows.
            </p>
            <a
              href="/settings"
              className="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
            >
              Go to Settings
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Movies & TV
          </h1>
          
          {/* Search Bar */}
          <div className="max-w-2xl">
            <SearchBar
              onSearch={handleSearchChange}
            />
          </div>
        </div>

        {/* Content */}
        {renderContent()}
      </div>
    </div>
  )
}

export default MoviesTVPage

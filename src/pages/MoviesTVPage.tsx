import { useState, useEffect } from 'react'
import { useAppSelector } from '../store'
import { selectTmdbApiKey, selectShowUpcomingReleases } from '../store/slices/settingsSlice'
import { getTMDBService } from '../services/tmdb'
import type { TMDBMovie, TMDBTVShow, TMDBContent } from '../types/tmdb'
import TMDBMediaCard from '../components/TMDBMediaCard'
import SearchBar from '../components/SearchBar'
import LoadingSpinner from '../components/LoadingSpinner'

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

      // Load TV recommendations (using a popular TV show as reference)
      if (filteredTV.length > 0) {
        try {
          const recommendationsResponse = await tmdbService.getTVRecommendations(filteredTV[0].id)
          const filteredRecommendations = tmdbService.filterByReleaseDate(recommendationsResponse.results, showUpcomingReleases)
          setTvRecommendations(filteredRecommendations)
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
        {tvRecommendations.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Recommended TV Shows
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {tvRecommendations.map((tv) => (
                <TMDBMediaCard
                  key={`tv-rec-${tv.id}`}
                  id={tv.id}
                  title={tv.name}
                  thumbnail={tv.poster_path}
                  duration={null}
                  viewCount={tv.vote_count}
                  publishedAt={tv.first_air_date}
                  channelTitle={null}
                  type="tv"
                  rating={tv.vote_average}
                  overview={tv.overview}
                />
              ))}
            </div>
          </div>
        )}

        {/* Trending Movies */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Trending Movies
          </h2>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {trendingMovies.map((movie) => (
                <TMDBMediaCard
                  key={`movie-${movie.id}`}
                  id={movie.id}
                  title={movie.title}
                  thumbnail={movie.poster_path}
                  duration={null}
                  viewCount={movie.vote_count}
                  publishedAt={movie.release_date}
                  channelTitle={null}
                  type="movie"
                  rating={movie.vote_average}
                  overview={movie.overview}
                />
              ))}
            </div>
          )}
        </div>

        {/* Trending TV Shows */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Trending TV Shows
          </h2>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {trendingTV.map((tv) => (
                <TMDBMediaCard
                  key={`tv-${tv.id}`}
                  id={tv.id}
                  title={tv.name}
                  thumbnail={tv.poster_path}
                  duration={null}
                  viewCount={tv.vote_count}
                  publishedAt={tv.first_air_date}
                  channelTitle={null}
                  type="tv"
                  rating={tv.vote_average}
                  overview={tv.overview}
                />
              ))}
            </div>
          )}
        </div>

        {/* Discover Movies */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Discover Movies
          </h2>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {discoverMovies.map((movie) => (
                <TMDBMediaCard
                  key={`discover-movie-${movie.id}`}
                  id={movie.id}
                  title={movie.title}
                  thumbnail={movie.poster_path}
                  duration={null}
                  viewCount={movie.vote_count}
                  publishedAt={movie.release_date}
                  channelTitle={null}
                  type="movie"
                  rating={movie.vote_average}
                  overview={movie.overview}
                />
              ))}
            </div>
          )}
        </div>

        {/* Discover TV Shows */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Discover TV Shows
          </h2>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {discoverTV.map((tv) => (
                <TMDBMediaCard
                  key={`discover-tv-${tv.id}`}
                  id={tv.id}
                  title={tv.name}
                  thumbnail={tv.poster_path}
                  duration={null}
                  viewCount={tv.vote_count}
                  publishedAt={tv.first_air_date}
                  channelTitle={null}
                  type="tv"
                  rating={tv.vote_average}
                  overview={tv.overview}
                />
              ))}
            </div>
          )}
        </div>

        {/* Now Playing Movies */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Now Playing Movies
          </h2>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {nowPlayingMovies.map((movie) => (
                <TMDBMediaCard
                  key={`now-playing-${movie.id}`}
                  id={movie.id}
                  title={movie.title}
                  thumbnail={movie.poster_path}
                  duration={null}
                  viewCount={movie.vote_count}
                  publishedAt={movie.release_date}
                  channelTitle={null}
                  type="movie"
                  rating={movie.vote_average}
                  overview={movie.overview}
                />
              ))}
            </div>
          )}
        </div>

        {/* Popular Movies */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Popular Movies
          </h2>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {popularMovies.map((movie) => (
                <TMDBMediaCard
                  key={`popular-movie-${movie.id}`}
                  id={movie.id}
                  title={movie.title}
                  thumbnail={movie.poster_path}
                  duration={null}
                  viewCount={movie.vote_count}
                  publishedAt={movie.release_date}
                  channelTitle={null}
                  type="movie"
                  rating={movie.vote_average}
                  overview={movie.overview}
                />
              ))}
            </div>
          )}
        </div>

        {/* Top Rated Movies */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Top Rated Movies
          </h2>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {topRatedMovies.map((movie) => (
                <TMDBMediaCard
                  key={`top-rated-${movie.id}`}
                  id={movie.id}
                  title={movie.title}
                  thumbnail={movie.poster_path}
                  duration={null}
                  viewCount={movie.vote_count}
                  publishedAt={movie.release_date}
                  channelTitle={null}
                  type="movie"
                  rating={movie.vote_average}
                  overview={movie.overview}
                />
              ))}
            </div>
          )}
        </div>
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

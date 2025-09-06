import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppSelector } from '../store'
import { selectTmdbApiKey } from '../store/slices/settingsSlice'
import { getTMDBService } from '../services/tmdb'
import { TMDBMovieDetails, TMDBTVDetails, TMDBVideo, TMDBSeason } from '../types/tmdb'
import YouTubePlayer from '../components/YouTubePlayer'
import LoadingSpinner from '../components/LoadingSpinner'

const TMDBWatchPage = () => {
  const { id, type } = useParams<{ id: string; type: 'movie' | 'tv' }>()
  const navigate = useNavigate()
  const tmdbApiKey = useAppSelector(selectTmdbApiKey)
  
  const [content, setContent] = useState<TMDBMovieDetails | TMDBTVDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSeason, setSelectedSeason] = useState<number>(1)
  const [selectedEpisode, setSelectedEpisode] = useState<number>(1)

  useEffect(() => {
    if (id && type && tmdbApiKey) {
      loadContent()
    }
  }, [id, type, tmdbApiKey])

  const loadContent = async () => {
    if (!id || !type || !tmdbApiKey) return

    setLoading(true)
    setError(null)
    
    try {
      const tmdbService = getTMDBService(tmdbApiKey)
      
      if (type === 'movie') {
        const movieDetails = await tmdbService.getMovieDetails(parseInt(id))
        setContent(movieDetails)
      } else {
        const tvDetails = await tmdbService.getTVDetails(parseInt(id))
        setContent(tvDetails)
        // Set first season as default
        if (tvDetails.seasons && tvDetails.seasons.length > 0) {
          setSelectedSeason(tvDetails.seasons[0].season_number)
        }
      }
    } catch (err) {
      setError('Failed to load content details')
      console.error('Error loading content:', err)
    } finally {
      setLoading(false)
    }
  }

  const getTrailerVideo = (): TMDBVideo | null => {
    if (!content?.videos?.results) return null
    
    const trailers = content.videos.results.filter(
      video => video.type === 'Trailer' && video.site === 'YouTube'
    )
    
    return trailers.length > 0 ? trailers[0] : null
  }

  const getCurrentSeason = (): TMDBSeason | null => {
    if (!content || type !== 'tv' || !('seasons' in content)) return null
    
    return content.seasons.find(season => season.season_number === selectedSeason) || null
  }

  const formatRuntime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (!tmdbApiKey) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              TMDB API Key Required
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-8">
              Please configure your TMDB API key in settings to watch content.
            </p>
            <button
              onClick={() => navigate('/settings')}
              className="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
            >
              Go to Settings
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !content) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {error || 'Content not found'}
            </h1>
            <button
              onClick={() => navigate('/movies-tv')}
              className="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
            >
              Back to Movies & TV
            </button>
          </div>
        </div>
      </div>
    )
  }

  const trailer = getTrailerVideo()
  const isTV = type === 'tv'
  const currentSeason = getCurrentSeason()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/movies-tv')}
          className="mb-6 flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Movies & TV
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Video Player */}
            {trailer ? (
              <div className="mb-6">
                <YouTubePlayer
                  videoId={trailer.key}
                  title={trailer.name}
                  className="w-full aspect-video rounded-lg"
                />
              </div>
            ) : (
              <div className="mb-6 bg-gray-200 dark:bg-gray-800 rounded-lg aspect-video flex items-center justify-center">
                <div className="text-center">
                  <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
                    No trailer available
                  </p>
                  <div className="w-16 h-16 mx-auto bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {/* Content Details */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {isTV ? (content as TMDBTVDetails).name : (content as TMDBMovieDetails).title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="flex items-center">
                  <span className="text-yellow-500 mr-1">★</span>
                  <span className="text-gray-900 dark:text-white font-semibold">
                    {content.vote_average.toFixed(1)}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 ml-1">
                    ({content.vote_count} votes)
                  </span>
                </div>
                
                {isTV && 'number_of_seasons' in content && (
                  <span className="text-gray-500 dark:text-gray-400">
                    {content.number_of_seasons} season{content.number_of_seasons !== 1 ? 's' : ''}
                  </span>
                )}
                
                {!isTV && 'runtime' in content && (
                  <span className="text-gray-500 dark:text-gray-400">
                    {formatRuntime(content.runtime)}
                  </span>
                )}
                
                <span className="text-gray-500 dark:text-gray-400">
                  {formatDate(isTV ? (content as TMDBTVDetails).first_air_date : (content as TMDBMovieDetails).release_date)}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {content.genres.map((genre) => (
                  <span
                    key={genre.id}
                    className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>

              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {content.overview}
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* TV Show Seasons & Episodes */}
            {isTV && 'seasons' in content && content.seasons && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Seasons & Episodes
                </h3>
                
                <div className="space-y-4">
                  {content.seasons.map((season) => (
                    <div key={season.id}>
                      <button
                        onClick={() => setSelectedSeason(season.season_number)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          selectedSeason === season.season_number
                            ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                            : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">
                            Season {season.season_number}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {season.episode_count} episodes
                          </span>
                        </div>
                        {season.air_date && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {formatDate(season.air_date)}
                          </p>
                        )}
                      </button>
                      
                      {selectedSeason === season.season_number && season.overview && (
                        <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {season.overview}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Additional Info
              </h3>
              
              <div className="space-y-3">
                <div>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">Status</span>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {content.status}
                  </p>
                </div>
                
                <div>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">Language</span>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {content.original_language.toUpperCase()}
                  </p>
                </div>
                
                {isTV && 'origin_country' in content && content.origin_country.length > 0 && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">Country</span>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {content.origin_country.join(', ')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TMDBWatchPage

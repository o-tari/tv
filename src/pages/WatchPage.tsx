import { useEffect } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store'
import { addToHistory } from '../store/slices/historySlice'
import { addToContinueWatching } from '../store/slices/continueWatchingSlice'
import { addToAnimeContinueWatching } from '../store/slices/animeContinueWatchingSlice'
import { useVideo } from '../hooks/useVideo'
import { 
  fetchAnimeInfo, 
  fetchAnimeEpisodes, 
  fetchAnimeRecommendations,
  clearAnimeEpisodes 
} from '../store/slices/animeSlice'
import YouTubePlayer from '../components/YouTubePlayer'
import VideoInfo from '../components/VideoInfo'
import VideoGrid from '../components/VideoGrid'
import AnimeEpisodeBatches from '../components/AnimeEpisodeBatches'
import { type AnimeMedia } from '../types/anime'

const WatchPage = () => {
  const { videoId, animeId } = useParams<{ videoId?: string; animeId?: string }>()
  const location = useLocation()
  const dispatch = useAppDispatch()
  
  // Determine if this is an anime or video
  const isAnime = location.pathname.startsWith('/anime/')
  
  const {
    video,
    loading,
    error,
    relatedVideos,
    relatedLoading,
    relatedError,
  } = useVideo(videoId || '')
  
  // Anime state
  const { 
    currentAnime, 
    currentAnimeLoading, 
    currentAnimeError,
    animeEpisodes,
    animeEpisodesLoading,
    animeEpisodesError,
    recommendations,
    recommendationsLoading,
    recommendationsError
  } = useAppSelector((state) => state.anime)

  // Fetch anime info, episodes, and recommendations if this is an anime page
  useEffect(() => {
    if (isAnime && animeId) {
      const animeIdNum = parseInt(animeId)
      dispatch(fetchAnimeInfo(animeId))
      dispatch(fetchAnimeEpisodes({ animeId: animeIdNum, page: 1 }))
      dispatch(fetchAnimeRecommendations(animeIdNum))
    }
  }, [dispatch, isAnime, animeId])

  // Clear episodes when leaving anime page
  useEffect(() => {
    if (!isAnime) {
      dispatch(clearAnimeEpisodes())
    }
  }, [dispatch, isAnime])

  // Add to history and continue watching when content loads
  useEffect(() => {
    if (video) {
      dispatch(addToHistory(video))
      dispatch(addToContinueWatching(video))
    }
  }, [dispatch, video])

  // Add anime to continue watching when anime loads
  useEffect(() => {
    if (currentAnime) {
      const animeMedia: AnimeMedia = {
        id: currentAnime.id,
        title: currentAnime.title,
        image: currentAnime.image,
        url: currentAnime.url,
        type: 'anime',
        genres: currentAnime.genres,
        description: currentAnime.description,
        status: currentAnime.status,
        totalEpisodes: currentAnime.totalEpisodes,
        subOrDub: currentAnime.subOrDub,
      }
      dispatch(addToAnimeContinueWatching(animeMedia))
    }
  }, [dispatch, currentAnime])

  const isLoading = isAnime ? currentAnimeLoading : loading
  const currentError = isAnime ? currentAnimeError : error

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg mb-6"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (currentError) {
    return (
      <div className="p-8 text-center">
        <div className="w-24 h-24 mx-auto mb-4 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
          <svg className="w-12 h-12 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {isAnime ? 'Anime not found' : 'Video not found'}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {currentError}
        </p>
        <button
          onClick={() => window.history.back()}
          className="btn-primary"
        >
          Go back
        </button>
      </div>
    )
  }

  if (!video && !currentAnime) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {isAnime ? 'Anime not found' : 'Video not found'}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          The {isAnime ? 'anime' : 'video'} you're looking for doesn't exist or has been removed.
        </p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {isAnime ? (
              <>
                {/* Anime Episodes */}
                <AnimeEpisodeBatches
                  episodes={animeEpisodes}
                  animeId={animeId || ''}
                  animeTitle={currentAnime?.title || ''}
                  animeImage={currentAnime?.image || ''}
                  totalEpisodes={currentAnime?.totalEpisodes}
                  loading={animeEpisodesLoading}
                  error={animeEpisodesError}
                  onRetry={() => animeId && dispatch(fetchAnimeEpisodes({ animeId: parseInt(animeId), page: 1 }))}
                />

                {/* Anime info */}
                {currentAnime && (
                  <div className="space-y-4">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {currentAnime.title}
                    </h1>
                    
                    <div className="flex flex-wrap gap-2">
                      {currentAnime.genres?.map((genre, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>

                    {currentAnime.description && (
                      <div className="prose dark:prose-invert max-w-none">
                        <p className="text-gray-700 dark:text-gray-300">
                          {currentAnime.description}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                      {currentAnime.status && (
                        <span>Status: {currentAnime.status}</span>
                      )}
                      {currentAnime.totalEpisodes && (
                        <span>Episodes: {currentAnime.totalEpisodes}</span>
                      )}
                      {currentAnime.subOrDub && (
                        <span>Type: {currentAnime.subOrDub}</span>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Video player */}
                <div className="aspect-video">
                  <YouTubePlayer videoId={video!.id} />
                </div>

                {/* Video info */}
                <VideoInfo video={video!} />
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {isAnime ? 'Recommendations' : 'Related videos'}
            </h3>
            
            {isAnime ? (
              <>
                {recommendationsLoading ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 mx-auto mb-4 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Loading recommendations...
                    </p>
                  </div>
                ) : recommendationsError ? (
                  <div className="text-center py-4">
                    <p className="text-red-600 dark:text-red-400 text-sm">
                      Failed to load recommendations
                    </p>
                    <button
                      onClick={() => animeId && dispatch(fetchAnimeRecommendations(parseInt(animeId)))}
                      className="mt-2 btn-primary text-sm"
                    >
                      Try again
                    </button>
                  </div>
                ) : recommendations.length > 0 ? (
                  <div className="space-y-3">
                    {recommendations.slice(0, 6).map((anime) => (
                      <div
                        key={anime.id}
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                      >
                        <div className="flex-shrink-0 w-12 h-16 bg-gray-200 dark:bg-gray-600 rounded overflow-hidden">
                          <img
                            src={anime.image}
                            alt={anime.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = '/placeholder-movie.svg'
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {anime.title}
                          </h4>
                          {anime.score && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              ⭐ {anime.score}/10
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                      <span className="text-2xl">🎌</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      No recommendations available
                    </p>
                  </div>
                )}
              </>
            ) : (
              <>
                {relatedError ? (
                  <div className="text-center py-4">
                    <p className="text-red-600 dark:text-red-400 text-sm">
                      Failed to load related videos
                    </p>
                  </div>
                ) : (
                  <VideoGrid
                    videos={relatedVideos}
                    loading={relatedLoading}
                    variant="compact"
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default WatchPage

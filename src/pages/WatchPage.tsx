import { useEffect, useCallback } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store'
import { addToHistory } from '../store/slices/historySlice'
import { addToAnimeContinueWatching } from '../store/slices/animeContinueWatchingSlice'
import { fetchRandomVideosFromSavedChannels } from '../store/slices/videosSlice'
import { toggleAutoplay } from '../store/slices/uiSlice'
import { useVideo } from '../hooks/useVideo'
import { 
  fetchAnimeInfo, 
  fetchAnimeEpisodes, 
  fetchAnimeRecommendations,
  clearAnimeEpisodes 
} from '../store/slices/animeSlice'
import EnhancedYouTubePlayer from '../components/EnhancedYouTubePlayer'
import VideoInfo from '../components/VideoInfo'
import RelatedVideosList from '../components/RelatedVideosList'
import UpNextSection from '../components/UpNextSection'
import AnimeEpisodeBatches from '../components/AnimeEpisodeBatches'
import { type AnimeMedia } from '../types/anime'

const WatchPage = () => {
  const { videoId, animeId } = useParams<{ videoId?: string; animeId?: string }>()
  const location = useLocation()
  const navigate = useNavigate()
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
    retryRelatedVideos,
  } = useVideo(videoId || '')
  
  // Get random videos from saved channels
  const { randomVideos } = useAppSelector((state) => state.videos)
  
  // Get autoplay setting
  const { autoplay } = useAppSelector((state) => state.ui)
  
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

  // Fetch random videos from saved channels for Up Next (only if not already available)
  useEffect(() => {
    if (!isAnime && (!randomVideos || randomVideos.length === 0)) {
      console.log('🎲 WatchPage: Fetching random videos for Up Next...')
      dispatch(fetchRandomVideosFromSavedChannels(200))
    }
  }, [dispatch, isAnime, randomVideos?.length]) // Only fetch if we don't have random videos

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

  // Add to history when content loads
  useEffect(() => {
    if (video) {
      dispatch(addToHistory(video))
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

  // Handle video end - navigate to random video from saved channels (only if autoplay is enabled)
  const handleVideoEnd = useCallback(() => {
    console.log('🎬 Video ended! Checking for auto-play...')
    console.log('isAnime:', isAnime)
    console.log('autoplay enabled:', autoplay)
    console.log('randomVideos length:', randomVideos?.length || 0)
    console.log('current videoId:', videoId)
    
    // Only auto-navigate if autoplay is enabled and this is not an anime page
    if (!isAnime && autoplay) {
      if (randomVideos && randomVideos.length > 0) {
        // Filter out current video
        const availableVideos = randomVideos.filter(video => video.id !== videoId)
        console.log('Available videos after filtering:', availableVideos.length)
        
        if (availableVideos.length > 0) {
          // Get a random video from saved channels
          const randomIndex = Math.floor(Math.random() * availableVideos.length)
          const randomVideo = availableVideos[randomIndex]
          
          if (randomVideo && randomVideo.id) {
            console.log('🎬 Video ended, navigating to random video from saved channels:', randomVideo.title)
            
            // Show a brief message before navigating
            const message = `Auto-playing: ${randomVideo.title}`
            console.log(message)
            
            // Small delay to ensure smooth navigation
            setTimeout(() => {
              navigate(`/watch/${randomVideo.id}`)
            }, 500)
          } else {
            console.log('🎬 Video ended, but no random videos available')
          }
        } else {
          console.log('🎬 Video ended, but no other videos available from saved channels')
        }
      } else {
        console.log('🎬 Video ended, but no videos available from saved channels - trying to fetch them')
        // Try to fetch random videos if they're not available
        dispatch(fetchRandomVideosFromSavedChannels(200))
      }
    } else if (!autoplay) {
      console.log('🎬 Video ended, but autoplay is disabled - staying on current video')
    } else {
      console.log('🎬 Video ended, but this is an anime page')
    }
  }, [isAnime, autoplay, randomVideos, videoId, navigate, dispatch])

  // Handle video selection from Up Next
  const handleVideoSelect = (video: any) => {
    if (video && video.id) {
      console.log('🎬 Navigating to video from Up Next:', video.title, video.id)
      navigate(`/watch/${video.id}`)
    }
  }

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {isAnime ? (
        <div className="p-6">
          <div className="max-w-6xl mx-auto">
            <div className="space-y-6">
              {/* Main content */}
              <div className="space-y-6">
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
              </div>

              {/* Related Videos - Full width below main content */}
              <div className="w-full">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Recommendations
                </h3>
                
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {recommendations.slice(0, 8).map((anime) => (
                      <div
                        key={anime.id}
                        className="flex flex-col space-y-2 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                      >
                        <div className="aspect-[3/4] bg-gray-200 dark:bg-gray-600 rounded overflow-hidden">
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
                        <div className="space-y-1">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
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
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Full-window video player section */}
          <div className="relative full-window-player">
            {/* Back button overlay */}
            <button
              onClick={() => navigate(-1)}
              className="absolute top-4 left-4 z-10 p-2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full transition-all duration-200"
              title="Go back"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <EnhancedYouTubePlayer 
              videoId={video!.id} 
              video={video || undefined}
              showControls={true}
              onVideoEnd={handleVideoEnd}
              autoplay={autoplay}
              fullWindow={true}
            />
          </div>

          {/* Scrollable content below the player */}
          <div className="p-6">
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Up Next section */}
              <UpNextSection 
                currentVideoId={video!.id}
                currentChannelId={video!.channelId}
                onVideoSelect={handleVideoSelect}
              />

              {/* Autoplay control */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoplay}
                        onChange={() => dispatch(toggleAutoplay())}
                        className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Autoplay videos
                      </span>
                    </label>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {autoplay ? 'Videos will start playing automatically' : 'Videos will not autoplay'}
                  </div>
                </div>
              </div>

              {/* Video info */}
              <VideoInfo video={video!} />

              {/* Related Videos */}
              <div className="w-full">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Related videos
                </h3>
                <RelatedVideosList
                  videos={relatedVideos}
                  loading={relatedLoading}
                  error={relatedError}
                  onRetry={retryRelatedVideos}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default WatchPage

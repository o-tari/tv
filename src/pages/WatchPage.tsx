import { useEffect, useCallback, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store'
import { addToHistory } from '../store/slices/historySlice'
import { toggleAutoplay } from '../store/slices/uiSlice'
import { searchVideos } from '../store/slices/videosSlice'
import { useVideo } from '../hooks/useVideo'
import EnhancedYouTubePlayer from '../components/EnhancedYouTubePlayer'
import VideoInfo from '../components/VideoInfo'
import RelatedVideosList from '../components/RelatedVideosList'

const WatchPage = () => {
  const { videoId } = useParams<{ videoId: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  
  const {
    video,
    loading,
    error,
    relatedVideos,
    relatedLoading,
    relatedError,
    retryRelatedVideos,
  } = useVideo(videoId || '')
  
  // Get autoplay setting
  const { autoplay } = useAppSelector((state) => state.ui)

  // Add to history when content loads
  useEffect(() => {
    if (video) {
      dispatch(addToHistory(video))
    }
  }, [dispatch, video])

  // Handle video end - search for similar videos and navigate to random one (only if autoplay is enabled)
  const handleVideoEnd = useCallback(async () => {
    console.log('🎬 Video ended! Checking for auto-play...')
    console.log('autoplay enabled:', autoplay)
    console.log('current videoId:', videoId)
    console.log('current video:', video)
    
    // Only auto-navigate if autoplay is enabled and we have video details
    if (autoplay && video) {
      try {
        console.log('🎬 Video ended, searching for similar videos with title:', video.title)
        console.log('🎬 Using category ID:', video.categoryId)
        
        // Search for videos using the current video's title and category
        const searchFilters = {
          type: 'video',
          excludeShorts: true,
          ...(video.categoryId && { categoryId: video.categoryId })
        }
        
        const result = await dispatch(searchVideos({ 
          query: video.title, 
          filters: searchFilters 
        }))
        
        if (result.payload && result.payload.items && result.payload.items.length > 0) {
          // Filter out current video
          const availableVideos = result.payload.items.filter(v => v.id !== videoId)
          console.log('Available search results after filtering:', availableVideos.length)
          
          if (availableVideos.length > 0) {
            // Get a random video from the search results
            const randomIndex = Math.floor(Math.random() * availableVideos.length)
            const randomVideo = availableVideos[randomIndex]
            
            if (randomVideo && randomVideo.id) {
              console.log('🎬 Video ended, navigating to random similar video:', randomVideo.title)
              
              // Show a brief message before navigating
              const message = `Auto-playing: ${randomVideo.title}`
              console.log(message)
              
              // Small delay to ensure smooth navigation
              setTimeout(() => {
                navigate(`/watch/${randomVideo.id}`)
              }, 500)
            } else {
              console.log('🎬 Video ended, but no valid similar videos available')
            }
          } else {
            console.log('🎬 Video ended, but no other similar videos available')
          }
        } else {
          console.log('🎬 Video ended, but no search results found')
        }
      } catch (error) {
        console.error('🎬 Error searching for similar videos:', error)
      }
    } else if (!autoplay) {
      console.log('🎬 Video ended, but autoplay is disabled - staying on current video')
    } else if (!video) {
      console.log('🎬 Video ended, but no video details available')
    }
  }, [autoplay, video, videoId, navigate, dispatch])


  const isLoading = loading
  const currentError = error

  // Add timeout for loading states to prevent infinite loading
  const [loadingTimeout, setLoadingTimeout] = useState(false)
  
  // YouTube videos should only use YouTube player, no torrent functionality
  
  useEffect(() => {
    if (isLoading) {
      const timeout = setTimeout(() => {
        setLoadingTimeout(true)
      }, 15000) // 15 second timeout
      
      return () => clearTimeout(timeout)
    } else {
      setLoadingTimeout(false)
    }
  }, [isLoading])

  if (isLoading && !loadingTimeout) {
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

  if (loadingTimeout) {
    return (
      <div className="p-8 text-center">
        <div className="w-24 h-24 mx-auto mb-4 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
          <svg className="w-12 h-12 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Loading Timeout
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          The content is taking longer than expected to load. This might be due to network issues or API problems.
        </p>
        <div className="space-x-4">
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Reload Page
          </button>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Go Back
          </button>
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
          Video not found
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

  if (!video) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Video not found
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          The video you're looking for doesn't exist or has been removed.
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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
          videoId={video.id} 
          video={video}
          showControls={true}
          onVideoEnd={handleVideoEnd}
          autoplay={autoplay}
          fullWindow={true}
        />
      </div>

      {/* Scrollable content below the player */}
      <div className="p-6">
        <div className="max-w-6xl mx-auto space-y-6">
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
          <VideoInfo video={video} />

          {/* Related Videos */}
          <div className="w-full">
            <RelatedVideosList
              videos={relatedVideos}
              loading={relatedLoading}
              error={relatedError}
              onRetry={retryRelatedVideos}
              title="Videos similar to this one"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default WatchPage

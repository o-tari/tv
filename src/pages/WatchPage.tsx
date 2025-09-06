import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAppDispatch } from '../store'
import { addToHistory } from '../store/slices/historySlice'
import { addToContinueWatching } from '../store/slices/continueWatchingSlice'
import { useVideo } from '../hooks/useVideo'
import YouTubePlayer from '../components/YouTubePlayer'
import VideoInfo from '../components/VideoInfo'
import VideoGrid from '../components/VideoGrid'

const WatchPage = () => {
  const { videoId } = useParams<{ videoId: string }>()
  const dispatch = useAppDispatch()
  const {
    video,
    loading,
    error,
    relatedVideos,
    relatedLoading,
    relatedError,
  } = useVideo(videoId || '')

  // Add to history and continue watching when video loads
  useEffect(() => {
    if (video) {
      dispatch(addToHistory(video))
      dispatch(addToContinueWatching(video))
    }
  }, [dispatch, video])

  if (loading) {
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

  if (error) {
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
          {error}
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
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video player */}
            <div className="aspect-video">
              <YouTubePlayer videoId={video.id} />
            </div>

            {/* Video info */}
            <VideoInfo video={video} />
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Related videos
            </h3>
            
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
          </div>
        </div>
      </div>
    </div>
  )
}

export default WatchPage

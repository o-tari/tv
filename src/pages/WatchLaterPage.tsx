import { useAppSelector, useAppDispatch } from '../store'
import { clearWatchLater } from '../store/slices/historySlice'
import VideoGrid from '../components/VideoGrid'

const WatchLaterPage = () => {
  const dispatch = useAppDispatch()
  const { watchLater } = useAppSelector((state) => state.history)

  const handleClearWatchLater = () => {
    if (window.confirm('Are you sure you want to clear your watch later list?')) {
      dispatch(clearWatchLater())
    }
  }


  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Watch Later
          </h1>
          {watchLater.length > 0 && (
            <button
              onClick={handleClearWatchLater}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Clear all
            </button>
          )}
        </div>

        {watchLater.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No videos in watch later
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Videos you save for later will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {watchLater.length} video{watchLater.length !== 1 ? 's' : ''} saved
            </p>
            <VideoGrid
              videos={watchLater}
              variant="compact"
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default WatchLaterPage

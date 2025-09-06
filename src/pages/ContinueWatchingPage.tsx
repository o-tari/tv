import { useAppSelector, useAppDispatch } from '../store'
import { selectContinueWatching, clearContinueWatching } from '../store/slices/continueWatchingSlice'
import { selectAnimeContinueWatching, clearAnimeContinueWatching } from '../store/slices/animeContinueWatchingSlice'
import ContinueWatching from '../components/ContinueWatching'
import AnimeContinueWatching from '../components/AnimeContinueWatching'

const ContinueWatchingPage = () => {
  const dispatch = useAppDispatch()
  const continueWatchingVideos = useAppSelector(selectContinueWatching)
  const animeContinueWatching = useAppSelector(selectAnimeContinueWatching)

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all continue watching videos?')) {
      dispatch(clearContinueWatching())
    }
  }

  const handleClearAllAnime = () => {
    if (window.confirm('Are you sure you want to clear all continue watching anime?')) {
      dispatch(clearAnimeContinueWatching())
    }
  }

  if (continueWatchingVideos.length === 0 && animeContinueWatching.length === 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-youtube-dark">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              No content to continue watching
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Start watching some videos or anime to see them here.
            </p>
            <div className="flex gap-4 justify-center">
              <a
                href="/"
                className="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
              >
                Browse Videos
              </a>
              <a
                href="/anime"
                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Browse Anime
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-youtube-dark">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Continue Watching
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {continueWatchingVideos.length + animeContinueWatching.length} item{(continueWatchingVideos.length + animeContinueWatching.length) !== 1 ? 's' : ''} in your queue
            </p>
          </div>
          
          <div className="flex gap-2">
            {continueWatchingVideos.length > 0 && (
              <button
                onClick={handleClearAll}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Clear All Videos
              </button>
            )}
            {animeContinueWatching.length > 0 && (
              <button
                onClick={handleClearAllAnime}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Clear All Anime
              </button>
            )}
          </div>
        </div>

        {/* Anime Continue Watching Section */}
        {animeContinueWatching.length > 0 && (
          <div className="mb-8">
            <AnimeContinueWatching />
          </div>
        )}

        {/* Video Continue Watching Section */}
        {continueWatchingVideos.length > 0 && (
          <div className="mb-8">
            <ContinueWatching />
          </div>
        )}
      </div>
    </div>
  )
}

export default ContinueWatchingPage

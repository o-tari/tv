import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '../store'
import { fetchTrendingVideos } from '../store/slices/videosSlice'
import { selectWatchHistory, selectWatchLater, selectSubscriptions } from '../store/slices/historySlice'
import { selectContinueWatching, selectVideoProgress } from '../store/slices/continueWatchingSlice'
import VideoGrid from '../components/VideoGrid'
import InfiniteScroll from '../components/InfiniteScroll'
import SearchBar from '../components/SearchBar'

const YouTubePage = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const hasInitialized = useRef(false)
  
  const {
    trendingVideos,
    trendingLoading,
    trendingError,
  } = useAppSelector((state) => state.videos)
  
  const watchHistory = useAppSelector(selectWatchHistory)
  const watchLater = useAppSelector(selectWatchLater)
  const subscriptions = useAppSelector(selectSubscriptions)
  const continueWatching = useAppSelector(selectContinueWatching)
  const videoProgress = useAppSelector(selectVideoProgress)

  useEffect(() => {
    if (trendingVideos.length === 0 && !hasInitialized.current && !trendingLoading) {
      hasInitialized.current = true
      dispatch(fetchTrendingVideos()) // Don't pass pageToken for initial load
    }
  }, [dispatch, trendingVideos.length, trendingLoading])

  // Reset initialization flag when data is cleared
  useEffect(() => {
    if (trendingVideos.length === 0) {
      hasInitialized.current = false
    }
  }, [trendingVideos.length])

  const loadMoreTrending = () => {
    // For now, we'll just reload the first page
    // In a real implementation, you'd need to track pagination
    if (!trendingLoading) {
      dispatch(fetchTrendingVideos()) // Don't pass pageToken for reload
    }
  }

  const handleSearch = (query: string) => {
    navigate(`/search?q=${encodeURIComponent(query)}`)
  }

  if (trendingError) {
    return (
      <div className="p-8 text-center">
        <div className="w-24 h-24 mx-auto mb-4 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
          <svg className="w-12 h-12 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Something went wrong
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {trendingError}
        </p>
        <button
          onClick={() => dispatch(fetchTrendingVideos())}
          className="btn-primary"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          YouTube
        </h1>

        {/* Search Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Search
          </h2>
          <div className="max-w-2xl">
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>

        {/* Continue Watching Section */}
        {continueWatching.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                ▶️ Continue Watching
              </h2>
              <button
                onClick={() => navigate('/continue-watching')}
                className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium"
              >
                More →
              </button>
            </div>
            <VideoGrid
              videos={continueWatching.slice(0, 8)}
              loading={false}
              videoProgress={videoProgress}
              showProgress={true}
            />
          </div>
        )}

        {/* Channels Section - Temporarily commented out */}
        {/* <ChannelsSection /> */}

        {/* Subscriptions Section */}
        {subscriptions.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                📺 Subscriptions
              </h2>
              <button
                onClick={() => navigate('/subscriptions')}
                className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium"
              >
                More →
              </button>
            </div>
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">
                {subscriptions.length} subscribed channel{subscriptions.length !== 1 ? 's' : ''}
              </p>
              <button
                onClick={() => navigate('/subscriptions')}
                className="mt-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium"
              >
                View Subscriptions →
              </button>
            </div>
          </div>
        )}

        {/* History Section */}
        {watchHistory.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                🕒 History
              </h2>
              <button
                onClick={() => navigate('/history')}
                className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium"
              >
                More →
              </button>
            </div>
            <VideoGrid
              videos={watchHistory.slice(0, 8)}
              loading={false}
            />
          </div>
        )}

        {/* Watch Later Section */}
        {watchLater.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                ⏰ Watch Later
              </h2>
              <button
                onClick={() => navigate('/watch-later')}
                className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium"
              >
                More →
              </button>
            </div>
            <VideoGrid
              videos={watchLater.slice(0, 8)}
              loading={false}
            />
          </div>
        )}

        {/* Trending Section */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            🔥 Trending Videos
          </h2>
          <InfiniteScroll
            onLoadMore={loadMoreTrending}
            hasMore={false}
            loading={trendingLoading}
          >
            <VideoGrid
              videos={trendingVideos}
              loading={trendingLoading && trendingVideos.length === 0}
            />
          </InfiniteScroll>
        </div>
      </div>
    </div>
  )
}

export default YouTubePage

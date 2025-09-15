import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '../store'
import { fetchTrendingVideos, clearCategoryCache } from '../store/slices/videosSlice'
import { selectWatchHistory, selectWatchLater } from '../store/slices/historySlice'
import { selectContinueWatching, selectVideoProgress, removeFromContinueWatching } from '../store/slices/continueWatchingSlice'
import VideoGrid from '../components/VideoGrid'
import InfiniteScroll from '../components/InfiniteScroll'
import SearchBar from '../components/SearchBar'
import ChannelsSection from '../components/ChannelsSection'
import CategorySection from '../components/CategorySection'

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

  const handleRemoveFromContinueWatching = (videoId: string, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    console.log('Removing video from continue watching:', videoId)
    dispatch(removeFromContinueWatching(videoId))
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
              onRemove={handleRemoveFromContinueWatching}
              showRemoveButton={true}
              excludeShorts={true}
            />
          </div>
        )}

        {/* Channels Section */}
        <ChannelsSection />



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
              excludeShorts={true}
            />
          </div>
        )}

        {/* Trending Section */}
        <div className="mb-8">
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
              excludeShorts={true}
            />
          </InfiniteScroll>
        </div>

        {/* Category Sections */}
        <CategorySection categoryId="23" categoryName="Comedy" emoji="😂" />
        <CategorySection categoryId="24" categoryName="Entertainment" emoji="🎭" />
        <CategorySection categoryId="28" categoryName="Science & Technology" emoji="🔬" />
        <CategorySection categoryId="1" categoryName="Film & Animation" emoji="🎬" />
        <CategorySection categoryId="20" categoryName="Gaming" emoji="🎮" />
        <CategorySection categoryId="10" categoryName="Music" emoji="🎵" />
        <CategorySection categoryId="15" categoryName="Pets & Animals" emoji="🐾" />
        <CategorySection categoryId="22" categoryName="People & Blogs" emoji="👥" />
        <CategorySection categoryId="25" categoryName="News & Politics" emoji="📰" />
        <CategorySection categoryId="26" categoryName="Howto & Style" emoji="💄" />
        <CategorySection categoryId="1" categoryName="Movies" emoji="🎞️" />
        <CategorySection categoryId="24" categoryName="Shows" emoji="📺" />
        <CategorySection categoryId="1" categoryName="Trailers" emoji="🎬" />
        <CategorySection categoryId="2" categoryName="Autos & Vehicles" emoji="🚗" />

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
              excludeShorts={true}
            />
          </div>
        )}

        {/* Cache Management Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              🗂️ Cache Management
            </h2>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Clear YouTube category cache to refresh all category sections with fresh data.
            </p>
            <button
              onClick={() => {
                // Clear only YouTube category caches
                const keysToRemove: string[] = []
                for (let i = 0; i < localStorage.length; i++) {
                  const key = localStorage.key(i)
                  if (key && key.includes('youtube_cache_category')) {
                    keysToRemove.push(key)
                  }
                }
                keysToRemove.forEach(key => localStorage.removeItem(key))
                
                // Clear Redux category state
                dispatch(clearCategoryCache())
                
                // Reload the page to refresh all category sections
                window.location.reload()
              }}
              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            >
              Clear Category Cache
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default YouTubePage

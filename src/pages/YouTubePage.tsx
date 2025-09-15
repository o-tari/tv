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
        <CategorySection 
          title="Comedy" 
          description="Funny videos and comedy content" 
          identifier="23" 
          limit={8} 
          showMoreButton={true} 
          onMoreClick={() => navigate('/search?category=23')} 
        />
        <CategorySection 
          title="Entertainment" 
          description="Movies, shows, and celebrity content" 
          identifier="24" 
          limit={8} 
          showMoreButton={true} 
          onMoreClick={() => navigate('/search?category=24')} 
        />
        <CategorySection 
          title="Science & Technology" 
          description="Discover the latest in tech and science" 
          identifier="28" 
          limit={8} 
          showMoreButton={true} 
          onMoreClick={() => navigate('/search?category=28')} 
        />
        <CategorySection 
          title="Film & Animation" 
          description="Movies, animations, and film content" 
          identifier="1" 
          limit={8} 
          showMoreButton={true} 
          onMoreClick={() => navigate('/search?category=1')} 
        />
        <CategorySection 
          title="Gaming" 
          description="Gaming content and live streams" 
          identifier="20" 
          limit={8} 
          showMoreButton={true} 
          onMoreClick={() => navigate('/search?category=20')} 
        />
        <CategorySection 
          title="Music" 
          description="Latest music videos and songs" 
          identifier="10" 
          limit={8} 
          showMoreButton={true} 
          onMoreClick={() => navigate('/search?category=10')} 
        />
        <CategorySection 
          title="Pets & Animals" 
          description="Cute animals and pet content" 
          identifier="15" 
          limit={8} 
          showMoreButton={true} 
          onMoreClick={() => navigate('/search?category=15')} 
        />
        <CategorySection 
          title="People & Blogs" 
          description="Personal vlogs and lifestyle content" 
          identifier="22" 
          limit={8} 
          showMoreButton={true} 
          onMoreClick={() => navigate('/search?category=22')} 
        />
        <CategorySection 
          title="News & Politics" 
          description="Latest news and current events" 
          identifier="25" 
          limit={8} 
          showMoreButton={true} 
          onMoreClick={() => navigate('/search?category=25')} 
        />
        <CategorySection 
          title="Howto & Style" 
          description="Tutorials and style guides" 
          identifier="26" 
          limit={8} 
          showMoreButton={true} 
          onMoreClick={() => navigate('/search?category=26')} 
        />
        <CategorySection 
          title="Movies" 
          description="Full movies and film content" 
          identifier="1" 
          limit={8} 
          showMoreButton={true} 
          onMoreClick={() => navigate('/search?category=1')} 
        />
        <CategorySection 
          title="Shows" 
          description="TV shows and series" 
          identifier="24" 
          limit={8} 
          showMoreButton={true} 
          onMoreClick={() => navigate('/search?category=24')} 
        />
        <CategorySection 
          title="Trailers" 
          description="Movie and show trailers" 
          identifier="1" 
          limit={8} 
          showMoreButton={true} 
          onMoreClick={() => navigate('/search?category=1')} 
        />
        <CategorySection 
          title="Autos & Vehicles" 
          description="Car reviews and automotive content" 
          identifier="2" 
          limit={8} 
          showMoreButton={true} 
          onMoreClick={() => navigate('/search?category=2')} 
        />

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

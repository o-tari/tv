import { useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '../store'
import { fetchTrendingVideos } from '../store/slices/videosSlice'
import VideoGrid from '../components/VideoGrid'
import InfiniteScroll from '../components/InfiniteScroll'
import ContinueWatching from '../components/ContinueWatching'
import WatchLater from '../components/WatchLater'
import CategorySection from '../components/CategorySection'

const HomePage = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const hasInitialized = useRef(false)
  const {
    trendingVideos,
    trendingLoading,
    trendingError,
    trendingNextPageToken,
  } = useAppSelector((state) => state.videos)

  useEffect(() => {
    if (trendingVideos.length === 0 && !hasInitialized.current && !trendingLoading) {
      hasInitialized.current = true
      dispatch(fetchTrendingVideos())
    }
  }, [dispatch, trendingVideos.length, trendingLoading])

  // Reset initialization flag when data is cleared
  useEffect(() => {
    if (trendingVideos.length === 0) {
      hasInitialized.current = false
    }
  }, [trendingVideos.length])

  const loadMore = useCallback(() => {
    if (trendingNextPageToken && !trendingLoading) {
      dispatch(fetchTrendingVideos(trendingNextPageToken))
    }
  }, [dispatch, trendingNextPageToken, trendingLoading])

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
      {/* Continue Watching Section */}
      <ContinueWatching 
        limit={4} 
        showMoreButton={true} 
        onMoreClick={() => navigate('/continue-watching')} 
      />

      {/* Watch Later Section */}
      <WatchLater 
        limit={4} 
        showMoreButton={true} 
        onMoreClick={() => navigate('/watch-later')} 
      />

      {/* Music Section */}
      <CategorySection
        title="Music"
        description="Latest music videos and songs"
        type="category"
        identifier="10"
        limit={8}
        showMoreButton={true}
        onMoreClick={() => navigate('/search?q=music')}
      />

      {/* Gaming Section */}
      <CategorySection
        title="Gaming"
        description="Gaming content and live streams"
        type="category"
        identifier="20"
        limit={8}
        showMoreButton={true}
        onMoreClick={() => navigate('/search?q=gaming')}
      />

      {/* News Section */}
      <CategorySection
        title="News"
        description="Latest news and current events"
        type="category"
        identifier="25"
        limit={8}
        showMoreButton={true}
        onMoreClick={() => navigate('/search?q=news')}
      />

      {/* Education Section */}
      <CategorySection
        title="Education"
        description="Learn something new today"
        type="category"
        identifier="26"
        limit={8}
        showMoreButton={true}
        onMoreClick={() => navigate('/search?q=education')}
      />

      {/* Science & Technology Section */}
      <CategorySection
        title="Science & Technology"
        description="Discover the latest in tech and science"
        type="category"
        identifier="27"
        limit={8}
        showMoreButton={true}
        onMoreClick={() => navigate('/search?q=science')}
      />

      {/* Comedy Section */}
      <CategorySection
        title="Comedy"
        description="Laugh out loud with the best comedy"
        type="category"
        identifier="30"
        limit={8}
        showMoreButton={true}
        onMoreClick={() => navigate('/search?q=comedy')}
      />

      {/* Entertainment Section */}
      <CategorySection
        title="Entertainment"
        description="Movies, shows, and celebrity content"
        type="category"
        identifier="31"
        limit={8}
        showMoreButton={true}
        onMoreClick={() => navigate('/search?q=entertainment')}
      />

      {/* Lifestyle Section */}
      <CategorySection
        title="Lifestyle"
        description="Fashion, beauty, health, and fitness"
        type="category"
        identifier="32"
        limit={8}
        showMoreButton={true}
        onMoreClick={() => navigate('/search?q=lifestyle')}
      />

      {/* Travel Section */}
      <CategorySection
        title="Travel"
        description="Explore the world through travel content"
        type="category"
        identifier="29"
        limit={8}
        showMoreButton={true}
        onMoreClick={() => navigate('/search?q=travel')}
      />

      {/* Trending Section */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Trending
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          The most popular videos on TV right now
        </p>
      </div>

      <InfiniteScroll
        onLoadMore={loadMore}
        hasMore={!!trendingNextPageToken}
        loading={trendingLoading}
      >
        <VideoGrid
          videos={trendingVideos}
          loading={trendingLoading && trendingVideos.length === 0}
        />
      </InfiniteScroll>
    </div>
  )
}

export default HomePage

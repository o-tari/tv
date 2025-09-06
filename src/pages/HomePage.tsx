import { useEffect, useCallback } from 'react'
import { useAppSelector, useAppDispatch } from '../store'
import { fetchTrendingVideos } from '../store/slices/videosSlice'
import VideoGrid from '../components/VideoGrid'
import InfiniteScroll from '../components/InfiniteScroll'

const HomePage = () => {
  const dispatch = useAppDispatch()
  const {
    trendingVideos,
    trendingLoading,
    trendingError,
    trendingNextPageToken,
  } = useAppSelector((state) => state.videos)

  useEffect(() => {
    if (trendingVideos.length === 0) {
      dispatch(fetchTrendingVideos())
    }
  }, [dispatch, trendingVideos.length])

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

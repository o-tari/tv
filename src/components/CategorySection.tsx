import React from 'react'
import { useAppSelector, useAppDispatch } from '../store'
import { fetchVideosByCategory } from '../store/slices/videosSlice'
import VideoGrid from './VideoGrid'
import LoadingSpinner from './LoadingSpinner'

interface CategorySectionProps {
  categoryId: string
  categoryName: string
  emoji: string
  maxVideos?: number
}

const CategorySection: React.FC<CategorySectionProps> = ({
  categoryId,
  categoryName,
  emoji,
  maxVideos = 8
}) => {
  const dispatch = useAppDispatch()
  const categoryData = useAppSelector((state) => state.videos.categoryVideos[categoryId])

  React.useEffect(() => {
    // Only fetch if we don't have data yet
    if (!categoryData) {
      dispatch(fetchVideosByCategory({ categoryId }))
    }
  }, [dispatch, categoryId, categoryData])

  const videos = categoryData?.videos || []
  const loading = categoryData?.loading || false
  const error = categoryData?.error

  // Don't render if there's an error or no videos yet
  if (error || (!loading && videos.length === 0)) {
    return null
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {emoji} {categoryName}
        </h2>
        {videos.length > 0 && (
          <button
            onClick={() => {
              // Navigate to search page with category filter
              const searchParams = new URLSearchParams()
              searchParams.set('category', categoryId)
              window.location.href = `/search?${searchParams.toString()}`
            }}
            className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium"
          >
            More →
          </button>
        )}
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : (
        <VideoGrid
          videos={videos.slice(0, maxVideos)}
          loading={false}
          excludeShorts={true}
        />
      )}
    </div>
  )
}

export default CategorySection
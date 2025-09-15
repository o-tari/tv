import React from 'react'
import { useAppSelector, useAppDispatch } from '../store'
import { fetchVideosByCategory } from '../store/slices/videosSlice'
import VideoGrid from './VideoGrid'
import LoadingSpinner from './LoadingSpinner'

interface CategorySectionProps {
  title: string
  description: string
  identifier: string
  limit: number
  showMoreButton: boolean
  onMoreClick: () => void | Promise<void>
}

const CategorySection: React.FC<CategorySectionProps> = ({
  title,
  description,
  identifier,
  limit,
  showMoreButton,
  onMoreClick
}) => {
  const dispatch = useAppDispatch()
  const categoryData = useAppSelector((state) => state.videos.categoryVideos[identifier])

  React.useEffect(() => {
    // Only fetch if we don't have data yet
    if (!categoryData) {
      dispatch(fetchVideosByCategory({ categoryId: identifier }))
    }
  }, [dispatch, identifier, categoryData])

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
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {description}
          </p>
        </div>
        {showMoreButton && videos.length > 0 && (
          <button
            onClick={onMoreClick}
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
          videos={videos.slice(0, limit)}
          loading={false}
          excludeShorts={true}
        />
      )}
    </div>
  )
}

export default CategorySection
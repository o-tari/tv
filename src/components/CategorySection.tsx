import { useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '../store'
import { fetchVideosByCategory, fetchVideosByQuery } from '../store/slices/videosSlice'
import VideoGrid from './VideoGrid'
import LoadingSpinner from './LoadingSpinner'

interface CategorySectionProps {
  title: string
  description?: string
  type: 'category' | 'query'
  identifier: string // categoryId or query string
  limit?: number
  showMoreButton?: boolean
  onMoreClick?: () => void
  order?: string
}

const CategorySection = ({
  title,
  description,
  type,
  identifier,
  limit = 8,
  showMoreButton = false,
  onMoreClick,
  order = 'relevance'
}: CategorySectionProps) => {
  const dispatch = useAppDispatch()
  
  const categoryVideos = useAppSelector((state) => state.videos.categoryVideos[identifier])
  const queryVideos = useAppSelector((state) => state.videos.queryVideos[identifier])
  
  const sectionData = type === 'category' ? categoryVideos : queryVideos
  const { videos = [], loading = false, error = null } = sectionData || {}

  useEffect(() => {
    if (videos.length === 0 && !loading) {
      if (type === 'category') {
        dispatch(fetchVideosByCategory({ categoryId: identifier }))
      } else {
        dispatch(fetchVideosByQuery({ query: identifier, order }))
      }
    }
  }, [dispatch, identifier, type, order, videos.length, loading])

  const displayedVideos = videos.slice(0, limit)

  if (error) {
    return (
      <div className="mb-8">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
            {title}
          </h2>
          {description && (
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {description}
            </p>
          )}
        </div>
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <p className="text-red-600 dark:text-red-400 text-sm">
            Failed to load {title.toLowerCase()}: {error}
          </p>
        </div>
      </div>
    )
  }

  if (loading && videos.length === 0) {
    return (
      <div className="mb-8">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
            {title}
          </h2>
          {description && (
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {description}
            </p>
          )}
        </div>
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  if (displayedVideos.length === 0) {
    return null
  }

  return (
    <div className="mb-8">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
            {title}
          </h2>
          {description && (
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {description}
            </p>
          )}
        </div>
        {showMoreButton && onMoreClick && (
          <button
            onClick={onMoreClick}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium transition-colors"
          >
            See all
          </button>
        )}
      </div>
      
      <VideoGrid
        videos={displayedVideos}
        loading={loading && videos.length === 0}
      />
    </div>
  )
}

export default CategorySection

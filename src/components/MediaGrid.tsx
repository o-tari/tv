import { type Media } from '../types/anime'
import MediaCard from './MediaCard'
import MediaCardSkeleton from './MediaCardSkeleton'

interface MediaGridProps {
  media: Media[]
  loading?: boolean
  variant?: 'default' | 'compact' | 'large'
}

const MediaGrid = ({
  media,
  loading = false,
  variant = 'default'
}: MediaGridProps) => {
  const getGridCols = () => {
    // Use responsive grid classes that adapt to screen size
    if (variant === 'compact') {
      return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'
    }
    if (variant === 'large') {
      return 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'
    }
    // Default variant - more responsive
    return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'
  }

  const getGap = () => {
    switch (variant) {
      case 'compact': return 'gap-2'
      case 'large': return 'gap-6'
      default: return 'gap-4'
    }
  }

  if (loading) {
    return (
      <div className={`grid ${getGridCols()} ${getGap()}`}>
        {Array.from({ length: 12 }).map((_, index) => (
          <MediaCardSkeleton key={index} variant={variant} />
        ))}
      </div>
    )
  }

  if (media.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No media found
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Try adjusting your search or filters
        </p>
      </div>
    )
  }

  return (
    <div className={`grid ${getGridCols()} ${getGap()}`}>
      {media.map((item) => (
        <MediaCard key={item.id} media={item} variant={variant} />
      ))}
    </div>
  )
}

export default MediaGrid

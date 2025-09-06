interface VideoCardSkeletonProps {
  variant?: 'default' | 'compact' | 'large'
}

const VideoCardSkeleton = ({ variant = 'default' }: VideoCardSkeletonProps) => {
  if (variant === 'compact') {
    return (
      <div className="flex space-x-3 animate-pulse">
        <div className="flex-shrink-0">
          <div className="w-40 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
        <div className="flex-1 min-w-0 space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
        </div>
      </div>
    )
  }

  if (variant === 'large') {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="w-full aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        <div className="space-y-2">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-4/5"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        </div>
      </div>
    )
  }

  // Default variant
  return (
    <div className="space-y-3 animate-pulse">
      <div className="w-full aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0"></div>
          <div className="flex-1 min-w-0 space-y-1">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoCardSkeleton

interface MediaCardSkeletonProps {
  variant?: 'default' | 'compact' | 'large'
}

const MediaCardSkeleton = ({ variant = 'default' }: MediaCardSkeletonProps) => {
  if (variant === 'compact') {
    return (
      <div className="flex space-x-3 animate-pulse">
        <div className="w-40 h-24 bg-gray-300 dark:bg-gray-600 rounded-lg flex-shrink-0"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
        </div>
      </div>
    )
  }

  if (variant === 'large') {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="w-full h-48 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
        <div className="space-y-3">
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-4/5"></div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Default variant
  return (
    <div className="space-y-3 animate-pulse">
      <div className="w-full aspect-video bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex-shrink-0"></div>
          <div className="flex-1 space-y-1">
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MediaCardSkeleton

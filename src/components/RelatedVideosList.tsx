import { Link } from 'react-router-dom'
import { type Video } from '../types/youtube'
import { formatNumber } from '../utils/formatNumber'
import { formatDuration } from '../utils/formatTime'

interface RelatedVideosListProps {
  videos: Video[]
  loading?: boolean
  error?: string | null
  onRetry?: () => void
}

const RelatedVideosList = ({ videos, loading, error, onRetry }: RelatedVideosListProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="flex flex-col space-y-2 animate-pulse">
            <div className="w-full aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-red-600 dark:text-red-400 text-sm mb-2">
          Failed to load related videos
        </p>
        <p className="text-gray-500 dark:text-gray-400 text-xs mb-3">
          {error}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="btn-primary text-sm"
          >
            Try again
          </button>
        )}
      </div>
    )
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          No related videos found
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {videos.map((video) => (
        <Link
          key={video.id}
          to={`/watch/${video.id}`}
          className="block group"
        >
          <div className="flex flex-col space-y-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg p-2 transition-colors">
            {/* Thumbnail */}
            <div className="relative">
              <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-90"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = '/placeholder-movie.svg'
                  }}
                />
                {/* Duration overlay */}
                {video.duration && (
                  <span className="absolute bottom-1 right-1 bg-black bg-opacity-80 text-white text-xs px-1 py-0.5 rounded">
                    {formatDuration(video.duration)}
                  </span>
                )}
              </div>
            </div>

            {/* Video info */}
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 line-clamp-2">
                {video.title}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                {video.channelTitle}
              </p>
              <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                {video.viewCount && (
                  <span>{formatNumber(parseInt(video.viewCount))} views</span>
                )}
                {video.publishedAt && (
                  <span>•</span>
                )}
                {video.publishedAt && (
                  <span>
                    {new Date(video.publishedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

export default RelatedVideosList

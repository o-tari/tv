import { memo } from 'react'
import { Link } from 'react-router-dom'
import { type Video } from '../types/youtube'
import { formatDuration } from '../utils/formatTime'
import { formatViewCount } from '../utils/formatNumber'
import LazyImage from './LazyImage'

interface VideoCardProps {
  video: Video
  variant?: 'default' | 'compact' | 'large'
}

const VideoCard = memo(({ video, variant = 'default' }: VideoCardProps) => {
  const getTimeAgo = (publishedAt: string) => {
    const now = new Date()
    const published = new Date(publishedAt)
    const diffInSeconds = Math.floor((now.getTime() - published.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`
    return `${Math.floor(diffInSeconds / 31536000)} years ago`
  }

  if (variant === 'compact') {
    return (
      <Link to={`/watch/${video.id}`} className="block group">
        <div className="flex space-x-3">
          <div className="relative flex-shrink-0">
            <LazyImage
              src={video.thumbnail}
              alt={video.title}
              className="w-40 h-24 object-cover rounded-lg"
              placeholder="📹"
            />
            <span className="absolute bottom-1 right-1 bg-black bg-opacity-80 text-white text-xs px-1 py-0.5 rounded">
              {formatDuration(video.duration)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 line-clamp-2">
              {video.title}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {video.channelTitle}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {formatViewCount(video.viewCount)} • {getTimeAgo(video.publishedAt)}
            </p>
          </div>
        </div>
      </Link>
    )
  }

  if (variant === 'large') {
    return (
      <Link to={`/watch/${video.id}`} className="block group">
        <div className="space-y-3">
          <div className="relative">
            <LazyImage
              src={video.thumbnail}
              alt={video.title}
              className="w-full aspect-video object-cover rounded-lg"
              placeholder="📹"
            />
            <span className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-sm px-2 py-1 rounded">
              {formatDuration(video.duration)}
            </span>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 line-clamp-2">
              {video.title}
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <span>{video.channelTitle}</span>
              <span>•</span>
              <span>{formatViewCount(video.viewCount)}</span>
              <span>•</span>
              <span>{getTimeAgo(video.publishedAt)}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {video.description}
            </p>
          </div>
        </div>
      </Link>
    )
  }

  // Default variant
  return (
    <Link to={`/watch/${video.id}`} className="block group">
    <div className="space-y-3">
      <div className="relative">
        <LazyImage
          src={video.thumbnail}
          alt={video.title}
          className="w-full aspect-video object-cover rounded-lg"
          placeholder="📹"
        />
          <span className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-1.5 py-0.5 rounded">
            {formatDuration(video.duration)}
          </span>
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 line-clamp-2">
            {video.title}
          </h3>
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex-shrink-0"></div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                {video.channelTitle}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {formatViewCount(video.viewCount)} • {getTimeAgo(video.publishedAt)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
})

VideoCard.displayName = 'VideoCard'

export default VideoCard

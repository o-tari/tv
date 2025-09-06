import { Link } from 'react-router-dom'
import { formatViewCount } from '../utils/formatNumber'
import LazyImage from './LazyImage'

interface TMDBMediaCardProps {
  id: number
  title: string
  thumbnail: string | null
  duration?: number | null
  viewCount?: number
  publishedAt?: string
  channelTitle?: string | null
  type: 'movie' | 'tv'
  rating?: number
  overview?: string
  variant?: 'default' | 'compact' | 'large'
}

const TMDBMediaCard = ({
  id,
  title,
  thumbnail,
  duration,
  viewCount,
  publishedAt,
  channelTitle,
  type,
  rating,
  overview,
  variant = 'default'
}: TMDBMediaCardProps) => {
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

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}:${mins.toString().padStart(2, '0')}` : `${mins}m`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getMediaUrl = () => {
    return `/tmdb-watch/${type}/${id}`
  }

  const getImageSrc = () => {
    if (thumbnail) {
      return `https://image.tmdb.org/t/p/w500${thumbnail}`
    }
    return '/placeholder-movie.svg'
  }

  const renderDefaultCard = () => (
    <Link to={getMediaUrl()} className="block group max-w-sm">
      <div className="space-y-3">
        <div className="relative">
          <LazyImage
            src={getImageSrc()}
            alt={title}
            className="w-full aspect-[3/4] object-cover rounded-lg"
            placeholder="🎬"
          />
          {duration && (
            <span className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-1.5 py-0.5 rounded">
              {formatDuration(duration)}
            </span>
          )}
          {rating && (
            <span className="absolute top-2 right-2 bg-black bg-opacity-80 text-white text-xs px-1.5 py-0.5 rounded flex items-center">
              <span className="text-yellow-400 mr-1">★</span>
              {rating.toFixed(1)}
            </span>
          )}
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 line-clamp-2">
            {title}
          </h3>
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex-shrink-0 flex items-center justify-center">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {type === 'movie' ? '🎬' : '📺'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                {type === 'movie' ? 'Movie' : 'TV Show'}
              </p>
              <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-500">
                {viewCount && (
                  <span>{formatViewCount(viewCount)} votes</span>
                )}
                {publishedAt && (
                  <>
                    <span>•</span>
                    <span>{formatDate(publishedAt)}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )

  const renderCompactCard = () => (
    <Link to={getMediaUrl()} className="block group max-w-md">
      <div className="flex space-x-3">
        <div className="relative flex-shrink-0">
          <LazyImage
            src={getImageSrc()}
            alt={title}
            className="w-32 aspect-[3/4] object-cover rounded-lg"
            placeholder="🎬"
          />
          {rating && (
            <span className="absolute top-1 right-1 bg-black bg-opacity-80 text-white text-xs px-1 py-0.5 rounded flex items-center">
              <span className="text-yellow-400 mr-1">★</span>
              {rating.toFixed(1)}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 line-clamp-2">
            {title}
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {type === 'movie' ? 'Movie' : 'TV Show'}
          </p>
          <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-500">
            {viewCount && (
              <span>{formatViewCount(viewCount)} votes</span>
            )}
            {publishedAt && (
              <>
                <span>•</span>
                <span>{formatDate(publishedAt)}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  )

  const renderLargeCard = () => (
    <Link to={getMediaUrl()} className="block group max-w-lg">
      <div className="space-y-4">
        <div className="relative">
          <LazyImage
            src={getImageSrc()}
            alt={title}
            className="w-full aspect-[3/4] object-cover rounded-lg"
            placeholder="🎬"
          />
          {duration && (
            <span className="absolute bottom-3 right-3 bg-black bg-opacity-80 text-white text-sm px-2 py-1 rounded">
              {formatDuration(duration)}
            </span>
          )}
          {rating && (
            <span className="absolute top-3 right-3 bg-black bg-opacity-80 text-white text-sm px-2 py-1 rounded flex items-center">
              <span className="text-yellow-400 mr-1">★</span>
              {rating.toFixed(1)}
            </span>
          )}
        </div>
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 line-clamp-2">
            {title}
          </h3>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex-shrink-0 flex items-center justify-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {type === 'movie' ? '🎬' : '📺'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {type === 'movie' ? 'Movie' : 'TV Show'}
              </p>
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-500">
                {viewCount && (
                  <span>{formatViewCount(viewCount)} votes</span>
                )}
                {publishedAt && (
                  <>
                    <span>•</span>
                    <span>{formatDate(publishedAt)}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          {overview && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
              {overview}
            </p>
          )}
        </div>
      </div>
    </Link>
  )

  if (variant === 'compact') {
    return renderCompactCard()
  }

  if (variant === 'large') {
    return renderLargeCard()
  }

  return renderDefaultCard()
}

export default TMDBMediaCard

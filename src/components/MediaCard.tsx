import { Link } from 'react-router-dom'
import { type Media, type VideoMedia, type AnimeMedia } from '../types/anime'
import { formatViewCount } from '../utils/formatNumber'
import { formatDuration } from '../utils/formatTime'
import LazyImage from './LazyImage'

interface MediaCardProps {
  media: Media
  variant?: 'default' | 'compact' | 'large'
}

const MediaCard = ({ media, variant = 'default' }: MediaCardProps) => {
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

  const handleChannelClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Handle channel navigation for videos
  }

  const getMediaUrl = () => {
    if (media.type === 'video') {
      return `/watch/${media.id}`
    } else {
      return `/anime/${media.id}`
    }
  }

  const renderVideoCard = (video: VideoMedia) => (
    <Link to={getMediaUrl()} className="block group max-w-sm">
      <div className="space-y-3">
        <div className="relative">
          <LazyImage
            src={video.image}
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
              <button
                onClick={handleChannelClick}
                className="text-xs text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors truncate text-left"
              >
                {video.channelTitle}
              </button>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {formatViewCount(video.viewCount)} • {getTimeAgo(video.publishedAt)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )

  const renderAnimeCard = (anime: AnimeMedia) => (
    <Link to={getMediaUrl()} className="block group max-w-sm">
      <div className="space-y-3">
        <div className="relative">
          <LazyImage
            src={anime.image}
            alt={anime.title}
            className="w-full aspect-[3/4] object-cover rounded-lg"
            placeholder="🎌"
          />
          {anime.totalEpisodes && (
            <span className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-1.5 py-0.5 rounded">
              {anime.totalEpisodes} eps
            </span>
          )}
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 line-clamp-2">
            {anime.title}
          </h3>
          <div className="flex flex-col space-y-1">
            {anime.genres && anime.genres.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {anime.genres.slice(0, 2).map((genre, index) => (
                  <span
                    key={index}
                    className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}
            {anime.status && (
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {anime.status}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  )

  if (variant === 'compact') {
    return (
      <Link to={getMediaUrl()} className="block group max-w-md">
        <div className="flex space-x-3">
          <div className="relative flex-shrink-0">
            <LazyImage
              src={media.image}
              alt={media.title}
              className="w-40 aspect-video object-cover rounded-lg"
              placeholder={media.type === 'video' ? '📹' : '🎌'}
            />
            {media.type === 'video' && 'duration' in media && (
              <span className="absolute bottom-1 right-1 bg-black bg-opacity-80 text-white text-xs px-1 py-0.5 rounded">
                {formatDuration(media.duration)}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 line-clamp-2">
              {media.title}
            </h3>
            {media.type === 'video' && 'channelTitle' in media && (
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {media.channelTitle}
              </p>
            )}
            {media.type === 'anime' && 'genres' in media && media.genres && (
              <div className="flex flex-wrap gap-1">
                {media.genres.slice(0, 2).map((genre, index) => (
                  <span
                    key={index}
                    className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1 py-0.5 rounded"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </Link>
    )
  }

  if (variant === 'large') {
    return (
      <Link to={getMediaUrl()} className="block group max-w-lg">
        <div className="space-y-4">
          <div className="relative">
            <LazyImage
              src={media.image}
              alt={media.title}
              className="w-full aspect-video object-cover rounded-lg"
              placeholder={media.type === 'video' ? '📹' : '🎌'}
            />
            {media.type === 'video' && 'duration' in media && (
              <span className="absolute bottom-3 right-3 bg-black bg-opacity-80 text-white text-sm px-2 py-1 rounded">
                {formatDuration(media.duration)}
              </span>
            )}
          </div>
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 line-clamp-2">
              {media.title}
            </h3>
            {media.type === 'video' && 'channelTitle' in media && (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <button
                    onClick={handleChannelClick}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors truncate text-left"
                  >
                    {media.channelTitle}
                  </button>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    {formatViewCount(media.viewCount)} • {getTimeAgo(media.publishedAt)}
                  </p>
                </div>
              </div>
            )}
            {media.type === 'anime' && 'genres' in media && media.genres && (
              <div className="flex flex-wrap gap-2">
                {media.genres.slice(0, 3).map((genre, index) => (
                  <span
                    key={index}
                    className="text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </Link>
    )
  }

  // Default variant
  return media.type === 'video' ? renderVideoCard(media as VideoMedia) : renderAnimeCard(media as AnimeMedia)
}

export default MediaCard

import { Link } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '../store'
import { type Media, type VideoMedia, type AnimeMedia, type HiAnimeMedia } from '../types/anime'
import { type Channel } from '../types/youtube'
import { formatViewCount } from '../utils/formatNumber'
import { formatDuration } from '../utils/formatTime'
import { getAnimeImage, getImageUrl } from '../utils/imageProxy'
import { addChannel, selectIsChannelSaved } from '../store/slices/channelsSlice'
import { fetchChannelDetails } from '../store/slices/videosSlice'
import LazyImage from './LazyImage'

interface MediaCardProps {
  media: Media
  variant?: 'default' | 'compact' | 'large'
  searchType?: 'video' | 'channel' | 'playlist'
  progress?: number // Progress percentage (0-100)
  showProgress?: boolean // Whether to show progress indicator
  onRemove?: (mediaId: string, event: React.MouseEvent) => void // Remove button handler
  showRemoveButton?: boolean // Whether to show remove button
}

const MediaCard = ({ media, variant = 'default', searchType, progress, showProgress = false, onRemove, showRemoveButton = false }: MediaCardProps) => {
  const dispatch = useAppDispatch()
  const isChannelSaved = useAppSelector(selectIsChannelSaved(media.type === 'video' ? media.channelId : ''))
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

  const handleAddChannel = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (media.type === 'video') {
      try {
        // Fetch full channel details from API
        const channelDetails = await dispatch(fetchChannelDetails(media.channelId)).unwrap()
        dispatch(addChannel(channelDetails))
      } catch (error) {
        // Fallback to basic channel info if API fails
        const channel: Channel = {
          id: media.channelId,
          title: media.channelTitle,
          description: '',
          thumbnail: '',
          subscriberCount: '0',
          videoCount: '0',
          viewCount: '0'
        }
        dispatch(addChannel(channel))
      }
    }
  }

  const getMediaUrl = () => {
    if (media.type === 'video') {
      return `/watch/${media.id}`
    } else if (media.type === 'hianime') {
      return `/hianime/${media.id}`
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
          {showProgress && progress !== undefined && progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-600 bg-opacity-50">
              <div 
                className="h-full bg-red-600 transition-all duration-300"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          )}
          {searchType === 'channel' && (
            <button
              onClick={handleAddChannel}
              className={`absolute top-2 right-2 p-2 rounded-full transition-colors ${
                isChannelSaved
                  ? 'bg-green-600 text-white'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
              title={isChannelSaved ? 'Channel saved' : 'Add channel'}
            >
              {isChannelSaved ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              )}
            </button>
          )}
          {showRemoveButton && onRemove && (
            <button
              onClick={(e) => onRemove(video.id, e)}
              className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg"
              aria-label="Remove from Continue Watching"
              title="Remove from Continue Watching"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
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

  const renderAnimeCard = (anime: AnimeMedia | HiAnimeMedia) => {
    // Use the image proxy utility to handle CORS issues
    const imageSrc = getAnimeImage(anime.image, anime.title, 'medium')
    
    return (
      <Link to={getMediaUrl()} className="block group max-w-sm">
        <div className="space-y-3">
          <div className="relative">
            <LazyImage
              src={imageSrc}
              alt={anime.title}
              className="w-full aspect-[3/4] object-cover rounded-lg"
              placeholder="🎌"
            />
          <div className="absolute bottom-2 right-2 flex flex-col gap-1">
            {anime.totalEpisodes && (
              <span className="bg-black bg-opacity-80 text-white text-xs px-1.5 py-0.5 rounded">
                {anime.totalEpisodes} eps
              </span>
            )}
            {'score' in anime && anime.score && (
              <span className="bg-yellow-600 bg-opacity-90 text-white text-xs px-1.5 py-0.5 rounded">
                ⭐ {anime.score}
              </span>
            )}
            {'rating' in anime && anime.rating && (
              <span className="bg-yellow-600 bg-opacity-90 text-white text-xs px-1.5 py-0.5 rounded">
                ⭐ {anime.rating}
              </span>
            )}
          </div>
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
            <div className="flex flex-col space-y-1">
              {anime.status && (
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {anime.status}
                </p>
              )}
              {'year' in anime && anime.year && (
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {anime.year}
                </p>
              )}
              {anime.rank && (
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Rank #{anime.rank}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
    )
  }

  if (variant === 'compact') {
    const imageSrc = getImageUrl(media.image, media.title, media.type, 'small')
    
    return (
      <Link to={getMediaUrl()} className="block group max-w-md">
        <div className="flex space-x-3">
          <div className="relative flex-shrink-0">
            <LazyImage
              src={imageSrc}
              alt={media.title}
              className="w-40 aspect-video object-cover rounded-lg"
              placeholder={media.type === 'video' ? '📹' : media.type === 'hianime' ? '🌸' : '🎌'}
            />
            {media.type === 'video' && 'duration' in media && (
              <span className="absolute bottom-1 right-1 bg-black bg-opacity-80 text-white text-xs px-1 py-0.5 rounded">
                {formatDuration(media.duration)}
              </span>
            )}
            {showProgress && progress !== undefined && progress > 0 && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-600 bg-opacity-50">
                <div 
                  className="h-full bg-red-600 transition-all duration-300"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            )}
            {showRemoveButton && onRemove && (
              <button
                onClick={(e) => onRemove(media.id, e)}
                className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg"
                aria-label="Remove from Continue Watching"
                title="Remove from Continue Watching"
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
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
    const imageSrc = getImageUrl(media.image, media.title, media.type, 'large')
    
    return (
      <Link to={getMediaUrl()} className="block group max-w-lg">
        <div className="space-y-4">
          <div className="relative">
            <LazyImage
              src={imageSrc}
              alt={media.title}
              className="w-full aspect-video object-cover rounded-lg"
              placeholder={media.type === 'video' ? '📹' : media.type === 'hianime' ? '🌸' : '🎌'}
            />
            {media.type === 'video' && 'duration' in media && (
              <span className="absolute bottom-3 right-3 bg-black bg-opacity-80 text-white text-sm px-2 py-1 rounded">
                {formatDuration(media.duration)}
              </span>
            )}
            {showProgress && progress !== undefined && progress > 0 && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-600 bg-opacity-50">
                <div 
                  className="h-full bg-red-600 transition-all duration-300"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            )}
            {showRemoveButton && onRemove && (
              <button
                onClick={(e) => onRemove(media.id, e)}
                className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg"
                aria-label="Remove from Continue Watching"
                title="Remove from Continue Watching"
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
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
  if (media.type === 'video') {
    return renderVideoCard(media as VideoMedia)
  } else if (media.type === 'hianime') {
    return renderAnimeCard(media as HiAnimeMedia)
  } else {
    return renderAnimeCard(media as AnimeMedia)
  }
}

export default MediaCard

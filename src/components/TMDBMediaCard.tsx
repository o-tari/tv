import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../store'
import { addMovieToContinueWatching, addTVToContinueWatching } from '../store/slices/tmdbContinueWatchingSlice'
import { addToWatchLater, removeFromWatchLater, selectIsInWatchLater } from '../store/slices/tmdbWatchLaterSlice'
import { formatViewCount } from '../utils/formatNumber'
import { FilmIcon, TvIcon } from '@heroicons/react/24/outline'
import LazyImage from './LazyImage'
import YouTubePlayerModal from './YouTubePlayerModal'
import type { TMDBContent } from '../types/tmdb'

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
  content?: TMDBContent // Full content object for continue watching
  trailerVideoId?: string | null // YouTube video ID for trailer
}

const TMDBMediaCard = ({
  id,
  title,
  thumbnail,
  duration,
  viewCount,
  publishedAt,
  type,
  rating,
  overview,
  variant = 'default',
  content,
  trailerVideoId
}: TMDBMediaCardProps) => {
  const dispatch = useAppDispatch()
  const isInWatchLater = useAppSelector(selectIsInWatchLater(id, type))
  const [trailerModalOpen, setTrailerModalOpen] = useState(false)

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

  const handleClick = () => {
    if (content) {
      if (type === 'movie') {
        dispatch(addMovieToContinueWatching({ content, type: 'movie' }))
      } else if (type === 'tv') {
        dispatch(addTVToContinueWatching({ content, type: 'tv' }))
      }
    }
  }

  const handleWatchLaterClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (content) {
      if (isInWatchLater) {
        dispatch(removeFromWatchLater(`${type}-${id}`))
      } else {
        dispatch(addToWatchLater({ content, type }))
      }
    }
  }

  const getImageSrc = () => {
    if (thumbnail) {
      return `https://image.tmdb.org/t/p/w500${thumbnail}`
    }
    return '/placeholder-movie.svg'
  }

  const renderDefaultCard = () => (
    <Link to={getMediaUrl()} onClick={handleClick} className="block group max-w-sm">
      <div className="space-y-3">
        <div className="relative">
          <LazyImage
            src={getImageSrc()}
            alt={title}
            className="w-full aspect-[3/4] object-cover rounded-lg"
            placeholder={<FilmIcon className="w-12 h-12 text-gray-400" />}
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
          {/* Watch Later Button - appears on hover */}
          <button
            onClick={handleWatchLaterClick}
            className="absolute top-2 left-2 bg-black bg-opacity-80 hover:bg-opacity-90 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            title={isInWatchLater ? 'Remove from Watch Later' : 'Add to Watch Later'}
          >
            {isInWatchLater ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            )}
          </button>
          
          {/* Trailer Button - appears on hover */}
          {trailerVideoId && (
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setTrailerModalOpen(true)
              }}
              className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              title="Watch Trailer"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </button>
          )}
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 line-clamp-2">
            {title}
          </h3>
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex-shrink-0 flex items-center justify-center">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {type === 'movie' ? <FilmIcon className="w-4 h-4" /> : <TvIcon className="w-4 h-4" />}
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
    <Link to={getMediaUrl()} onClick={handleClick} className="block group max-w-md">
      <div className="flex space-x-3">
        <div className="relative flex-shrink-0">
          <LazyImage
            src={getImageSrc()}
            alt={title}
            className="w-32 aspect-[3/4] object-cover rounded-lg"
            placeholder={<FilmIcon className="w-12 h-12 text-gray-400" />}
          />
          {rating && (
            <span className="absolute top-1 right-1 bg-black bg-opacity-80 text-white text-xs px-1 py-0.5 rounded flex items-center">
              <span className="text-yellow-400 mr-1">★</span>
              {rating.toFixed(1)}
            </span>
          )}
          {/* Watch Later Button - appears on hover */}
          <button
            onClick={handleWatchLaterClick}
            className="absolute top-1 left-1 bg-black bg-opacity-80 hover:bg-opacity-90 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            title={isInWatchLater ? 'Remove from Watch Later' : 'Add to Watch Later'}
          >
            {isInWatchLater ? (
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            )}
          </button>
          
          {/* Trailer Button - appears on hover */}
          {trailerVideoId && (
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setTrailerModalOpen(true)
              }}
              className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              title="Watch Trailer"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </button>
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
    <Link to={getMediaUrl()} onClick={handleClick} className="block group max-w-lg">
      <div className="space-y-4">
        <div className="relative">
          <LazyImage
            src={getImageSrc()}
            alt={title}
            className="w-full aspect-[3/4] object-cover rounded-lg"
            placeholder={<FilmIcon className="w-12 h-12 text-gray-400" />}
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
          {/* Watch Later Button - appears on hover */}
          <button
            onClick={handleWatchLaterClick}
            className="absolute top-3 left-3 bg-black bg-opacity-80 hover:bg-opacity-90 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            title={isInWatchLater ? 'Remove from Watch Later' : 'Add to Watch Later'}
          >
            {isInWatchLater ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            )}
          </button>
          
          {/* Trailer Button - appears on hover */}
          {trailerVideoId && (
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setTrailerModalOpen(true)
              }}
              className="absolute top-3 right-3 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              title="Watch Trailer"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </button>
          )}
        </div>
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 line-clamp-2">
            {title}
          </h3>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex-shrink-0 flex items-center justify-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {type === 'movie' ? <FilmIcon className="w-4 h-4" /> : <TvIcon className="w-4 h-4" />}
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

  const renderCard = () => {
    if (variant === 'compact') {
      return renderCompactCard()
    }

    if (variant === 'large') {
      return renderLargeCard()
    }

    return renderDefaultCard()
  }

  return (
    <>
      {renderCard()}
      
      {/* Trailer Modal */}
      <YouTubePlayerModal
        isOpen={trailerModalOpen}
        onClose={() => setTrailerModalOpen(false)}
        videoId={trailerVideoId || null}
        title={trailerVideoId ? `Trailer - ${title}` : undefined}
      />
    </>
  )
}

export default TMDBMediaCard

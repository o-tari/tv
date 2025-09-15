import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '../store'
import { selectTMDBContinueWatching, removeFromTMDBContinueWatching, updateProcessedItems } from '../store/slices/tmdbContinueWatchingSlice'
import { selectTmdbApiKey } from '../store/slices/settingsSlice'
import { getNewEpisodeService } from '../services/newEpisodeService'
import { FilmIcon, TvIcon } from '@heroicons/react/24/outline'
import LazyImage from './LazyImage'

interface TMDBContinueWatchingProps {
  limit?: number
  showMoreButton?: boolean
  onMoreClick?: () => void
}

const TMDBContinueWatching = ({ limit, showMoreButton = false, onMoreClick }: TMDBContinueWatchingProps) => {
  const dispatch = useAppDispatch()
  const continueWatchingItems = useAppSelector(selectTMDBContinueWatching)
  const tmdbApiKey = useAppSelector(selectTmdbApiKey)
  const [showAll, setShowAll] = useState(false)

  // Check for new episodes when component mounts or when items change
  useEffect(() => {
    if (tmdbApiKey && continueWatchingItems.length > 0) {
      const newEpisodeService = getNewEpisodeService(tmdbApiKey)
      
      // Add a small delay to prevent rapid API calls
      const timeoutId = setTimeout(() => {
        newEpisodeService.processItemsForNewEpisodes(continueWatchingItems)
          .then(processedItems => {
            dispatch(updateProcessedItems(processedItems))
          })
          .catch(error => {
            console.error('Error processing items for new episodes:', error)
          })
      }, 500)

      return () => clearTimeout(timeoutId)
    }
  }, [tmdbApiKey, continueWatchingItems.length, dispatch])

  const displayedItems = limit && !showAll ? continueWatchingItems.slice(0, limit) : continueWatchingItems
  const hasMore = limit ? continueWatchingItems.length > limit : false

  const handleRemove = (itemId: string, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    console.log('Removing item from TMDB continue watching:', itemId)
    dispatch(removeFromTMDBContinueWatching(itemId))
  }

  const handleMoreClick = () => {
    if (onMoreClick) {
      onMoreClick()
    } else {
      setShowAll(!showAll)
    }
  }

  const getImageSrc = (thumbnail: string | null) => {
    if (thumbnail) {
      return `https://image.tmdb.org/t/p/w500${thumbnail}`
    }
    return '/placeholder-movie.svg'
  }

  const getMediaUrl = (item: any) => {
    return `/tmdb-watch/${item.type}/${item.tmdbId}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (continueWatchingItems.length === 0) {
    return null
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Continue Watching
        </h2>
        {hasMore && showMoreButton && (
          <button
            onClick={handleMoreClick}
            className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium"
          >
            {showAll ? 'Show Less' : 'More'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
        {displayedItems.map((item) => (
          <div key={item.id} className="relative group">
            <Link to={getMediaUrl(item)}>
              <div className="space-y-3">
                <div className="relative">
                  <LazyImage
                    src={getImageSrc(item.thumbnail)}
                    alt={item.title}
                    className="w-full aspect-[3/4] object-cover rounded-lg"
                    placeholder={<FilmIcon className="w-12 h-12 text-gray-400" />}
                  />
                  <div className="absolute top-2 right-2 flex flex-col gap-1">
                    <span className="bg-black bg-opacity-80 text-white text-xs px-1.5 py-0.5 rounded flex items-center">
                      <span className="text-yellow-400 mr-1">★</span>
                      {item.rating.toFixed(1)}
                    </span>
                    {item.hasNewEpisodes && (
                      <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full font-semibold animate-pulse">
                        New
                      </span>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 line-clamp-2">
                    {item.title}
                  </h3>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex-shrink-0 flex items-center justify-center">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {item.type === 'movie' ? <FilmIcon className="w-4 h-4" /> : <TvIcon className="w-4 h-4" />}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        {item.type === 'movie' ? 'Movie' : 'TV Show'}
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-500">
                        <span>{formatDate(item.publishedAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
            
            {/* Remove button */}
            <button
              onClick={(e) => handleRemove(item.id, e)}
              className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg"
              aria-label="Remove from Continue Watching"
              title="Remove from Continue Watching"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TMDBContinueWatching

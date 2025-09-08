import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store'
import { removeFromAnimeContinueWatching, selectAnimeContinueWatching } from '../store/slices/animeContinueWatchingSlice'
import { getAnimeImage } from '../utils/imageProxy'
import LazyImage from './LazyImage'

interface AnimeContinueWatchingProps {
  limit?: number
  showMoreButton?: boolean
  onMoreClick?: () => void
}

const AnimeContinueWatching = ({ limit, showMoreButton = false, onMoreClick }: AnimeContinueWatchingProps) => {
  const dispatch = useAppDispatch()
  const animeContinueWatching = useAppSelector(selectAnimeContinueWatching)
  const [showAll, setShowAll] = useState(false)

  const displayedItems = limit && !showAll ? animeContinueWatching.slice(0, limit) : animeContinueWatching
  const hasMore = limit ? animeContinueWatching.length > limit : false

  const handleRemove = (itemId: string, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    console.log('Removing anime from continue watching:', itemId)
    dispatch(removeFromAnimeContinueWatching(itemId))
  }

  const handleMoreClick = () => {
    if (onMoreClick) {
      onMoreClick()
    } else {
      setShowAll(!showAll)
    }
  }

  const getImageSrc = (image: string, title: string) => {
    return getAnimeImage(image, title, 'medium')
  }

  const getMediaUrl = (item: any) => {
    return `/anime/${item.id}`
  }


  if (animeContinueWatching.length === 0) {
    return null
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          ▶️ Continue Watching Anime
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
                    src={getImageSrc(item.image, item.title)}
                    alt={item.title}
                    className="w-full aspect-[3/4] object-cover rounded-lg"
                    placeholder="🎌"
                  />
                  <div className="absolute bottom-2 right-2 flex flex-col gap-1">
                    {item.totalEpisodes && (
                      <span className="bg-black bg-opacity-80 text-white text-xs px-1.5 py-0.5 rounded">
                        {item.totalEpisodes} eps
                      </span>
                    )}
                    {item.score && (
                      <span className="bg-yellow-600 bg-opacity-90 text-white text-xs px-1.5 py-0.5 rounded">
                        ⭐ {item.score}
                      </span>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 line-clamp-2">
                    {item.title}
                  </h3>
                  <div className="flex flex-col space-y-1">
                    {item.genres && item.genres.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {item.genres.slice(0, 2).map((genre, index) => (
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
                      {item.status && (
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          {item.status}
                        </p>
                      )}
                      {item.year && (
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          {item.year}
                        </p>
                      )}
                      {item.rank && (
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          Rank #{item.rank}
                        </p>
                      )}
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

export default AnimeContinueWatching

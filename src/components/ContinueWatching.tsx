import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '../store'
import { selectContinueWatching, removeFromContinueWatching } from '../store/slices/continueWatchingSlice'
import VideoCard from './VideoCard'
import type { Video } from '../types/youtube'

interface ContinueWatchingProps {
  limit?: number
  showMoreButton?: boolean
  onMoreClick?: () => void
}

const ContinueWatching = ({ limit, showMoreButton = false, onMoreClick }: ContinueWatchingProps) => {
  const dispatch = useAppDispatch()
  const continueWatchingVideos = useAppSelector(selectContinueWatching)
  const [showAll, setShowAll] = useState(false)

  const displayedVideos = limit && !showAll ? continueWatchingVideos.slice(0, limit) : continueWatchingVideos
  const hasMore = limit ? continueWatchingVideos.length > limit : false

  const handleRemove = (videoId: string, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    dispatch(removeFromContinueWatching(videoId))
  }

  const handleMoreClick = () => {
    if (onMoreClick) {
      onMoreClick()
    } else {
      setShowAll(!showAll)
    }
  }

  if (continueWatchingVideos.length === 0) {
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {displayedVideos.map((video: Video) => (
          <div key={video.id} className="relative group">
            <Link to={`/watch/${video.id}`}>
              <VideoCard video={video} variant="default" />
            </Link>
            
            {/* Remove button */}
            <button
              onClick={(e) => handleRemove(video.id, e)}
              className="absolute top-2 right-2 p-1 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Remove from Continue Watching"
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

export default ContinueWatching

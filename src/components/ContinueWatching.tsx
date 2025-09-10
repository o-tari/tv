import { useState } from 'react'
import { useAppSelector, useAppDispatch } from '../store'
import { selectContinueWatching, removeFromContinueWatching, selectVideoProgress } from '../store/slices/continueWatchingSlice'
import VideoGrid from './VideoGrid'

interface ContinueWatchingProps {
  limit?: number
  showMoreButton?: boolean
  onMoreClick?: () => void
}

const ContinueWatching = ({ limit, showMoreButton = false, onMoreClick }: ContinueWatchingProps) => {
  const dispatch = useAppDispatch()
  const continueWatchingVideos = useAppSelector(selectContinueWatching)
  const videoProgress = useAppSelector(selectVideoProgress)
  const [showAll, setShowAll] = useState(false)

  const displayedVideos = limit && !showAll ? continueWatchingVideos.slice(0, limit) : continueWatchingVideos
  const hasMore = limit ? continueWatchingVideos.length > limit : false

  const handleRemove = (videoId: string, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    console.log('Removing video from continue watching:', videoId)
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

      <VideoGrid
        videos={displayedVideos}
        loading={false}
        variant="default"
        videoProgress={videoProgress}
        showProgress={true}
        onRemove={handleRemove}
        showRemoveButton={true}
      />
    </div>
  )
}

export default ContinueWatching

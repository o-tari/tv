import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '../store'
import { fetchRandomVideosFromSavedChannels, fetchRandomVideosFromChannel } from '../store/slices/videosSlice'
import { type Video } from '../types/youtube'
import { formatNumber } from '../utils/formatNumber'
import { formatDuration } from '../utils/formatTime'

interface UpNextSectionProps {
  currentVideoId?: string
  currentChannelId?: string
  onVideoSelect?: (video: Video) => void
}

const UpNextSection = ({ currentVideoId, currentChannelId, onVideoSelect }: UpNextSectionProps) => {
  const dispatch = useAppDispatch()
  const { 
    randomVideos, 
    randomVideosLoading, 
    randomVideosError,
    channelRandomVideos,
    channelRandomVideosLoading,
    channelRandomVideosError
  } = useAppSelector((state) => state.videos)

  // Fetch current channel videos if channelId is provided
  useEffect(() => {
    if (currentChannelId && channelRandomVideos.length === 0 && !channelRandomVideosLoading) {
      console.log('🎲 UpNextSection: Fetching random videos from current channel...')
      dispatch(fetchRandomVideosFromChannel({ channelId: currentChannelId, count: 20 }))
    }
  }, [dispatch, currentChannelId, channelRandomVideos.length, channelRandomVideosLoading])

  const handleVideoClick = (video: Video) => {
    console.log('🎬 Up Next video clicked:', video.title, video.id)
    onVideoSelect?.(video)
  }

  // Combine videos from saved channels and current channel
  const allVideos = [...channelRandomVideos, ...randomVideos]
  const isLoading = randomVideosLoading || channelRandomVideosLoading
  const hasError = randomVideosError || channelRandomVideosError

  if (isLoading) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Up Next
        </h3>
        <div className="flex space-x-3 overflow-x-auto">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex-shrink-0 w-32 animate-pulse">
              <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (hasError) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Up Next
        </h3>
        <div className="text-center py-4">
          <p className="text-red-600 dark:text-red-400 text-sm mb-2">
            Failed to load recommendations
          </p>
          <button
            onClick={() => {
              dispatch(fetchRandomVideosFromSavedChannels(200))
              if (currentChannelId) {
                dispatch(fetchRandomVideosFromChannel({ channelId: currentChannelId, count: 20 }))
              }
            }}
            className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  if (allVideos.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Up Next
        </h3>
        <div className="text-center py-4">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            No videos available from your saved channels
          </p>
        </div>
      </div>
    )
  }

  // Filter out current video if provided
  const filteredVideos = currentVideoId 
    ? allVideos.filter(video => video.id !== currentVideoId)
    : allVideos

  // Show first 5 videos
  const displayVideos = filteredVideos.slice(0, 5)

  // Debug logging
  console.log('🎬 Up Next - currentVideoId:', currentVideoId)
  console.log('🎬 Up Next - currentChannelId:', currentChannelId)
  console.log('🎬 Up Next - channelRandomVideos length:', channelRandomVideos.length)
  console.log('🎬 Up Next - randomVideos length:', randomVideos.length)
  console.log('🎬 Up Next - allVideos length:', allVideos.length)
  console.log('🎬 Up Next - filteredVideos length:', filteredVideos.length)
  console.log('🎬 Up Next - displayVideos length:', displayVideos.length)
  console.log('🎬 Up Next - first video:', displayVideos[0]?.title)

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
        Up Next
      </h3>
      <div className="flex space-x-3 overflow-x-auto">
        {displayVideos.map((video) => (
          <div
            key={video.id}
            className="flex-shrink-0 w-32 cursor-pointer group"
            onClick={() => handleVideoClick(video)}
          >
            <Link
              to={`/watch/${video.id}`}
              className="block"
              onClick={(e) => {
                e.preventDefault()
                handleVideoClick(video)
              }}
            >
              <div className="relative">
                <div className="aspect-video rounded overflow-hidden mb-2">
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
                
                {/* Video info */}
                <div className="space-y-1">
                  <h4 className="text-xs font-medium text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 line-clamp-2">
                    {video.title}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                    {video.channelTitle}
                  </p>
                  <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                    {video.viewCount && (
                      <span>{formatNumber(parseInt(video.viewCount))} views</span>
                    )}
                    {video.publishedAt && (
                      <>
                        <span>•</span>
                        <span>
                          {new Date(video.publishedAt).toLocaleDateString()}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

export default UpNextSection

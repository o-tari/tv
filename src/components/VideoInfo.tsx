import { useState } from 'react'
import { type Video } from '../types/youtube'
import { formatViewCount, formatLikeCount } from '../utils/formatNumber'
import { sanitizeHTML } from '../utils/sanitizeHTML'
import { useAppSelector, useAppDispatch } from '../store'
import { selectIsSubscribed, toggleSubscription } from '../store/slices/subscriptionsSlice'

interface VideoInfoProps {
  video: Video
}

const VideoInfo = ({ video }: VideoInfoProps) => {
  const dispatch = useAppDispatch()
  const isSubscribed = useAppSelector(selectIsSubscribed(video.channelId))
  
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [liked, setLiked] = useState(false)
  const [disliked, setDisliked] = useState(false)
  const [saved, setSaved] = useState(false)

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

  const handleLike = () => {
    if (liked) {
      setLiked(false)
    } else {
      setLiked(true)
      setDisliked(false)
    }
  }

  const handleDislike = () => {
    if (disliked) {
      setDisliked(false)
    } else {
      setDisliked(true)
      setLiked(false)
    }
  }

  const handleSave = () => {
    setSaved(!saved)
  }

  const handleSubscribe = () => {
    // Create a channel object from video data for subscription
    const channel = {
      id: video.channelId,
      title: video.channelTitle,
      description: '', // Not available in video data
      thumbnail: `https://ui-avatars.com/api/?name=${encodeURIComponent(video.channelTitle)}&background=random`,
      subscriberCount: '0', // Not available in video data
      videoCount: '0', // Not available in video data
      viewCount: '0', // Not available in video data
    }
    dispatch(toggleSubscription(channel))
  }

  return (
    <div className="space-y-4">
      {/* Title */}
      <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
        {video.title}
      </h1>

      {/* Video stats and actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
          <span>{formatViewCount(video.viewCount)}</span>
          <span>•</span>
          <span>{getTimeAgo(video.publishedAt)}</span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Like button */}
          <button
            onClick={handleLike}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${
              liked
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            <svg className="w-5 h-5" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
            </svg>
            <span>{formatLikeCount(video.likeCount || '0')}</span>
          </button>

          {/* Dislike button */}
          <button
            onClick={handleDislike}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${
              disliked
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            <svg className="w-5 h-5" fill={disliked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.737 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h-2m-2 0h2" />
            </svg>
          </button>

          {/* Save button */}
          <button
            onClick={handleSave}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${
              saved
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            <svg className="w-5 h-5" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <span>Save</span>
          </button>

          {/* Share button */}
          <button className="flex items-center space-x-2 px-4 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Channel info */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="flex items-start space-x-3">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(video.channelTitle)}&background=random`}
            alt={video.channelTitle}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              {video.channelTitle}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {formatViewCount(video.viewCount)} subscribers
            </p>
          </div>
          <button
            onClick={handleSubscribe}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              isSubscribed
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {isSubscribed ? 'Subscribed' : 'Subscribe'}
          </button>
        </div>
      </div>

      {/* Description */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>{formatViewCount(video.viewCount)} views</span>
            <span>•</span>
            <span>{getTimeAgo(video.publishedAt)}</span>
          </div>
          <div
            className={`text-sm text-gray-900 dark:text-white ${
              showFullDescription ? '' : 'line-clamp-3'
            }`}
            dangerouslySetInnerHTML={{
              __html: sanitizeHTML(video.description),
            }}
          />
          {video.description.length > 200 && (
            <button
              onClick={() => setShowFullDescription(!showFullDescription)}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mt-2 font-medium"
            >
              {showFullDescription ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default VideoInfo

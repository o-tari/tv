import { useNavigate } from 'react-router-dom'
import { type Channel } from '../types/youtube'
import { formatSubscriberCount } from '../utils/formatNumber'
import { useAppSelector, useAppDispatch } from '../store'
import { selectIsChannelSaved, toggleChannel } from '../store/slices/channelsSlice'

interface ChannelCardProps {
  channel: Channel
  variant?: 'default' | 'compact'
  showSubscribeButton?: boolean
  onClick?: () => void
  isSelected?: boolean
}

const ChannelCard = ({ 
  channel, 
  variant = 'default', 
  showSubscribeButton = true, 
  onClick,
  isSelected = false 
}: ChannelCardProps) => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const isSubscribed = useAppSelector(selectIsChannelSaved(channel.id))

  const handleSubscribe = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dispatch(toggleChannel(channel))
  }

  const handleCardClick = () => {
    if (onClick) {
      onClick()
    } else {
      // Navigate to channel page
      navigate(`/channel/${channel.id}`)
    }
  }
  if (variant === 'compact') {
    return (
      <div className="block group">
        <div 
          className={`flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer ${isSelected ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
          onClick={handleCardClick}
        >
          <img
            src={channel.thumbnail}
            alt={channel.title}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 truncate">
              {channel.title}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
              {formatSubscriberCount(channel.subscriberCount)}
            </p>
          </div>
          {showSubscribeButton && (
            <button
              onClick={handleSubscribe}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                isSubscribed
                  ? 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {isSubscribed ? 'Subscribed' : 'Subscribe'}
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="block group">
      <div 
        className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer ${isSelected ? 'ring-2 ring-red-500' : ''}`}
        onClick={handleCardClick}
      >
        <div className="aspect-video bg-gradient-to-r from-red-500 to-pink-500"></div>
        <div className="p-4">
          <div className="flex items-start space-x-3">
            <img
              src={channel.thumbnail}
              alt={channel.title}
              className="w-16 h-16 rounded-full object-cover -mt-8 border-4 border-white dark:border-gray-800"
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 truncate">
                {channel.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {formatSubscriberCount(channel.subscriberCount)} subscribers
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                {channel.videoCount} videos
              </p>
            </div>
          </div>
          {channel.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 line-clamp-2">
              {channel.description}
            </p>
          )}
          {showSubscribeButton && (
            <div className="mt-4">
              <button
                onClick={handleSubscribe}
                className={`w-full px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                  isSubscribed
                    ? 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {isSubscribed ? 'Subscribed' : 'Subscribe'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChannelCard

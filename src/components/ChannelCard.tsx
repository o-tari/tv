import { Link } from 'react-router-dom'
import { type Channel } from '../types/youtube'
import { formatSubscriberCount } from '../utils/formatNumber'

interface ChannelCardProps {
  channel: Channel
  variant?: 'default' | 'compact'
}

const ChannelCard = ({ channel, variant = 'default' }: ChannelCardProps) => {
  if (variant === 'compact') {
    return (
      <Link to={`/channel/${channel.id}`} className="block group">
        <div className="flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
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
        </div>
      </Link>
    )
  }

  return (
    <Link to={`/channel/${channel.id}`} className="block group">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow">
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
        </div>
      </div>
    </Link>
  )
}

export default ChannelCard

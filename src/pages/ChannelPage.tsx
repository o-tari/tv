import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAppDispatch } from '../store'
import { subscribeToChannel, unsubscribeFromChannel } from '../store/slices/historySlice'
import { useChannel } from '../hooks/useChannel'
import VideoGrid from '../components/VideoGrid'
import InfiniteScroll from '../components/InfiniteScroll'

const ChannelPage = () => {
  const { channelId } = useParams<{ channelId: string }>()
  const dispatch = useAppDispatch()
  const {
    channel,
    loading,
    error,
    videos,
    videosLoading,
    videosError,
    isSubscribed,
    loadMoreVideos,
  } = useChannel(channelId || '')

  const [activeTab, setActiveTab] = useState<'videos' | 'playlists' | 'about'>('videos')

  const handleSubscribe = () => {
    if (channel) {
      if (isSubscribed) {
        dispatch(unsubscribeFromChannel(channel.id))
      } else {
        dispatch(subscribeToChannel(channel.id))
      }
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg mb-6"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="w-24 h-24 mx-auto mb-4 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
          <svg className="w-12 h-12 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Channel not found
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {error}
        </p>
        <button
          onClick={() => window.history.back()}
          className="btn-primary"
        >
          Go back
        </button>
      </div>
    )
  }

  if (!channel) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Channel not found
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          The channel you're looking for doesn't exist or has been removed.
        </p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Channel header */}
        <div className="mb-8">
          <div className="aspect-video bg-gradient-to-r from-red-500 to-pink-500 rounded-lg mb-6"></div>
          
          <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
            <img
              src={channel.thumbnail}
              alt={channel.title}
              className="w-24 h-24 rounded-full object-cover -mt-12 border-4 border-white dark:border-gray-800"
            />
            
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {channel.title}
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <span>{channel.subscriberCount} subscribers</span>
                <span>•</span>
                <span>{channel.videoCount} videos</span>
                {channel.country && (
                  <>
                    <span>•</span>
                    <span>{channel.country}</span>
                  </>
                )}
              </div>
            </div>
            
            <button
              onClick={handleSubscribe}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                isSubscribed
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {isSubscribed ? 'Subscribed' : 'Subscribe'}
            </button>
          </div>
        </div>

        {/* Channel tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'videos', label: 'Videos' },
              { id: 'playlists', label: 'Playlists' },
              { id: 'about', label: 'About' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-red-600 text-red-600 dark:text-red-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab content */}
        {activeTab === 'videos' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Videos
            </h2>
            
            {videosError ? (
              <div className="text-center py-8">
                <p className="text-red-600 dark:text-red-400">
                  Failed to load videos: {videosError}
                </p>
              </div>
            ) : (
              <InfiniteScroll
                onLoadMore={loadMoreVideos}
                hasMore={videos.length > 0}
                loading={videosLoading}
              >
                <VideoGrid
                  videos={videos}
                  loading={videosLoading && videos.length === 0}
                />
              </InfiniteScroll>
            )}
          </div>
        )}

        {activeTab === 'playlists' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Playlists
            </h2>
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">
                No playlists available
              </p>
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              About
            </h2>
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <p className="text-gray-900 dark:text-white">
                {channel.description || 'No description available.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChannelPage

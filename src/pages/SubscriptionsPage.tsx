import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '../store'
import { selectSubscriptions } from '../store/slices/subscriptionsSlice'
import { fetchChannelVideos } from '../store/slices/videosSlice'
import { type Video } from '../types/youtube'
import VideoGrid from '../components/VideoGrid'
import ChannelCard from '../components/ChannelCard'
import LoadingSpinner from '../components/LoadingSpinner'

const SubscriptionsPage: React.FC = () => {
  const dispatch = useAppDispatch()
  const subscriptions = useAppSelector(selectSubscriptions)
  const { channelVideosLoading, channelVideosError } = useAppSelector((state) => state.videos)
  const [searchParams] = useSearchParams()
  
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null)
  const [allVideos, setAllVideos] = useState<Video[]>([])

  // Check for channel ID in URL parameters
  useEffect(() => {
    const channelId = searchParams.get('channel')
    if (channelId) {
      setSelectedChannel(channelId)
    }
  }, [searchParams])

  // Load videos from all subscribed channels on mount
  useEffect(() => {
    if (subscriptions.length > 0) {
      loadAllSubscriptionVideos()
    }
  }, [subscriptions])

  const loadAllSubscriptionVideos = async () => {
    try {
      const videoPromises = subscriptions.map(channel => 
        dispatch(fetchChannelVideos({ channelId: channel.id }))
      )
      
      const results = await Promise.all(videoPromises)
      const allVideos: Video[] = []
      
      results.forEach((result) => {
        if (result.payload && typeof result.payload === 'object' && 'items' in result.payload) {
          const payload = result.payload as { items: Video[] }
          allVideos.push(...payload.items)
        }
      })
      
      // Sort by published date (newest first)
      allVideos.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      setAllVideos(allVideos)
    } catch (error) {
      console.error('Error loading subscription videos:', error)
    }
  }

  const handleChannelSelect = (channelId: string) => {
    const newSelectedChannel = selectedChannel === channelId ? null : channelId
    setSelectedChannel(newSelectedChannel)
    
    // Update URL to reflect the selected channel
    const newSearchParams = new URLSearchParams(searchParams)
    if (newSelectedChannel) {
      newSearchParams.set('channel', newSelectedChannel)
    } else {
      newSearchParams.delete('channel')
    }
    
    // Update URL without causing a page reload
    const newUrl = `${window.location.pathname}${newSearchParams.toString() ? `?${newSearchParams.toString()}` : ''}`
    window.history.replaceState({}, '', newUrl)
  }

  const getChannelVideos = (channelId: string) => {
    return allVideos.filter(video => video.channelId === channelId)
  }

  if (subscriptions.length === 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-youtube-dark">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="text-center">
            <div className="mx-auto mb-6 h-24 w-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 0 0-15 0v5h5l-5 5-5-5h5" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No subscriptions yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Subscribe to channels to see their latest videos here
            </p>
            <button
              onClick={() => window.history.back()}
              className="btn-primary"
            >
              Explore Channels
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-youtube-dark">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Subscriptions
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Latest videos from your subscribed channels
          </p>
        </div>

        {/* Channel List */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Your Channels ({subscriptions.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {subscriptions.map((channel) => (
              <div key={channel.id} className="relative">
                <ChannelCard
                  channel={channel}
                  onClick={() => handleChannelSelect(channel.id)}
                  isSelected={selectedChannel === channel.id}
                  showSubscribeButton={false}
                />
                {selectedChannel === channel.id && (
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                    <div className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                      Selected
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Videos Section */}
        <div>
          {selectedChannel ? (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Videos from {subscriptions.find(s => s.id === selectedChannel)?.title}
              </h2>
              {channelVideosLoading ? (
                <LoadingSpinner />
              ) : (
                <VideoGrid
                  videos={getChannelVideos(selectedChannel)}
                  loading={false}
                />
              )}
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Latest from All Channels
              </h2>
              {channelVideosLoading ? (
                <LoadingSpinner />
              ) : (
                <VideoGrid
                  videos={allVideos}
                  loading={false}
                />
              )}
            </div>
          )}
        </div>

        {channelVideosError && (
          <div className="mt-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400">
              Error loading videos: {channelVideosError}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default SubscriptionsPage

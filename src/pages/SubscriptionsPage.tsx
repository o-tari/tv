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
  const [selectedChannelVideos, setSelectedChannelVideos] = useState<Video[]>([])
  const [selectedChannelTitle, setSelectedChannelTitle] = useState<string>('')
  const [selectedChannelError, setSelectedChannelError] = useState<string | null>(null)

  // Check for channel ID in URL parameters
  useEffect(() => {
    const channelId = searchParams.get('channel')
    if (channelId) {
      console.log('🔍 SubscriptionsPage: Channel ID from URL:', channelId)
      console.log('📋 Available subscriptions:', subscriptions.map(sub => ({ id: sub.id, title: sub.title })))
      
      // Check if the channel is in subscriptions
      const isSubscribed = subscriptions.some(sub => sub.id === channelId)
      console.log('✅ Is channel subscribed?', isSubscribed)
      
      if (isSubscribed) {
        setSelectedChannel(channelId)
        // Load videos for the selected channel
        loadChannelVideos(channelId)
      } else {
        console.warn('⚠️ Channel not found in subscriptions:', channelId)
        setSelectedChannel(null)
      }
    }
  }, [searchParams, subscriptions])

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

  const loadChannelVideos = async (channelId: string) => {
    try {
      console.log('🎬 Loading videos for channel:', channelId)
      setSelectedChannelError(null) // Clear any previous errors
      const result = await dispatch(fetchChannelVideos({ channelId }))
      console.log('📺 Fetch result:', result)
      
      if (result.payload && typeof result.payload === 'object' && 'items' in result.payload) {
        const payload = result.payload as { items: Video[] }
        console.log('✅ Videos loaded:', payload.items.length, 'videos')
        setSelectedChannelVideos(payload.items)
        // Try to get channel title from the first video
        if (payload.items.length > 0) {
          setSelectedChannelTitle(payload.items[0].channelTitle)
        } else {
          setSelectedChannelTitle('Unknown Channel')
        }
      } else {
        console.log('❌ No videos in payload:', result.payload)
        setSelectedChannelVideos([])
        setSelectedChannelTitle('Unknown Channel')
      }
    } catch (error) {
      console.error('❌ Error loading channel videos:', error)
      setSelectedChannelVideos([])
      setSelectedChannelTitle('Error loading channel')
      // Set a flag to show API error message
      setSelectedChannelError(error instanceof Error ? error.message : 'Failed to load channel videos')
    }
  }

  const handleChannelSelect = (channelId: string) => {
    const newSelectedChannel = selectedChannel === channelId ? null : channelId
    setSelectedChannel(newSelectedChannel)
    
    // Load videos for the selected channel
    if (newSelectedChannel) {
      loadChannelVideos(newSelectedChannel)
    } else {
      setSelectedChannelVideos([])
      setSelectedChannelTitle('')
    }
    
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


  // Debug logging
  console.log('🔍 SubscriptionsPage render - subscriptions:', subscriptions.length)
  console.log('🔍 Selected channel:', selectedChannel)
  console.log('🔍 Selected channel videos:', selectedChannelVideos.length)
  console.log('🔍 Channel videos loading:', channelVideosLoading)
  console.log('🔍 Channel videos error:', channelVideosError)
  console.log('🔍 Selected channel error:', selectedChannelError)

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

        {/* Debug Section - Remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Debug Info</h3>
            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <div>Subscriptions: {subscriptions.length}</div>
              <div>Selected Channel: {selectedChannel || 'None'}</div>
              <div>Selected Channel Videos: {selectedChannelVideos.length}</div>
              <div>Loading: {channelVideosLoading ? 'Yes' : 'No'}</div>
              <div>Error: {channelVideosError || selectedChannelError || 'None'}</div>
              <div>Channel Title: {selectedChannelTitle || 'None'}</div>
            </div>
          </div>
        )}

        {/* Videos Section */}
        <div>
          {selectedChannel ? (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Videos from {selectedChannelTitle || 'Unknown Channel'}
              </h2>
              {channelVideosLoading ? (
                <LoadingSpinner />
              ) : selectedChannelError ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    API Error
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {selectedChannelError}
                  </p>
                  <div className="space-x-4">
                    <button
                      onClick={() => loadChannelVideos(selectedChannel!)}
                      className="btn-primary"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={() => setSelectedChannel(null)}
                      className="btn-secondary"
                    >
                      View All Channels
                    </button>
                  </div>
                </div>
              ) : selectedChannelVideos.length > 0 ? (
                <VideoGrid
                  videos={selectedChannelVideos}
                  loading={false}
                />
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No videos found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    This channel doesn't have any videos available or the channel is private.
                  </p>
                  <button
                    onClick={() => setSelectedChannel(null)}
                    className="btn-primary"
                  >
                    View All Channels
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Latest from All Channels
              </h2>
              {channelVideosLoading ? (
                <LoadingSpinner />
              ) : allVideos.length > 0 ? (
                <VideoGrid
                  videos={allVideos}
                  loading={false}
                />
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No videos available
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Your subscribed channels don't have any videos available right now.
                  </p>
                </div>
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

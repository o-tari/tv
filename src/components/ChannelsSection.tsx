import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '../store'
import { 
  selectSavedChannels, 
  selectLatestChannelVideos, 
  selectChannelsLoading,
  selectPaginatedChannelVideos,
  fetchAllChannelVideos,
  resetPagination
} from '../store/slices/channelsSlice'
import { fetchRandomVideosFromSavedChannels } from '../store/slices/videosSlice'
import VideoGrid from './VideoGrid'
import ChannelsManagementModal from './ChannelsManagementModal'
import PaginationControls from './PaginationControls'

const ChannelsSection = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [showModal, setShowModal] = useState(false)
  const hasInitialized = useRef(false)
  
  const savedChannels = useAppSelector(selectSavedChannels)
  const latestVideos = useAppSelector(selectLatestChannelVideos)
  const loading = useAppSelector(selectChannelsLoading)
  const paginatedData = useAppSelector(selectPaginatedChannelVideos)
  const { randomVideos } = useAppSelector((state) => state.videos)

  useEffect(() => {
    if (savedChannels.length > 0 && !hasInitialized.current) {
      hasInitialized.current = true
      console.log('🚀 ChannelsSection: Initializing with', savedChannels.length, 'channels')
      
      // Reset pagination when channels change
      dispatch(resetPagination())
      
      // Only fetch channel videos if we don't already have them
      if (latestVideos.length === 0) {
        console.log('📺 Fetching channel videos...')
        dispatch(fetchAllChannelVideos())
      }
      
      // Only fetch random videos if we don't have any and we have channel videos
      if ((!randomVideos || randomVideos.length === 0) && latestVideos.length > 0) {
        console.log('🎲 Fetching random videos from existing channel videos...')
        dispatch(fetchRandomVideosFromSavedChannels(200))
      }
    }
  }, [dispatch, savedChannels.length, latestVideos.length, randomVideos?.length])

  const handleRandomVideo = () => {
    if (randomVideos && randomVideos.length > 0) {
      const randomIndex = Math.floor(Math.random() * randomVideos.length)
      const randomVideo = randomVideos[randomIndex]
      
      if (randomVideo && randomVideo.id) {
        console.log('🎲 Random video selected:', randomVideo.title)
        navigate(`/watch/${randomVideo.id}`)
      }
    } else {
      // If no random videos available, fetch them first
      dispatch(fetchRandomVideosFromSavedChannels(200))
    }
  }

  if (savedChannels.length === 0) {
    return null
  }

  return (
    <>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              📺 Channels
            </h2>
            {paginatedData.totalVideos > 0 && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ({paginatedData.totalVideos} videos)
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRandomVideo}
              className="flex items-center space-x-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
              title="Play Random Video from Saved Channels"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Random</span>
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              title="Manage Channels"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <button
              onClick={() => navigate('/channels')}
              className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium"
            >
              More →
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading channel videos...</p>
          </div>
        ) : paginatedData.videos.length > 0 ? (
          <>
            <VideoGrid
              videos={paginatedData.videos}
              loading={false}
            />
            
            {/* Pagination Controls */}
            <div className="mt-6">
              <PaginationControls />
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">
              No videos found from your saved channels
            </p>
          </div>
        )}
      </div>

      <ChannelsManagementModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  )
}

export default ChannelsSection

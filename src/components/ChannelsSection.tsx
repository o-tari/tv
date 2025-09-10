import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '../store'
import { 
  selectSavedChannels, 
  selectLatestChannelVideos, 
  selectChannelsLoading,
  fetchAllChannelVideos 
} from '../store/slices/channelsSlice'
import VideoGrid from './VideoGrid'
import ChannelsManagementModal from './ChannelsManagementModal'

const ChannelsSection = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [showModal, setShowModal] = useState(false)
  
  const savedChannels = useAppSelector(selectSavedChannels)
  const latestVideos = useAppSelector(selectLatestChannelVideos)
  const loading = useAppSelector(selectChannelsLoading)

  useEffect(() => {
    if (savedChannels.length > 0) {
      dispatch(fetchAllChannelVideos())
    }
  }, [dispatch, savedChannels.length])

  if (savedChannels.length === 0) {
    return null
  }

  return (
    <>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            📺 Channels
          </h2>
          <div className="flex items-center space-x-2">
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
        ) : latestVideos.length > 0 ? (
          <VideoGrid
            videos={latestVideos.slice(0, 16)}
            loading={false}
          />
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

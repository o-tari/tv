import { useEffect, useState } from 'react'
import { useAppSelector, useAppDispatch } from '../store'
import { 
  selectSavedChannels, 
  selectAllChannelVideosSortedByDate,
  selectChannelsLoading,
  selectChannelsError,
  fetchAllChannelVideos,
} from '../store/slices/channelsSlice'
import VideoGrid from '../components/VideoGrid'
import ChannelsManagementModal from '../components/ChannelsManagementModal'

const ChannelsPage = () => {
  const dispatch = useAppDispatch()
  const [showModal, setShowModal] = useState(false)
  
  const savedChannels = useAppSelector(selectSavedChannels)
  const allVideos = useAppSelector(selectAllChannelVideosSortedByDate)
  const loading = useAppSelector(selectChannelsLoading)
  const error = useAppSelector(selectChannelsError)

  useEffect(() => {
    // Fetch videos for all saved channels
    if (savedChannels.length > 0) {
      dispatch(fetchAllChannelVideos())
    }
  }, [dispatch, savedChannels.length])

  if (savedChannels.length === 0) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No channels saved yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Add channels from search results to see their latest videos here
            </p>
            <button
              onClick={() => window.history.back()}
              className="btn-primary"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Saved Channels Videos
          </h1>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Manage Channels</span>
          </button>
        </div>

        <div className="mb-4">
          <p className="text-gray-600 dark:text-gray-400">
            Videos from {savedChannels.length} saved channel{savedChannels.length !== 1 ? 's' : ''}, sorted by date
          </p>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading videos...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <button
              onClick={() => dispatch(fetchAllChannelVideos())}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        ) : allVideos.length > 0 ? (
          <VideoGrid
            videos={allVideos}
            loading={false}
          />
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">No videos found from your saved channels</p>
          </div>
        )}
      </div>

      <ChannelsManagementModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  )
}

export default ChannelsPage

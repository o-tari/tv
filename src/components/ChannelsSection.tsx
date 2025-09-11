import { useState, useMemo } from 'react'
import { useAppSelector } from '../store'
import { selectSavedChannels } from '../store/slices/channelsSlice'
import ChannelCard from './ChannelCard'
import ChannelsManagementModal from './ChannelsManagementModal'

const ChannelsSection = () => {
  const [showModal, setShowModal] = useState(false)
  
  const savedChannels = useAppSelector(selectSavedChannels)

  // Get 6 random channels from saved channels
  const randomChannels = useMemo(() => {
    if (savedChannels.length === 0) return []
    
    // Shuffle the channels array and take first 6
    const shuffled = [...savedChannels].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, Math.min(6, savedChannels.length))
  }, [savedChannels])

  if (savedChannels.length === 0) {
    return null
  }

  return (
    <>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              📺 Random Channels
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              ({randomChannels.length} of {savedChannels.length})
            </span>
          </div>
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
          </div>
        </div>
        
        {/* Random Channels Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {randomChannels.map((channel) => (
            <ChannelCard
              key={channel.id}
              channel={channel}
              variant="compact"
              showSubscribeButton={false}
            />
          ))}
        </div>
      </div>

      <ChannelsManagementModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  )
}

export default ChannelsSection

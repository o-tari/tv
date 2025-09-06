import { useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../store'
import { 
  fetchStreamingLinks, 
  clearStreamingLinks, 
  setCurrentEpisode,
  selectStreamingLinks,
  selectStreamingLoading,
  selectStreamingError
} from '../store/slices/streamingLinksSlice'
import { type StreamingLink } from '../types/anime'

interface StreamingLinksProps {
  animeId: string
  episodes: Array<{
    id: string
    episodeNumber: number
    title: string
  }>
  onEpisodeSelect?: (episodeId: string) => void
}

const StreamingLinks = ({ episodes, onEpisodeSelect }: StreamingLinksProps) => {
  const dispatch = useAppDispatch()
  const streamingLinks = useAppSelector(selectStreamingLinks)
  const loading = useAppSelector(selectStreamingLoading)
  const error = useAppSelector(selectStreamingError)
  // const currentEpisodeId = useAppSelector(selectCurrentEpisodeId) // For future use
  
  const [selectedEpisode, setSelectedEpisode] = useState<string>('')
  const [selectedQuality, setSelectedQuality] = useState<string>('')
  const [showPlayer, setShowPlayer] = useState(false)

  // Auto-select first episode if available
  useEffect(() => {
    console.log('Episodes received:', episodes)
    if (episodes.length > 0 && !selectedEpisode) {
      const firstEpisode = episodes[0]
      console.log('First episode:', firstEpisode)
      setSelectedEpisode(firstEpisode.id)
      dispatch(setCurrentEpisode(firstEpisode.id))
    }
  }, [episodes, selectedEpisode, dispatch])

  // Fetch streaming links when episode changes
  useEffect(() => {
    if (selectedEpisode) {
      console.log('Fetching streaming links for episode ID:', selectedEpisode)
      dispatch(fetchStreamingLinks(selectedEpisode))
    }
  }, [selectedEpisode, dispatch])

  // Auto-select highest quality when links are loaded
  useEffect(() => {
    if (streamingLinks.length > 0 && !selectedQuality) {
      // Sort by quality (highest first) and select the first one
      const sortedLinks = [...streamingLinks].sort((a, b) => {
        const qualityA = parseInt(a.quality) || 0
        const qualityB = parseInt(b.quality) || 0
        return qualityB - qualityA
      })
      setSelectedQuality(sortedLinks[0].quality)
    }
  }, [streamingLinks, selectedQuality])

  const handleEpisodeChange = (episodeId: string) => {
    console.log('Episode selected:', episodeId)
    setSelectedEpisode(episodeId)
    setSelectedQuality('')
    setShowPlayer(false)
    dispatch(clearStreamingLinks())
    onEpisodeSelect?.(episodeId)
  }

  const handleQualityChange = (quality: string) => {
    setSelectedQuality(quality)
    setShowPlayer(false)
  }

  const handlePlay = () => {
    if (selectedQuality) {
      setShowPlayer(true)
    }
  }

  const getSelectedStreamingLink = (): StreamingLink | null => {
    return streamingLinks.find(link => link.quality === selectedQuality) || null
  }

  const getQualityOptions = () => {
    const uniqueQualities = [...new Set(streamingLinks.map(link => link.quality))]
    return uniqueQualities.sort((a, b) => {
      const qualityA = parseInt(a) || 0
      const qualityB = parseInt(b) || 0
      return qualityB - qualityA
    })
  }

  const selectedLink = getSelectedStreamingLink()

  return (
    <div className="space-y-6">
      {/* Episode Selection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Select Episode
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {episodes.map((episode) => (
            <button
              key={episode.id}
              onClick={() => handleEpisodeChange(episode.id)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedEpisode === episode.id
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <div className="text-center">
                <div className="font-semibold">Ep {episode.episodeNumber}</div>
                <div className="text-xs opacity-75 truncate max-w-20" title={episode.title}>
                  {episode.title}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quality Selection */}
      {streamingLinks.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Select Quality
          </h3>
          <div className="flex flex-wrap gap-2">
            {getQualityOptions().map((quality) => (
              <button
                key={quality}
                onClick={() => handleQualityChange(quality)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedQuality === quality
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {quality}p
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading streaming links...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Failed to load streaming links
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => selectedEpisode && dispatch(fetchStreamingLinks(selectedEpisode))}
            className="btn-primary"
          >
            Try again
          </button>
        </div>
      )}

      {/* Play Button */}
      {selectedLink && !loading && !error && (
        <div className="text-center">
          <button
            onClick={handlePlay}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors flex items-center space-x-2 mx-auto"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            <span>Play Episode</span>
          </button>
        </div>
      )}

      {/* Video Player */}
      {showPlayer && selectedLink && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Now Playing
          </h3>
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            {selectedLink.isM3U8 ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-700 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🎬</span>
                  </div>
                  <h4 className="text-lg font-semibold mb-2">HLS Stream</h4>
                  <p className="text-gray-300 mb-4">
                    Quality: {selectedLink.quality}p
                  </p>
                  <p className="text-sm text-gray-400">
                    HLS streaming requires a compatible video player
                  </p>
                </div>
              </div>
            ) : (
              <video
                controls
                className="w-full h-full"
                src={selectedLink.url}
                crossOrigin="anonymous"
              >
                Your browser does not support the video tag.
              </video>
            )}
          </div>
          
          {/* Stream Info */}
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              Stream Information
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Quality:</span>
                <span className="text-gray-900 dark:text-white">{selectedLink.quality}p</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Format:</span>
                <span className="text-gray-900 dark:text-white">
                  {selectedLink.isM3U8 ? 'HLS (M3U8)' : 'Direct Video'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">URL:</span>
                <span className="text-gray-900 dark:text-white font-mono text-xs truncate max-w-xs">
                  {selectedLink.url}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StreamingLinks

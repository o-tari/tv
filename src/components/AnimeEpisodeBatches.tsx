import { useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../store'
import { addToAnimeContinueWatching, saveAnimeEpisodeProgress } from '../store/slices/animeContinueWatchingSlice'
import { selectAnimeContinueWatching, selectAnimeEpisodeProgress } from '../store/slices/animeContinueWatchingSlice'
import { type AnimeEpisode, type AnimeMedia } from '../types/anime'
import LoadingSpinner from './LoadingSpinner'

interface AnimeEpisodeBatchesProps {
  episodes: AnimeEpisode[]
  animeId: string
  animeTitle: string
  animeImage: string
  totalEpisodes?: number | null // Total episode count from Jikan API
  loading?: boolean
  error?: string | null
  onRetry?: () => void
}

interface EpisodeRange {
  id: string
  startEpisode: number
  endEpisode: number
  label: string
}

const AnimeEpisodeBatches = ({
  episodes,
  animeId,
  animeTitle,
  animeImage,
  totalEpisodes,
  loading = false,
  error = null,
  onRetry
}: AnimeEpisodeBatchesProps) => {
  const dispatch = useAppDispatch()
  const continueWatching = useAppSelector(selectAnimeContinueWatching)
  const [selectedRange, setSelectedRange] = useState<string>('')
  const [selectedEpisode, setSelectedEpisode] = useState<AnimeEpisode | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  

  // Create episode ranges based on total episode count
  const createEpisodeRanges = (totalEpisodes: number): EpisodeRange[] => {
    const ranges: EpisodeRange[] = []
    const rangeSize = 100
    
    for (let i = 0; i < totalEpisodes; i += rangeSize) {
      const startEpisode = i + 1
      const endEpisode = Math.min(i + rangeSize, totalEpisodes)
      
      ranges.push({
        id: `${startEpisode}-${endEpisode}`,
        startEpisode,
        endEpisode,
        label: `${startEpisode}-${endEpisode}`
      })
    }
    
    return ranges
  }

  // Get episode count from totalEpisodes prop or episodes array length
  const episodeCount = totalEpisodes || episodes.length
  const episodeRanges = episodeCount > 100 ? createEpisodeRanges(episodeCount) : []
  
  // Get current range selection with fallback
  const currentRange = episodeRanges.find(range => range.id === selectedRange) || episodeRanges[0]
  const startEpisode = currentRange?.startEpisode || 1
  const endEpisode = currentRange?.endEpisode || episodeCount

  // Auto-select range containing saved episode from continue watching
  useEffect(() => {
    if (episodeCount > 100 && episodeRanges.length > 0 && !isInitialized) {
      const episodeProgress = selectAnimeEpisodeProgress(animeId)
      if (episodeProgress) {
        // Find which range contains the saved episode
        const targetRange = episodeRanges.find(range => 
          episodeProgress.episodeNumber >= range.startEpisode && 
          episodeProgress.episodeNumber <= range.endEpisode
        )
        if (targetRange) {
          setSelectedRange(targetRange.id)
          // Also set the selected episode
          const savedEpisode = episodes.find(ep => ep.id === episodeProgress.episodeId)
          if (savedEpisode) {
            setSelectedEpisode(savedEpisode)
          } else {
            // Create a mock episode for the saved episode if it's not loaded yet
            const mockSavedEpisode: AnimeEpisode = {
              id: episodeProgress.episodeId,
              episodeId: episodeProgress.episodeId,
              episodeNumber: episodeProgress.episodeNumber,
              title: episodeProgress.episodeTitle,
              image: animeImage,
              url: `/anime/${animeId}/episode/${episodeProgress.episodeNumber}`
            }
            setSelectedEpisode(mockSavedEpisode)
          }
        } else {
          // If saved episode not found in any range, select first range
          setSelectedRange(episodeRanges[0].id)
        }
      } else {
        // If no saved progress, select first range
        setSelectedRange(episodeRanges[0].id)
      }
      setIsInitialized(true)
    }
  }, [episodeCount, episodeRanges, episodes, continueWatching, animeId, isInitialized])

  const handleRangeChange = (rangeId: string) => {
    setSelectedRange(rangeId)
    // Clear selected episode when changing ranges
    setSelectedEpisode(null)
  }

  const handleEpisodeSelect = (episode: AnimeEpisode) => {
    setSelectedEpisode(episode)
    
    // Save to continue watching
    const animeMedia: AnimeMedia = {
      id: animeId,
      title: animeTitle,
      image: animeImage,
      url: `/anime/${animeId}`,
      type: 'anime',
      totalEpisodes: episodeCount, // Use episodeCount instead of episodes.length
    }
    
    dispatch(addToAnimeContinueWatching(animeMedia))
    
    // Save episode progress
    dispatch(saveAnimeEpisodeProgress({
      animeId,
      episodeId: episode.id,
      episodeNumber: episode.episodeNumber,
      episodeTitle: episode.title
    }))
    
  }

  const formatEpisodeNumber = (episodeNumber: number) => {
    return episodeNumber.toString()
  }

  // Generate episode numbers for the current range
  const generateEpisodeNumbers = () => {
    const episodeNumbers = []
    for (let i = startEpisode; i <= endEpisode; i++) {
      episodeNumbers.push(i)
    }
    return episodeNumbers
  }

  const episodeNumbers = generateEpisodeNumbers()

  if (loading) {
    return (
      <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-gray-600 dark:text-gray-400 mt-4">Loading episodes...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Failed to load episodes
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="btn-primary"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    )
  }

  if (episodes.length === 0) {
    return (
      <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
            <span className="text-2xl">🎌</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {animeTitle}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            No episodes available
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Episodes ({episodeCount})
        </h2>
        {episodeCount > 100 && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {episodeRanges.length} range{episodeRanges.length !== 1 ? 's' : ''} available
          </span>
        )}
      </div>

      {episodeCount <= 100 ? (
        // Show episodes directly if 100 or fewer
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {episodes.map((episode) => (
            <div
              key={episode.id}
              onClick={() => handleEpisodeSelect(episode)}
              className={`bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all cursor-pointer ${
                selectedEpisode?.id === episode.id
                  ? 'ring-2 ring-red-500 border-red-500'
                  : 'hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className={`flex-shrink-0 w-8 h-8 rounded flex items-center justify-center text-sm font-medium ${
                  selectedEpisode?.id === episode.id
                    ? 'bg-red-600 text-white'
                    : 'bg-red-600 text-white'
                }`}>
                  {formatEpisodeNumber(episode.episodeNumber)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {episode.title}
                  </h3>
                  {episode.title_japanese && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {episode.title_japanese}
                    </p>
                  )}
                  {episode.aired && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Aired: {new Date(episode.aired).toLocaleDateString()}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1 mt-1">
                    {episode.filler && (
                      <span className="inline-block px-2 py-1 text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded">
                        Filler
                      </span>
                    )}
                    {episode.recap && (
                      <span className="inline-block px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                        Recap
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Show dropdown and episode number buttons if more than 100 episodes
        <div className="space-y-4">
          {/* Episode Range Dropdown */}
          <div className="flex items-center space-x-4">
            <label htmlFor="episode-range" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Episode Range:
            </label>
            <select
              id="episode-range"
              value={selectedRange || (episodeRanges.length > 0 ? episodeRanges[0].id : '')}
              onChange={(e) => handleRangeChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              {episodeRanges.length === 0 ? (
                <option value="">Loading...</option>
              ) : (
                episodeRanges.map((range) => (
                  <option key={range.id} value={range.id}>
                    {range.label}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Episode Number Buttons */}
          <div className="flex flex-wrap gap-2">
            {episodeNumbers.map((episodeNumber) => {
              // Find the actual episode data if available
              const episode = episodes.find(ep => ep.episodeNumber === episodeNumber)
              const isSelected = selectedEpisode?.episodeNumber === episodeNumber
              
              return (
                <button
                  key={episodeNumber}
                  onClick={() => {
                    if (episode) {
                      handleEpisodeSelect(episode)
                    } else {
                      // Create a mock episode for episodes not yet loaded
                      const mockEpisode: AnimeEpisode = {
                        id: `${animeId}-episode-${episodeNumber}`,
                        episodeId: `${animeId}-episode-${episodeNumber}`,
                        episodeNumber,
                        title: `Episode ${episodeNumber}`,
                        image: animeImage,
                        url: `/anime/${animeId}/episode/${episodeNumber}`
                      }
                      handleEpisodeSelect(mockEpisode)
                    }
                  }}
                  className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center text-sm font-medium transition-all ${
                    isSelected
                      ? 'bg-red-600 text-white border-red-600'
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                  }`}
                  title={episode?.title || `Episode ${episodeNumber}`}
                >
                  {episodeNumber}
                </button>
              )
            })}
          </div>

          {/* Show episode details if an episode is selected */}
          {selectedEpisode && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Episode {selectedEpisode.episodeNumber}: {selectedEpisode.title}
              </h3>
              {selectedEpisode.title_japanese && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {selectedEpisode.title_japanese}
                </p>
              )}
              {selectedEpisode.aired && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Aired: {new Date(selectedEpisode.aired).toLocaleDateString()}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                {selectedEpisode.filler && (
                  <span className="inline-block px-2 py-1 text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded">
                    Filler
                  </span>
                )}
                {selectedEpisode.recap && (
                  <span className="inline-block px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                    Recap
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AnimeEpisodeBatches

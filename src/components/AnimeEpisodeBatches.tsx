import { useState, useEffect, useMemo, useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '../store'
import { addToAnimeContinueWatching, saveAnimeEpisodeProgress } from '../store/slices/animeContinueWatchingSlice'
import { selectAnimeContinueWatching, selectAnimeEpisodeProgress } from '../store/slices/animeContinueWatchingSlice'
import { selectIsTorrentEndpointConfigured } from '../store/slices/settingsSlice'
import { torrentSearchService } from '../services/torrentSearch'
import { type AnimeEpisode, type AnimeMedia } from '../types/anime'
import type { ApiTorrentSearchResponse } from '../types/torrent'
import LoadingSpinner from './LoadingSpinner'
import TorrentsTable from './TorrentsTable'

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
  const isTorrentEndpointConfigured = useAppSelector(selectIsTorrentEndpointConfigured)
  const [selectedRange, setSelectedRange] = useState<string>('')
  const [selectedEpisode, setSelectedEpisode] = useState<AnimeEpisode | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [torrentResults, setTorrentResults] = useState<ApiTorrentSearchResponse | null>(null)
  const [torrentLoading, setTorrentLoading] = useState(false)
  const [customQuery, setCustomQuery] = useState<string>('')
  const [isCustomSearch, setIsCustomSearch] = useState(false)
  

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
  
  // Memoize episode ranges to prevent unnecessary re-renders
  const episodeRanges = useMemo(() => {
    return createEpisodeRanges(episodeCount)
  }, [episodeCount])
  
  // Get current range selection with fallback
  const currentRange = episodeRanges.find(range => range.id === selectedRange) || episodeRanges[0]
  const startEpisode = currentRange?.startEpisode || 1
  const endEpisode = currentRange?.endEpisode || episodeCount

  // Auto-select range containing saved episode from continue watching
  useEffect(() => {
    if (episodeRanges.length > 0 && !isInitialized) {
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
  }, [episodeRanges, episodes, continueWatching, animeId, isInitialized])

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

    // Search for torrents for this episode
    searchForEpisodeTorrents(episode)
  }

  const searchForEpisodeTorrents = async (episode: AnimeEpisode) => {
    if (!isTorrentEndpointConfigured) {
      console.log(' Torrent endpoint not configured, skipping torrent search')
      setTorrentResults(null)
      setTorrentLoading(false)
      return
    }

    try {
      setTorrentLoading(true)
      console.log(' Searching for anime episode torrents:', {
        anime: animeTitle,
        episode: episode.episodeNumber,
        title: episode.title
      })

      // Create search query for anime episode
      const seasonStr = '01' // Most anime are single season, use 01 as default
      const episodeStr = episode.episodeNumber.toString().padStart(2, '0')
      const searchQuery = `${animeTitle} s${seasonStr}e${episodeStr}`
      
      console.log(' Anime search query:', searchQuery)
      
      const results = await torrentSearchService.searchTVTorrents(
        animeTitle,
        1, // Season 1 for most anime
        episode.episodeNumber,
        'piratebay'
      )
      
      console.log(' Anime torrent search results:', results)
      setTorrentResults(results)
    } catch (error) {
      console.error('❌ Error searching for anime episode torrents:', error)
      setTorrentResults(null)
    } finally {
      setTorrentLoading(false)
    }
  }

  // Handle custom query changes
  const handleCustomQueryChange = useCallback(async (query: string) => {
    setCustomQuery(query)
    setIsCustomSearch(true)
    
    if (!query.trim() || !selectedEpisode) return

    setTorrentLoading(true)
    
    try {
      const results = await torrentSearchService.searchTorrents({
        site: 'piratebay',
        query: query.trim()
      })
      
      console.log(' Custom anime torrent search results:', results)
      setTorrentResults(results)
    } catch (error) {
      console.error('❌ Error searching with custom query:', error)
      setTorrentResults(null)
    } finally {
      setTorrentLoading(false)
    }
  }, [selectedEpisode])

  // Get the current search query for display
  const getCurrentQuery = useCallback(() => {
    if (isCustomSearch && customQuery) {
      return customQuery
    }
    if (selectedEpisode) {
      const seasonStr = '01' // Most anime are single season, use 01 as default
      const episodeStr = selectedEpisode.episodeNumber.toString().padStart(2, '0')
      return `${animeTitle} s${seasonStr}e${episodeStr}`
    }
    return ''
  }, [isCustomSearch, customQuery, selectedEpisode, animeTitle])

  // Memoize episode numbers for the current range
  const episodeNumbers = useMemo(() => {
    const numbers = []
    for (let i = startEpisode; i <= endEpisode; i++) {
      numbers.push(i)
    }
    return numbers
  }, [startEpisode, endEpisode])

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
      {/* Show episode details at the top if an episode is selected */}
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

          {/* Torrents Table for Selected Episode */}
          {torrentLoading ? (
            <div className="mt-4 flex items-center justify-center py-8">
              <LoadingSpinner />
              <span className="ml-3 text-gray-600 dark:text-gray-400">
                Searching for torrents...
              </span>
            </div>
          ) : (
            <div className="mt-4">
              <TorrentsTable 
                searchResults={torrentResults}
                selectedTorrent={null}
                onTorrentSelect={(torrent) => {
                  console.log(' Anime torrent selected:', torrent.name)
                }}
                onQueryChange={handleCustomQueryChange}
                currentQuery={getCurrentQuery()}
              />
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Episodes ({episodeCount})
        </h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {episodeRanges.length} range{episodeRanges.length !== 1 ? 's' : ''} available
        </span>
      </div>

      {/* Always use dropdown and episode number buttons layout */}
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
      </div>
    </div>
  )
}

export default AnimeEpisodeBatches

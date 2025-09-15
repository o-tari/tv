import { useState, useEffect, useCallback } from 'react'
import { useAppSelector } from '../store'
import { selectTorrentApiUrl, selectUseMockData, selectIsTorrentEndpointConfigured } from '../store/slices/settingsSlice'
import { torrentSearchService as torrentService } from '../services/torrentSearch'
import type { TorrentPlayerState, ApiTorrentSearchResponse } from '../types/torrent'
// import type { WebTorrent } from '../types/webtorrent' // COMMENTED OUT - not used when torrent playback is disabled
import YouTubePlayer from './YouTubePlayer'
import LoadingSpinner from './LoadingSpinner'
import TorrentQueryInput from './TorrentQueryInput'

interface TorrentPlayerProps {
  // For movies
  movieTitle?: string
  // For TV shows
  showTitle?: string
  season?: number
  episode?: number
  // Fallback YouTube video
  youtubeVideoId?: string
  // Callbacks - COMMENTED OUT - not used when torrent playback is disabled
  // onVideoEnd?: () => void
  // onError?: (error: string) => void
  className?: string
}

const TorrentPlayer = ({
  movieTitle,
  showTitle,
  season,
  episode,
  youtubeVideoId,
  // onVideoEnd, // COMMENTED OUT - not used when torrent playback is disabled
  // onError, // COMMENTED OUT - not used when torrent playback is disabled
  className = ''
}: TorrentPlayerProps) => {
  const torrentApiUrl = useAppSelector(selectTorrentApiUrl)
  const useMockData = useAppSelector(selectUseMockData)
  const isTorrentEndpointConfigured = useAppSelector(selectIsTorrentEndpointConfigured)
  const [playerState, setPlayerState] = useState<TorrentPlayerState>({
    isLoading: false,
    error: null,
    status: 'idle',
    progress: 0,
    message: ''
  })
  const [useTorrent, setUseTorrent] = useState(true)
  // const [magnetUrl, setMagnetUrl] = useState<string | null>(null) // COMMENTED OUT - not used when torrent playback is disabled
  const [torrentError, setTorrentError] = useState<string | null>(null)
  const [searchResults, setSearchResults] = useState<ApiTorrentSearchResponse | null>(null)
  const [selectedTorrent, setSelectedTorrent] = useState<{ name: string; size: string; seeders: string; leechers: string; category: string; uploader: string; date: string; magnet: string } | null>(null)
  const [displayedTorrents, setDisplayedTorrents] = useState(10) // Number of torrents to display
  const [customQuery, setCustomQuery] = useState<string>('')
  const [isCustomSearch, setIsCustomSearch] = useState(false)
  // const [loadedTorrents, setLoadedTorrents] = useState<Set<string>>(new Set()) // COMMENTED OUT - not used when torrent playback is disabled
  
  // const videoRef = useRef<HTMLVideoElement>(null) // COMMENTED OUT - not used when torrent playback is disabled
  // const torrentRef = useRef<WebTorrent.Torrent | null>(null) // COMMENTED OUT - not used when torrent playback is disabled
  // const clientRef = useRef<WebTorrent.Instance | null>(null) // COMMENTED OUT - not used when torrent playback is disabled
  // const currentMagnetRef = useRef<string | null>(null) // COMMENTED OUT - not used when torrent playback is disabled

  // Initialize WebTorrent client - COMMENTED OUT
  // useEffect(() => {
  //   const initWebTorrent = async () => {
  //     try {
  //       console.log('🚀 TorrentPlayer: Initializing WebTorrent client...')
  //       setTorrentError(null)
        
  //       // Check for ASM.js errors in console
  //       const originalError = console.error
  //       let asmErrorDetected = false
        
  //       console.error = (...args) => {
  //         if (args.some(arg => typeof arg === 'string' && arg.includes('Invalid asm.js'))) {
  //           asmErrorDetected = true
  //           console.log('⚠️ ASM.js error detected during WebTorrent initialization')
  //         }
  //         originalError.apply(console, args)
  //       }
      
  //       // Use global WebTorrent from CDN
  //       if (typeof window !== 'undefined' && (window as unknown as { WebTorrent: WebTorrent.WebTorrentConstructor }).WebTorrent) {
  //         const WebTorrent = (window as unknown as { WebTorrent: WebTorrent.WebTorrentConstructor }).WebTorrent
  //         const client = new WebTorrent()
  //         clientRef.current = client
  //         console.log('🔍 WebTorrent client:', client)
          
  //         // Restore original console.error
  //         console.error = originalError
          
  //         if (asmErrorDetected) {
  //           throw new Error('ASM.js compatibility issue detected')
  //         }
  //       } else {
  //         throw new Error('WebTorrent not loaded from CDN')
  //       }
        
  //       console.log('✅ WebTorrent client initialized successfully')
  //       setUseTorrent(true)
  //       setTorrentError(null)
        
  //     } catch (error) {
  //       console.error('❌ Failed to load WebTorrent:', error)
  //       const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        
  //       if (errorMessage.includes('ASM.js')) {
  //         setTorrentError('WebTorrent not compatible with this browser - using YouTube instead')
  //       } else {
  //         setTorrentError(`WebTorrent not available: ${errorMessage}`)
  //       }
  //       setUseTorrent(false)
  //     }
  //   }

  //   initWebTorrent()
    
  //   return () => {
  //     console.log('🧹 TorrentPlayer: Cleaning up WebTorrent client...')
      
  //     // Clean up current torrent
  //     if (torrentRef.current) {
  //       try {
  //         torrentRef.current.destroy()
  //         console.log('✅ Current torrent destroyed')
  //       } catch (error) {
  //         console.warn('⚠️ Error destroying current torrent:', error)
  //       }
  //       torrentRef.current = null
  //     }
      
  //     // Clean up WebTorrent client
  //     if (clientRef.current) {
  //       try {
  //         clientRef.current.destroy()
  //         console.log('✅ WebTorrent client destroyed')
  //       } catch (error) {
  //         console.warn('⚠️ Error destroying WebTorrent client:', error)
  //       }
  //       clientRef.current = null
  //     }
      
  //     // Reset refs
  //     currentMagnetRef.current = null
  //   }
  // }, [])

  // Initialize torrent functionality based on configuration
  useEffect(() => {
    if (isTorrentEndpointConfigured) {
      console.log('🎬 TorrentPlayer: Torrent endpoint configured, enabling torrent search')
      setUseTorrent(true)
      setTorrentError(null)
    } else {
      console.log('🎬 TorrentPlayer: Torrent endpoint not configured, using YouTube trailers')
      setUseTorrent(false)
      setTorrentError('Torrent search endpoint not configured. Please configure it in settings.')
    }
  }, [isTorrentEndpointConfigured])

  // Update torrent service URL when settings change
  useEffect(() => {
    torrentService.setBaseUrl(torrentApiUrl)
  }, [torrentApiUrl])

  const updateState = useCallback((updates: Partial<TorrentPlayerState>) => {
    setPlayerState(prev => ({ ...prev, ...updates }))
  }, [])

  // Torrent loading functionality - COMMENTED OUT
  // const loadTorrent = useCallback(async (magnet: string) => {
  //   console.log('📥 TorrentPlayer: Starting torrent load...')
  //   console.log('📥 Magnet URL:', magnet)

  //   if (!clientRef.current) {
  //     console.error('❌ WebTorrent client not available')
  //     throw new Error('WebTorrent client not available')
  //   }

  //   // Check if this torrent is already loaded
  //   if (loadedTorrents.has(magnet)) {
  //     console.log('⚠️ Torrent already loaded, skipping...')
  //     return
  //   }

  //   // Check if we're already loading this torrent
  //   if (currentMagnetRef.current === magnet) {
  //     console.log('⚠️ Torrent already being loaded, skipping...')
  //     return
  //   }

  //   currentMagnetRef.current = magnet

  //   return new Promise<void>((resolve, reject) => {
  //     console.log('📥 Adding torrent to WebTorrent client...')
  //     const torrent = clientRef.current!.add(magnet, (torrent: WebTorrent.Torrent) => {
  //       console.log('📥 Torrent added successfully:', {
  //         name: torrent.name,
  //         files: torrent.files.length,
  //         size: torrent.length,
  //         infoHash: torrent.infoHash
  //       })
        
  //       torrentRef.current = torrent
        
  //       // Add to loaded torrents set
  //       setLoadedTorrents(prev => new Set([...prev, magnet]))
        
  //       updateState({
  //         message: 'Torrent loaded, finding video file...',
  //         progress: 70
  //       })

  //       // Wait for torrent to be ready before accessing files
  //       torrent.on('ready', () => {
  //         console.log('📥 Torrent ready, files available:', torrent.files.length)
          
  //         // Log all files in the torrent
  //         console.log('📥 Torrent files:', torrent.files.map((file: WebTorrent.TorrentFile) => ({
  //           name: file.name,
  //           length: file.length,
  //           type: file.name.split('.').pop()
  //         })))

  //         // Find video file - try multiple extensions
  //         const videoExtensions = ['.mp4', '.mkv', '.avi', '.mov', '.webm', '.m4v']
  //         const file = torrent.files.find((file: WebTorrent.TorrentFile) => 
  //           videoExtensions.some(ext => file.name.toLowerCase().endsWith(ext))
  //         )
          
  //         if (!file) {
  //           console.error('❌ No video file found in torrent')
  //           console.log('📥 Available files:', torrent.files.map((f: WebTorrent.TorrentFile) => f.name))
  //           reject(new Error('No video file found in torrent'))
  //           return
  //         }

  //         console.log('📥 Selected video file:', {
  //           name: file.name,
  //           length: file.length,
  //           size: (file.length / (1024 * 1024)).toFixed(2) + ' MB'
  //         })

  //         updateState({
  //           message: 'Creating video stream...',
  //           progress: 90
  //         })

  //         // Use the simple appendTo approach from the example
  //         const video = videoRef.current
  //         if (video) {
  //           console.log('📥 Appending video file to video element...')
            
  //           // Clear the video element first
  //           video.innerHTML = ''
            
  //           try {
  //             // Use the simple appendTo method from the example
  //             file.appendTo(video)
              
  //             // Add event listeners
  //             const handleLoadedData = () => {
  //               console.log('✅ Video loaded successfully')
  //               updateState({
  //                 isLoading: false,
  //                 status: 'playing',
  //                 message: 'Playing torrent...',
  //                 progress: 100
  //               })
  //               resolve()
  //             }

  //             const handleError = (e: Event) => {
  //               console.error('❌ Video load error:', e)
  //               reject(new Error('Failed to load video from torrent'))
  //             }

  //             const handleCanPlay = () => {
  //               console.log('📥 Video can start playing')
  //             }
              
  //             video.addEventListener('loadeddata', handleLoadedData, { once: true })
  //             video.addEventListener('error', handleError, { once: true })
  //             video.addEventListener('canplay', handleCanPlay)
              
  //             // Set a timeout for video loading
  //             const videoTimeout = setTimeout(() => {
  //               console.error('❌ Video loading timeout')
  //               reject(new Error('Video loading timeout'))
  //             }, 30000)
              
  //             // Clear timeout when video loads
  //             video.addEventListener('loadeddata', () => clearTimeout(videoTimeout), { once: true })
  //             video.addEventListener('error', () => clearTimeout(videoTimeout), { once: true })
              
  //           } catch (error) {
  //             console.error('❌ Error appending video file:', error)
  //             reject(new Error('Failed to append video file'))
  //           }
  //         } else {
  //           console.error('❌ Video element not available')
  //           reject(new Error('Video element not available'))
  //         }
  //       })
  //     })

  //     torrent.on('error', (error: Error) => {
  //       console.error('❌ Torrent error:', error)
  //       clearTimeout(timeoutId)
        
  //       // Don't reject if it's a duplicate torrent error - just log and continue
  //       if (error.message.includes('duplicate torrent')) {
  //         console.log('⚠️ Duplicate torrent detected, continuing...')
  //         return
  //       }
        
  //       // Handle specific WebTorrent errors
  //       if (error.message.includes('Invalid asm.js')) {
  //         console.error('❌ ASM.js error detected, falling back to YouTube')
  //         reject(new Error('WebTorrent ASM.js error - falling back to YouTube'))
  //         return
  //       }
        
  //       reject(error)
  //     })

  //     torrent.on('download', (bytes: number) => {
  //       console.log('📥 Downloaded bytes:', bytes)
  //     })

  //     torrent.on('upload', (bytes: number) => {
  //       console.log('📤 Uploaded bytes:', bytes)
  //     })

  //     // Timeout after 5 minutes (increased from 60 seconds)
  //     const timeoutId = setTimeout(() => {
  //       console.error('❌ Torrent loading timeout')
  //       reject(new Error('Torrent loading timeout'))
  //     }, 300000)

  //     // Clear timeout when torrent is ready or has an error
  //     torrent.on('ready', () => {
  //       clearTimeout(timeoutId)
  //     })
      
  //     torrent.on('error', () => {
  //       clearTimeout(timeoutId)
  //     })
  //   })
  // }, [updateState, loadedTorrents])

  // Mock loadTorrent function that always fails to force YouTube fallback - COMMENTED OUT
  // const loadTorrent = useCallback(async (_magnet: string) => {
  //   console.log('📥 TorrentPlayer: Torrent loading disabled - using YouTube trailers')
  //   throw new Error('Torrent playback disabled - using YouTube trailers')
  // }, [])

  const searchForTorrent = useCallback(async (customSearchQuery?: string) => {
    console.log('🔍 TorrentPlayer: Starting torrent search...')
    console.log('🔍 Search parameters:', { movieTitle, showTitle, season, episode, useTorrent, customSearchQuery })
    console.log('🔍 API URL:', torrentApiUrl)
    console.log('🔍 Mock data mode:', useMockData)

    if (!useTorrent) {
      console.log('🔍 Torrent search disabled, skipping...')
      setUseTorrent(false)
      return
    }

    if (!isTorrentEndpointConfigured) {
      console.log('🔍 Torrent endpoint not configured, skipping...')
      setUseTorrent(false)
      updateState({
        isLoading: false,
        status: 'failed',
        message: 'Torrent search endpoint not configured. Please configure it in settings.',
        progress: 0
      })
      return
    }

    updateState({
      isLoading: true,
      status: 'searching',
      message: 'Searching for torrent...',
      progress: 10
    })

    try {
      // Update torrent service URL
      torrentService.setBaseUrl(torrentApiUrl)
      console.log('🔍 Updated torrent service URL to:', torrentService.getBaseUrl())

      let searchResult: ApiTorrentSearchResponse
      let searchQuery: string
      
      // Use custom query if provided, otherwise use default logic
      if (customSearchQuery) {
        console.log('🔍 Using custom search query:', customSearchQuery)
        searchQuery = customSearchQuery.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ')
        searchResult = await torrentService.searchTorrents({
          site: 'piratebay',
          query: customSearchQuery
        })
      } else if (movieTitle) {
        console.log('🎬 Searching for movie torrent:', movieTitle)
        searchQuery = movieTitle.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ')
        searchResult = await torrentService.searchMovieTorrents(movieTitle, 'piratebay')
      } else if (showTitle && season && episode) {
        console.log('📺 Searching for TV torrent:', { showTitle, season, episode })
        const seasonStr = season.toString().padStart(2, '0')
        const episodeStr = episode.toString().padStart(2, '0')
        searchQuery = `${showTitle} s${seasonStr}e${episodeStr}`.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ')
        searchResult = await torrentService.searchTVTorrents(showTitle, season, episode, 'piratebay')
      } else {
        throw new Error('No valid search parameters provided')
      }

      console.log('🔍 Search query:', searchQuery)
      console.log('🔍 Search results:', searchResult)
      console.log('🔍 Found torrents:', searchResult.data?.length || 0)

      setSearchResults(searchResult)

      updateState({
        status: 'fetching',
        message: 'Found torrents, selecting best one...',
        progress: 30
      })

      const bestMagnet = torrentService.getBestTorrent(searchResult)
      console.log('🔍 Best magnet URL:', bestMagnet)
      
      if (!bestMagnet) {
        throw new Error('No suitable torrent found')
      }

      // Find the selected torrent for logging
      const selected = searchResult.data?.find(t => t.magnet === bestMagnet)
      if (selected) {
        setSelectedTorrent(selected)
        console.log('🔍 Selected torrent:', {
          name: selected.name,
          size: selected.size,
          seeders: selected.seeders,
          leechers: selected.leechers,
          category: selected.category,
          uploader: selected.uploader,
          date: selected.date
        })
      }

      // setMagnetUrl(bestMagnet) // COMMENTED OUT - not used when torrent playback is disabled
      
      updateState({
        status: 'completed',
        message: 'Torrent search completed - showing results',
        progress: 100
      })

      console.log('🔍 Torrent search completed, showing results instead of loading torrent')
      // await loadTorrent(bestMagnet) // COMMENTED OUT - torrent loading disabled
      
    } catch (error) {
      console.error('❌ Torrent search failed:', error)
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        searchParams: { movieTitle, showTitle, season, episode }
      })
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to search for torrent'
      setTorrentError(errorMessage)
      setUseTorrent(false)
      
      // If it's an ASM.js error, provide a more helpful message
      if (errorMessage.includes('ASM.js')) {
        updateState({
          isLoading: false,
          status: 'failed',
          error: 'WebTorrent compatibility issue - using YouTube instead',
          message: 'WebTorrent not compatible with this browser - playing YouTube trailer'
        })
      } else {
        updateState({
          isLoading: false,
          status: 'failed',
          error: errorMessage,
          message: 'Falling back to YouTube...'
        })
      }
    }
  }, [movieTitle, showTitle, season, episode, useTorrent, updateState, torrentApiUrl, useMockData, isTorrentEndpointConfigured])

  // Handle custom query changes
  const handleCustomQueryChange = useCallback((query: string) => {
    setCustomQuery(query)
    setIsCustomSearch(true)
    if (query.trim()) {
      searchForTorrent(query.trim())
    }
  }, [searchForTorrent])

  // Get the current search query for display
  const getCurrentQuery = useCallback(() => {
    if (isCustomSearch && customQuery) {
      return customQuery
    }
    if (movieTitle) {
      return movieTitle
    }
    if (showTitle && season && episode) {
      const seasonStr = season.toString().padStart(2, '0')
      const episodeStr = episode.toString().padStart(2, '0')
      return `${showTitle} s${seasonStr}e${episodeStr}`
    }
    return ''
  }, [isCustomSearch, customQuery, movieTitle, showTitle, season, episode])

  // Start torrent search when component mounts or parameters change
  useEffect(() => {
    console.log('🔍 TorrentPlayer useEffect triggered:', {
      useTorrent,
      movieTitle,
      showTitle,
      season,
      episode,
      isTorrentEndpointConfigured
    })
    
    if (useTorrent && (movieTitle || (showTitle && season && episode))) {
      console.log('🔍 TorrentPlayer: Starting torrent search for:', movieTitle || `${showTitle} s${season}e${episode}`)
      // Reset state
      // setMagnetUrl(null) // COMMENTED OUT - not used when torrent playback is disabled
      setTorrentError(null)
      // currentMagnetRef.current = null // COMMENTED OUT - not used when torrent playback is disabled
      
      // Add a small delay to prevent rapid re-renders
      const timeoutId = setTimeout(() => {
        searchForTorrent()
      }, 100)
      
      return () => clearTimeout(timeoutId)
    } else {
      console.log('🔍 TorrentPlayer: Skipping torrent search - conditions not met')
    }
  }, [movieTitle, showTitle, season, episode, useTorrent, searchForTorrent, isTorrentEndpointConfigured])

  // Handle video end - COMMENTED OUT - not used when torrent playback is disabled
  // const handleVideoEnd = useCallback(() => {
  //   onVideoEnd?.()
  // }, [onVideoEnd])

  // Handle errors - COMMENTED OUT - not used when torrent playback is disabled
  // const handleError = useCallback((error: string) => {
  //   onError?.(error)
  // }, [onError])

  // Handle loading more torrents
  const handleLoadMore = useCallback(() => {
    setDisplayedTorrents(prev => Math.min(prev + 10, searchResults?.data.length || 0))
  }, [searchResults?.data.length])

  // Reset displayed torrents when new search results come in
  useEffect(() => {
    if (searchResults?.data) {
      setDisplayedTorrents(10)
    }
  }, [searchResults?.data])

  // If torrent failed or we're not using torrent, show YouTube fallback with torrent info
  if (!useTorrent || torrentError || playerState.status === 'failed' || playerState.status === 'completed') {
    if (youtubeVideoId) {
      return (
        <div className={className}>
          <YouTubePlayer
            videoId={youtubeVideoId}
          />
          <div className="mt-2 space-y-2">
            {torrentError && (
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 text-sm rounded">
                ⚠️ Torrent playback unavailable: {torrentError}. Playing YouTube trailer instead.
              </div>
            )}
            {/* Show torrent results table - only for movies */}
            {searchResults && movieTitle && (
              <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg p-4">
                {searchResults.data && searchResults.data.length > 0 ? (
                  <>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Found {searchResults.data.length} torrents
                      </h3>
                      <div className="w-80">
                        <TorrentQueryInput
                          initialQuery={getCurrentQuery()}
                          onQueryChange={handleCustomQueryChange}
                          placeholder="Modify search query..."
                          debounceMs={500}
                        />
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-2 px-3 font-medium text-gray-900 dark:text-white">Name</th>
                        <th className="text-left py-2 px-3 font-medium text-gray-900 dark:text-white">Size</th>
                        <th className="text-left py-2 px-3 font-medium text-gray-900 dark:text-white">Seeders</th>
                        <th className="text-center py-2 px-3 font-medium text-gray-900 dark:text-white">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {searchResults.data.slice(0, displayedTorrents).map((torrent, index) => (
                        <tr
                          key={index}
                          className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${
                            selectedTorrent?.magnet === torrent.magnet
                              ? 'bg-green-50 dark:bg-green-900/10'
                              : ''
                          }`}
                        >
                          <td className="py-2 px-3">
                            <div className="font-medium text-gray-900 dark:text-white truncate max-w-xs" title={torrent.name}>
                              {torrent.name}
                            </div>
                          </td>
                          <td className="py-2 px-3 text-gray-600 dark:text-gray-400">
                            {torrent.size}
                          </td>
                          <td className="py-2 px-3 text-gray-600 dark:text-gray-400">
                            <span className="text-green-600 dark:text-green-400 font-medium">
                              {torrent.seeders}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-center">
                            <div className="flex gap-2 justify-center">
                              <button
                                onClick={async () => {
                                  try {
                                    await navigator.clipboard.writeText(torrent.magnet)
                                    alert('Magnet link copied to clipboard!')
                                  } catch (err) {
                                    console.error('Failed to copy magnet:', err)
                                    alert('Failed to copy magnet link')
                                  }
                                }}
                                className="px-3 py-1 rounded text-xs font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                📋 Copy
                              </button>
                              <button
                                onClick={() => {
                                  console.log('🎬 Opening WebTorrent app with magnet:', torrent.name)
                                  console.log('🎬 Magnet URL:', torrent.magnet)
                                  
                                  // Create a temporary link element to trigger the magnet protocol
                                  const link = document.createElement('a')
                                  link.href = torrent.magnet
                                  link.style.display = 'none'
                                  document.body.appendChild(link)
                                  link.click()
                                  document.body.removeChild(link)
                                  
                                  // Also try to open with webtorrent:// protocol
                                  try {
                                    window.open(`webtorrent://${torrent.magnet}`, '_blank')
                                  } catch {
                                    console.log('⚠️ Could not open webtorrent:// protocol, using magnet://')
                                    window.open(torrent.magnet, '_blank')
                                  }
                                }}
                                className="px-3 py-1 rounded text-xs font-medium transition-colors bg-green-600 hover:bg-green-700 text-white"
                              >
                                ▶️ Play
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {searchResults.data.length > displayedTorrents && (
                    <div className="mt-4 text-center">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        Showing {displayedTorrents} of {searchResults.data.length} torrents
                      </div>
                      <button
                        onClick={handleLoadMore}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        Load More ({searchResults.data.length - displayedTorrents} remaining)
                      </button>
                    </div>
                  )}
                </div>
                  </>
                ) : (
                  <div className="p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.709M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      No torrents found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      No torrents were found for this movie. Try adjusting your search terms or check back later.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )
    } else {
      return (
        <div className={`${className} bg-gray-200 dark:bg-gray-800 rounded-lg aspect-video flex items-center justify-center`}>
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
              No video available
            </p>
            <div className="w-16 h-16 mx-auto bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      )
    }
  }

  // If WebTorrent is not available, show a message and fallback to YouTube
  if (useTorrent) {
    if (youtubeVideoId) {
      return (
        <div className={className}>
          <YouTubePlayer
            videoId={youtubeVideoId}
          />
          <div className="mt-2 space-y-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 text-sm rounded">
              Torrent player not available in this environment. Playing YouTube trailer instead.
            </div>
            <div className="p-2 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 text-xs rounded">
              <div className="font-semibold">Test WebTorrent Integration:</div>
              <button
                onClick={() => {
                  const testMagnet = 'magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintel&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fsintel.torrent'
                  console.log('🧪 Testing with example magnet:', testMagnet)
                  // This will trigger the search and load process
                  searchForTorrent()
                }}
                className="mt-2 w-full bg-green-600 hover:bg-green-700 text-white text-xs py-1 px-2 rounded transition-colors"
              >
                🧪 Test with Sintel Example
              </button>
            </div>
          </div>
        </div>
      )
    } else {
      return (
        <div className={`${className} bg-gray-200 dark:bg-gray-800 rounded-lg aspect-video flex items-center justify-center`}>
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
              Torrent player not available
            </p>
            <div className="w-16 h-16 mx-auto bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      )
    }
  }

  // Show loading state while searching/loading torrent
  if (playerState.isLoading || playerState.status === 'searching' || playerState.status === 'fetching' || playerState.status === 'loading') {
    return (
      <div className={className}>
        <div className="bg-gray-200 dark:bg-gray-800 rounded-lg aspect-video flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner />
            <p className="text-gray-600 dark:text-gray-400 text-lg mt-4">
              {playerState.message}
            </p>
            {playerState.progress > 0 && (
              <div className="w-full max-w-xs mx-auto mt-4">
                <div className="bg-gray-300 dark:bg-gray-600 rounded-full h-2">
                  <div 
                    className="bg-red-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${playerState.progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Show search results if available - only for movies */}
        {searchResults && searchResults.data && searchResults.data.length > 0 && movieTitle && (
          <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Found {searchResults.data.length} torrents
              </h3>
              <div className="w-80">
                <TorrentQueryInput
                  initialQuery={getCurrentQuery()}
                  onQueryChange={handleCustomQueryChange}
                  placeholder="Modify search query..."
                  debounceMs={500}
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 px-3 font-medium text-gray-900 dark:text-white">Name</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-900 dark:text-white">Size</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-900 dark:text-white">Seeders</th>
                    <th className="text-center py-2 px-3 font-medium text-gray-900 dark:text-white">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {searchResults.data.slice(0, displayedTorrents).map((torrent, index) => (
                    <tr
                      key={index}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${
                        selectedTorrent?.magnet === torrent.magnet
                          ? 'bg-green-50 dark:bg-green-900/10'
                          : ''
                      }`}
                    >
                      <td className="py-2 px-3">
                        <div className="font-medium text-gray-900 dark:text-white truncate max-w-xs" title={torrent.name}>
                          {torrent.name}
                        </div>
                      </td>
                      <td className="py-2 px-3 text-gray-600 dark:text-gray-400">
                        {torrent.size}
                      </td>
                      <td className="py-2 px-3 text-gray-600 dark:text-gray-400">
                        <span className="text-green-600 dark:text-green-400 font-medium">
                          {torrent.seeders}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(torrent.magnet)
                                alert('Magnet link copied to clipboard!')
                              } catch (err) {
                                console.error('Failed to copy magnet:', err)
                                alert('Failed to copy magnet link')
                              }
                            }}
                            className="px-3 py-1 rounded text-xs font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            📋 Copy
                          </button>
                          <button
                            onClick={() => {
                              console.log('🎬 Opening WebTorrent app with magnet:', torrent.name)
                              console.log('🎬 Magnet URL:', torrent.magnet)
                              
                              // Create a temporary link element to trigger the magnet protocol
                              const link = document.createElement('a')
                              link.href = torrent.magnet
                              link.style.display = 'none'
                              document.body.appendChild(link)
                              link.click()
                              document.body.removeChild(link)
                              
                              // Also try to open with webtorrent:// protocol
                              try {
                                window.open(`webtorrent://${torrent.magnet}`, '_blank')
                              } catch {
                                console.log('⚠️ Could not open webtorrent:// protocol, using magnet://')
                                window.open(torrent.magnet, '_blank')
                              }
                            }}
                            className="px-3 py-1 rounded text-xs font-medium transition-colors bg-green-600 hover:bg-green-700 text-white"
                          >
                            ▶️ Play
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {searchResults.data.length > displayedTorrents && (
                <div className="mt-4 text-center">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    Showing {displayedTorrents} of {searchResults.data.length} torrents
                  </div>
                  <button
                    onClick={handleLoadMore}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Load More ({searchResults.data.length - displayedTorrents} remaining)
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Show torrent video player - COMMENTED OUT
  // if (playerState.status === 'playing' && magnetUrl) {
  //   return (
  //     <div className={className}>
  //       <video
  //         ref={videoRef}
  //         controls
  //         className="w-full h-full rounded-lg"
  //         onEnded={handleVideoEnd}
  //         onError={() => handleError('Video playback error')}
  //       />
  //       <div className="mt-2 space-y-2">
  //         <div className="p-2 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 text-sm rounded">
  //           ✅ Playing from torrent: {movieTitle || `${showTitle} S${season}E${episode}`}
  //         </div>
  //         {selectedTorrent && (
  //           <div className="p-2 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 text-xs rounded">
  //             <div className="font-semibold">Selected Torrent:</div>
  //             <div className="truncate" title={selectedTorrent.name}>{selectedTorrent.name}</div>
  //             <div className="flex justify-between mt-1">
  //               <span>Size: {selectedTorrent.size}</span>
  //               <span>Seeders: {selectedTorrent.seeders}</span>
  //               <span>Leechers: {selectedTorrent.leechers}</span>
  //             </div>
  //           </div>
  //         )}
  //       </div>
  //     </div>
  //   )
  // }

  // Default fallback
  return (
    <div className={`${className} bg-gray-200 dark:bg-gray-800 rounded-lg aspect-video flex items-center justify-center`}>
      <div className="text-center">
        <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
          Loading...
        </p>
        <LoadingSpinner />
      </div>
    </div>
  )
}

export default TorrentPlayer

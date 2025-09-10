import { useEffect, useRef, useState } from 'react'
import { useAppSelector, useAppDispatch } from '../store'
import { updatePlayerState } from '../store/slices/uiSlice'

interface YouTubePlayerProps {
  videoId: string
  onReady?: () => void
  onStateChange?: (state: number) => void
  autoplay?: boolean
}

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

const YouTubePlayer = ({ videoId, onReady, onStateChange, autoplay = false }: YouTubePlayerProps) => {
  const playerRef = useRef<HTMLDivElement>(null)
  const playerInstanceRef = useRef<any>(null)
  const dispatch = useAppDispatch()
  const { playerState } = useAppSelector((state) => state.ui)
  const [isAPIReady, setIsAPIReady] = useState(false)

  // Load YouTube IFrame API
  useEffect(() => {
    if (window.YT) {
      setIsAPIReady(true)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://www.youtube.com/iframe_api'
    script.async = true
    document.head.appendChild(script)

    window.onYouTubeIframeAPIReady = () => {
      setIsAPIReady(true)
    }

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [])

  // Initialize player
  useEffect(() => {
    if (!isAPIReady || !playerRef.current || !videoId) return

    const initializePlayer = () => {
      if (playerInstanceRef.current) {
        playerInstanceRef.current.destroy()
      }

      playerInstanceRef.current = new window.YT.Player(playerRef.current, {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
          autoplay: autoplay ? 1 : 0,
          controls: 1,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
          fs: 1,
          cc_load_policy: 0,
          playsinline: 1,
        },
        events: {
          onReady: () => {
            onReady?.()
          },
          onStateChange: (event: any) => {
            const state = event.data
            onStateChange?.(state)
            
            // Update Redux state
            dispatch(updatePlayerState({
              isPlaying: state === 1, // YT.PlayerState.PLAYING
              duration: playerInstanceRef.current?.getDuration() || 0,
            }))
          },
          onPlaybackQualityChange: () => {
            // Playback quality changed
          },
          onError: () => {
            // YouTube player error
          },
        },
      })
    }

    // Small delay to ensure DOM is ready
    const timer = setTimeout(initializePlayer, 100)
    return () => clearTimeout(timer)
  }, [isAPIReady, videoId, dispatch, onReady, onStateChange])

  // Player controls
  const play = () => {
    if (playerInstanceRef.current) {
      playerInstanceRef.current.playVideo()
    }
  }

  const pause = () => {
    if (playerInstanceRef.current) {
      playerInstanceRef.current.pauseVideo()
    }
  }

  const seekTo = (seconds: number) => {
    if (playerInstanceRef.current) {
      playerInstanceRef.current.seekTo(seconds, true)
    }
  }

  const setVolume = (volume: number) => {
    if (playerInstanceRef.current) {
      playerInstanceRef.current.setVolume(volume * 100)
    }
  }

  const toggleFullscreen = () => {
    if (playerInstanceRef.current) {
      const playerElement = playerInstanceRef.current.getIframe()
      if (playerElement.requestFullscreen) {
        playerElement.requestFullscreen()
      } else if ((playerElement as any).webkitRequestFullscreen) {
        (playerElement as any).webkitRequestFullscreen()
      } else if ((playerElement as any).msRequestFullscreen) {
        (playerElement as any).msRequestFullscreen()
      }
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (event.key.toLowerCase()) {
        case 'k':
          event.preventDefault()
          if (playerState.isPlaying) {
            pause()
          } else {
            play()
          }
          break
        case 'j':
          event.preventDefault()
          const currentTime = playerInstanceRef.current?.getCurrentTime() || 0
          seekTo(Math.max(0, currentTime - 10))
          break
        case 'l':
          event.preventDefault()
          const currentTime2 = playerInstanceRef.current?.getCurrentTime() || 0
          seekTo(currentTime2 + 10)
          break
        case 'f':
          event.preventDefault()
          toggleFullscreen()
          break
        case 'm':
          event.preventDefault()
          // Toggle mute
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [playerState.isPlaying])

  // Expose player methods
  useEffect(() => {
    if (playerInstanceRef.current) {
      // You can expose these methods to parent components if needed
      (window as any).youtubePlayer = {
        play,
        pause,
        seekTo,
        setVolume,
        toggleFullscreen,
      }
    }
  }, [videoId])

  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
      <div ref={playerRef} className="w-full h-full" />
      
      {!isAPIReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <p>Loading player...</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default YouTubePlayer

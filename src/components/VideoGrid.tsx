import { type Video } from '../types/youtube'
import { type VideoMedia } from '../types/anime'
import MediaGrid from './MediaGrid'

// Parse YouTube duration format (PT1M30S) to seconds
const parseDurationToSeconds = (duration: string): number => {
  if (!duration) return 0
  
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return 0
  
  const hours = parseInt(match[1] || '0', 10)
  const minutes = parseInt(match[2] || '0', 10)
  const seconds = parseInt(match[3] || '0', 10)
  
  return hours * 3600 + minutes * 60 + seconds
}

// Filter out YouTube Shorts (videos under 60 seconds)
const filterOutShorts = (videos: Video[]): Video[] => {
  return videos.filter(video => {
    // If duration is empty or not available, don't filter out the video
    if (!video.duration || video.duration.trim() === '') {
      return true
    }
    const durationSeconds = parseDurationToSeconds(video.duration)
    return durationSeconds >= 60 // Videos must be at least 60 seconds to not be considered shorts
  })
}

interface VideoGridProps {
  videos: Video[]
  loading?: boolean
  variant?: 'default' | 'compact' | 'large'
  searchType?: 'video' | 'channel' | 'playlist'
  videoProgress?: Record<string, number> // videoId -> progress percentage
  showProgress?: boolean
  onRemove?: (videoId: string, event: React.MouseEvent) => void // Remove button handler
  showRemoveButton?: boolean // Whether to show remove button
  excludeShorts?: boolean // Whether to filter out YouTube Shorts
}

const VideoGrid = ({
  videos,
  loading = false,
  variant = 'default',
  searchType,
  videoProgress,
  showProgress = false,
  onRemove,
  showRemoveButton = false,
  excludeShorts = true
}: VideoGridProps) => {
  // Filter out shorts if requested
  const filteredVideos = excludeShorts ? filterOutShorts(videos) : videos

  // Convert videos to media format for MediaGrid
  const videoMedia: VideoMedia[] = filteredVideos.map((video) => ({
    id: video.id,
    title: video.title,
    image: video.thumbnail,
    url: `/watch/${video.id}`,
    type: 'video',
    description: video.description,
    channelTitle: video.channelTitle,
    channelId: video.channelId,
    publishedAt: video.publishedAt,
    duration: video.duration,
    viewCount: video.viewCount,
  }))

  return <MediaGrid media={videoMedia} loading={loading} variant={variant} searchType={searchType} videoProgress={videoProgress} showProgress={showProgress} onRemove={onRemove} showRemoveButton={showRemoveButton} />
}

export default VideoGrid

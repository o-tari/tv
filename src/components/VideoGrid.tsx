import { type Video } from '../types/youtube'
import { type VideoMedia } from '../types/anime'
import MediaGrid from './MediaGrid'

interface VideoGridProps {
  videos: Video[]
  loading?: boolean
  variant?: 'default' | 'compact' | 'large'
  searchType?: 'video' | 'channel' | 'playlist'
  videoProgress?: Record<string, number> // videoId -> progress percentage
  showProgress?: boolean
  onRemove?: (videoId: string, event: React.MouseEvent) => void // Remove button handler
  showRemoveButton?: boolean // Whether to show remove button
}

const VideoGrid = ({
  videos,
  loading = false,
  variant = 'default',
  searchType,
  videoProgress,
  showProgress = false,
  onRemove,
  showRemoveButton = false
}: VideoGridProps) => {
  // Convert videos to media format for MediaGrid
  const videoMedia: VideoMedia[] = videos.map((video) => ({
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

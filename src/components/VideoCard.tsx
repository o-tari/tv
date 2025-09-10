import { memo } from 'react'
import { type Video } from '../types/youtube'
import { type VideoMedia } from '../types/anime'
import MediaCard from './MediaCard'

interface VideoCardProps {
  video: Video
  variant?: 'default' | 'compact' | 'large'
  progress?: number // Progress percentage (0-100)
  showProgress?: boolean // Whether to show progress indicator
  onRemove?: (videoId: string, event: React.MouseEvent) => void // Remove button handler
  showRemoveButton?: boolean // Whether to show remove button
}

const VideoCard = memo(({ video, variant = 'default', progress, showProgress = false, onRemove, showRemoveButton = false }: VideoCardProps) => {
  // Convert Video to VideoMedia format for MediaCard
  const videoMedia: VideoMedia = {
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
  }

  return <MediaCard media={videoMedia} variant={variant} progress={progress} showProgress={showProgress} onRemove={onRemove} showRemoveButton={showRemoveButton} />
})

VideoCard.displayName = 'VideoCard'

export default VideoCard

import MediaCardSkeleton from './MediaCardSkeleton'

interface VideoCardSkeletonProps {
  variant?: 'default' | 'compact' | 'large'
}

const VideoCardSkeleton = ({ variant = 'default' }: VideoCardSkeletonProps) => {
  return <MediaCardSkeleton variant={variant} />
}

export default VideoCardSkeleton

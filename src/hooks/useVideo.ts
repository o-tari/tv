import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../store'
import { fetchVideoDetails, fetchRelatedVideos } from '../store/slices/videosSlice'

export const useVideo = (videoId: string) => {
  const dispatch = useAppDispatch()
  const {
    currentVideo,
    currentVideoLoading,
    currentVideoError,
    relatedVideos,
  } = useAppSelector((state) => state.videos)

  // Get related videos for the current video ID
  const currentRelatedVideos = relatedVideos[videoId] || {
    videos: [],
    loading: false,
    error: null,
    nextPageToken: null
  }

  useEffect(() => {
    if (videoId) {
      // Only fetch if we don't already have this video or if it's different from current
      if (currentVideo?.id !== videoId) {
        dispatch(fetchVideoDetails(videoId))
      }
      // Only fetch related videos if we don't already have them for this video
      if (!currentRelatedVideos.videos.length && !currentRelatedVideos.loading) {
        dispatch(fetchRelatedVideos({ videoId }))
      }
    }
  }, [dispatch, videoId, currentVideo?.id, currentRelatedVideos.videos.length, currentRelatedVideos.loading])

  const loadMoreRelated = () => {
    if (videoId && !currentRelatedVideos.loading) {
      dispatch(fetchRelatedVideos({ videoId, pageToken: currentRelatedVideos.nextPageToken || undefined }))
    }
  }

  const retryRelatedVideos = () => {
    if (videoId) {
      dispatch(fetchRelatedVideos({ videoId }))
    }
  }

  return {
    video: currentVideo,
    loading: currentVideoLoading,
    error: currentVideoError,
    relatedVideos: currentRelatedVideos.videos,
    relatedLoading: currentRelatedVideos.loading,
    relatedError: currentRelatedVideos.error,
    loadMoreRelated,
    retryRelatedVideos,
  }
}

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
    relatedLoading,
    relatedError,
  } = useAppSelector((state) => state.videos)

  useEffect(() => {
    if (videoId) {
      dispatch(fetchVideoDetails(videoId))
      dispatch(fetchRelatedVideos({ videoId }))
    }
  }, [dispatch, videoId])

  const loadMoreRelated = () => {
    if (videoId && !relatedLoading) {
      dispatch(fetchRelatedVideos({ videoId }))
    }
  }


  return {
    video: currentVideo,
    loading: currentVideoLoading,
    error: currentVideoError,
    relatedVideos,
    relatedLoading,
    relatedError,
    loadMoreRelated,
  }
}

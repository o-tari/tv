import { useEffect, useMemo, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '../store'
import { fetchVideoDetails, fetchRelatedVideos } from '../store/slices/videosSlice'

export const useVideo = (videoId: string) => {
  const dispatch = useAppDispatch()
  const fetchingRelatedRef = useRef<Set<string>>(new Set())
  const {
    currentVideo,
    currentVideoLoading,
    currentVideoError,
    relatedVideos,
  } = useAppSelector((state) => state.videos)

  // Get related videos for the current video ID - memoized to prevent infinite loops
  const currentRelatedVideos = useMemo(() => {
    return relatedVideos[videoId] || {
      videos: [],
      loading: false,
      error: null,
      nextPageToken: null
    }
  }, [relatedVideos, videoId])

  useEffect(() => {
    if (videoId) {
      // Only fetch if we don't already have this video or if it's different from current
      if (currentVideo?.id !== videoId) {
        dispatch(fetchVideoDetails(videoId))
      }
      // Only fetch related videos if we don't already have them for this video and we're not already fetching
      if (!currentRelatedVideos.videos.length && !currentRelatedVideos.loading && !fetchingRelatedRef.current.has(videoId)) {
        fetchingRelatedRef.current.add(videoId)
        dispatch(fetchRelatedVideos({ videoId })).finally(() => {
          fetchingRelatedRef.current.delete(videoId)
        })
      }
    }
  }, [dispatch, videoId, currentVideo?.id, currentRelatedVideos.videos.length, currentRelatedVideos.loading])

  // Cleanup fetching ref when videoId changes
  useEffect(() => {
    return () => {
      fetchingRelatedRef.current.delete(videoId)
    }
  }, [videoId])

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

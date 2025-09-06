import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../store'
import { fetchVideoComments } from '../store/slices/videosSlice'

export const useComments = (videoId: string) => {
  const dispatch = useAppDispatch()
  const {
    comments,
    commentsLoading,
    commentsError,
    commentsNextPageToken,
  } = useAppSelector((state) => state.videos)

  useEffect(() => {
    if (videoId) {
      dispatch(fetchVideoComments({ videoId }))
    }
  }, [dispatch, videoId])

  const loadMore = () => {
    if (videoId && !commentsLoading && commentsNextPageToken) {
      dispatch(fetchVideoComments({ videoId, pageToken: commentsNextPageToken }))
    }
  }

  const hasMore = !!commentsNextPageToken

  return {
    comments,
    loading: commentsLoading,
    error: commentsError,
    hasMore,
    loadMore,
  }
}

import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../store'
import { fetchChannelDetails, fetchChannelVideos } from '../store/slices/videosSlice'

export const useChannel = (channelId: string) => {
  const dispatch = useAppDispatch()
  const {
    currentChannel,
    channelLoading,
    channelError,
    channelVideos,
    channelVideosLoading,
    channelVideosError,
  } = useAppSelector((state) => state.videos)

  useEffect(() => {
    if (channelId) {
      dispatch(fetchChannelDetails(channelId))
      dispatch(fetchChannelVideos({ channelId }))
    }
  }, [dispatch, channelId])

  const loadMoreVideos = () => {
    if (channelId && !channelVideosLoading) {
      dispatch(fetchChannelVideos({ channelId }))
    }
  }

  return {
    channel: currentChannel,
    loading: channelLoading,
    error: channelError,
    videos: channelVideos,
    videosLoading: channelVideosLoading,
    videosError: channelVideosError,
    loadMoreVideos,
  }
}

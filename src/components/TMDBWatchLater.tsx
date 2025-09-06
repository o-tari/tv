import { useAppSelector, useAppDispatch } from '../store'
import { selectTMDBWatchLater, removeFromWatchLater } from '../store/slices/tmdbWatchLaterSlice'
import TMDBMediaCard from './TMDBMediaCard'
import LoadingSpinner from './LoadingSpinner'

interface TMDBWatchLaterProps {
  limit?: number
}

const TMDBWatchLater = ({ limit }: TMDBWatchLaterProps) => {
  const watchLaterItems = useAppSelector(selectTMDBWatchLater)
  const dispatch = useAppDispatch()

  const handleRemoveFromWatchLater = (itemId: string) => {
    dispatch(removeFromWatchLater(itemId))
  }

  if (watchLaterItems.length === 0) {
    return null
  }

  const displayItems = limit ? watchLaterItems.slice(0, limit) : watchLaterItems

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Watch Later
        </h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {watchLaterItems.length} {watchLaterItems.length === 1 ? 'item' : 'items'}
        </span>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {displayItems.map((item) => (
          <div key={item.id} className="relative group">
            <TMDBMediaCard
              id={item.tmdbId}
              title={item.title}
              thumbnail={item.thumbnail}
              duration={null}
              viewCount={null}
              publishedAt={item.publishedAt}
              channelTitle={null}
              type={item.type}
              rating={item.rating}
              overview={item.overview}
              content={{
                id: item.tmdbId,
                title: item.title,
                name: item.title,
                poster_path: item.thumbnail,
                overview: item.overview,
                vote_average: item.rating,
                vote_count: 0,
                release_date: item.publishedAt,
                first_air_date: item.publishedAt,
              } as any}
            />
            {/* Remove button - appears on hover */}
            <button
              onClick={() => handleRemoveFromWatchLater(item.id)}
              className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              title="Remove from Watch Later"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
      
      {limit && watchLaterItems.length > limit && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => {/* Navigate to full watch later page */}}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
          >
            View All Watch Later
          </button>
        </div>
      )}
    </div>
  )
}

export default TMDBWatchLater

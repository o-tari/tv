import { useState } from 'react'
import { useAppSelector, useAppDispatch } from '../store'
import { searchVideos, clearSearchResults } from '../store/slices/videosSlice'
import VideoGrid from '../components/VideoGrid'

const ExplorePage = () => {
  const dispatch = useAppDispatch()
  const { searchResults, searchLoading, searchError } = useAppSelector((state) => state.videos)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const categories = [
    { id: 'music', name: 'Music', icon: '🎵' },
    { id: 'gaming', name: 'Gaming', icon: '🎮' },
    { id: 'news', name: 'News', icon: '📰' },
    { id: 'sports', name: 'Sports', icon: '⚽' },
    { id: 'education', name: 'Education', icon: '📚' },
    { id: 'science', name: 'Science & Technology', icon: '🔬' },
    { id: 'entertainment', name: 'Entertainment', icon: '🎬' },
    { id: 'howto', name: 'Howto & Style', icon: '✂️' },
    { id: 'travel', name: 'Travel & Events', icon: '✈️' },
    { id: 'autos', name: 'Autos & Vehicles', icon: '🚗' },
    { id: 'comedy', name: 'Comedy', icon: '😂' },
    { id: 'pets', name: 'Pets & Animals', icon: '🐕' },
  ]

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId)
    dispatch(clearSearchResults())
    dispatch(searchVideos({ 
      query: categoryId, 
      filters: { type: 'video' as const } 
    }))
  }

  const handleTrendingClick = () => {
    setSelectedCategory(null)
    dispatch(clearSearchResults())
    // In a real app, this would load trending videos
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Explore
        </h1>

        {/* Categories */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Categories
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={`flex flex-col items-center p-4 rounded-lg border transition-colors ${
                  selectedCategory === category.id
                    ? 'border-red-600 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                <span className="text-2xl mb-2">{category.icon}</span>
                <span className="text-sm font-medium text-center">{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Trending */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Trending
          </h2>
          <button
            onClick={handleTrendingClick}
            className={`px-6 py-3 rounded-lg border transition-colors ${
              selectedCategory === null
                ? 'border-red-600 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            🔥 Trending Now
          </button>
        </div>

        {/* Search results */}
        {selectedCategory && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {categories.find(c => c.id === selectedCategory)?.name} Videos
            </h2>
            
            {searchError ? (
              <div className="text-center py-8">
                <p className="text-red-600 dark:text-red-400">
                  Failed to load videos: {searchError}
                </p>
              </div>
            ) : (
              <VideoGrid
                videos={searchResults}
                loading={searchLoading}
              />
            )}
          </div>
        )}

        {!selectedCategory && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Explore content by category
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Click on a category above to discover videos
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ExplorePage

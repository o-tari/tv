import { useAppSelector } from '../store'
import { selectFavoriteItems, selectSidebarItems } from '../store/slices/favoritesSlice'
import { useNavigate } from 'react-router-dom'

const FavoriteIcons = () => {
  const navigate = useNavigate()
  const favoriteItems = useAppSelector(selectFavoriteItems)
  const sidebarItems = useAppSelector(selectSidebarItems)

  // Get only the favorite items that are currently favorited
  const favoriteSidebarItems = sidebarItems.filter(item => favoriteItems.includes(item.id))

  const handleFavoriteClick = (item: { id: string; href: string; icon: string }) => {
    // Navigate to the item's page
    navigate(item.href)
  }

  if (favoriteItems.length === 0) {
    return null
  }

  return (
    <div className="fixed bottom-6 left-28 flex items-center space-x-2 z-40">
      {favoriteSidebarItems.map((item) => (
        <button
          key={item.id}
          onClick={() => handleFavoriteClick(item)}
          className="w-12 h-12 rounded-full bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 shadow-lg transition-all duration-200 flex items-center justify-center group"
          aria-label={`Go to ${item.label}`}
          title={item.label}
        >
          <span className="text-lg group-hover:scale-110 transition-transform duration-200">
            {item.icon}
          </span>
        </button>
      ))}
    </div>
  )
}

export default FavoriteIcons

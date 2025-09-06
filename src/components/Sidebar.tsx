import { Link, useLocation } from 'react-router-dom'
import { useAppSelector } from '../store'

const Sidebar = () => {
  const location = useLocation()
  const { sidebarOpen } = useAppSelector((state) => state.ui)

  const navigationItems = [
    { label: 'Home', href: '/', icon: '🏠' },
    { label: 'Explore', href: '/explore', icon: '🔍' },
    { label: 'Subscriptions', href: '/subscriptions', icon: '📺' },
    { label: 'History', href: '/history', icon: '🕒' },
    { label: 'Watch later', href: '/watch-later', icon: '⏰' },
  ]

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(href)
  }

  return (
    <aside
      className={`fixed left-0 top-14 bottom-0 bg-white dark:bg-youtube-dark border-r border-gray-200 dark:border-gray-700 transition-all duration-300 z-40 ${
        sidebarOpen ? 'w-64' : 'w-16'
      }`}
    >
      <nav className="h-full overflow-y-auto scrollbar-hide">
        <div className="py-4">
          {navigationItems.map((item, index) => (
            <Link
              key={index}
              to={item.href}
              className={`flex items-center px-4 py-3 text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? 'bg-gray-100 dark:bg-gray-800 text-red-600 dark:text-red-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <span className={`${sidebarOpen ? 'mr-4' : 'mx-auto'} text-lg`}>
                {item.icon}
              </span>
              {sidebarOpen && (
                <span className="truncate">{item.label}</span>
              )}
            </Link>
          ))}
        </div>

        {sidebarOpen && (
          <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Library
            </h3>
            <div className="space-y-1">
              <Link
                to="/library/liked"
                className="flex items-center px-2 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
              >
                <span className="mr-3">👍</span>
                Liked videos
              </Link>
              <Link
                to="/library/playlists"
                className="flex items-center px-2 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
              >
                <span className="mr-3">📋</span>
                Playlists
              </Link>
            </div>
          </div>
        )}
      </nav>
    </aside>
  )
}

export default Sidebar

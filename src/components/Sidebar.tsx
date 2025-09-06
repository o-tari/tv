import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '../store'
import { setSearchQuery, toggleSidebar } from '../store/slices/uiSlice'
import { useTheme } from '../app/providers/ThemeProvider'
import SearchBar from './SearchBar'

const Sidebar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { sidebarOpen } = useAppSelector((state) => state.ui)
  const { theme, toggleTheme } = useTheme()

  const navigationItems = [
    { label: 'Home', href: '/', icon: '🏠' },
    { label: 'Explore', href: '/explore', icon: '🔍' },
    { label: 'Subscriptions', href: '/subscriptions', icon: '📺' },
    { label: 'Continue Watching', href: '/continue-watching', icon: '▶️' },
    { label: 'History', href: '/history', icon: '🕒' },
    { label: 'Watch later', href: '/watch-later', icon: '⏰' },
  ]

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(href)
  }

  const handleSearch = (query: string) => {
    dispatch(setSearchQuery(query))
    navigate(`/search?q=${encodeURIComponent(query)}`)
  }

  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 bg-white dark:bg-youtube-dark border-r border-gray-200 dark:border-gray-700 transition-all duration-300 z-40 ${
        sidebarOpen ? 'w-64' : 'w-16'
      }`}
    >
      <nav className="h-full overflow-y-auto scrollbar-hide">
        {/* Logo Section */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-youtube-red rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </div>
              {sidebarOpen && (
                <span className="text-xl font-bold text-gray-900 dark:text-white">TV</span>
              )}
            </Link>
            
            {/* Menu toggle button */}
            <button
              onClick={() => dispatch(toggleSidebar())}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle sidebar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {sidebarOpen && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <SearchBar onSearch={handleSearch} />
          </div>
        )}

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

        {/* Settings Section */}
        {sidebarOpen && (
          <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Settings
            </h3>
            <div className="space-y-1">
              <button
                onClick={toggleTheme}
                className="flex items-center w-full px-2 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
              >
                <span className="mr-3">
                  {theme === 'light' ? '🌙' : '☀️'}
                </span>
                {theme === 'light' ? 'Dark mode' : 'Light mode'}
              </button>
            </div>
          </div>
        )}
      </nav>
    </aside>
  )
}

export default Sidebar

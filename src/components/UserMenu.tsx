import { Link } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '../store'
import { logout } from '../store/slices/authSlice'

interface UserMenuProps {
  onClose: () => void
}

const UserMenu = ({ onClose }: UserMenuProps) => {
  const dispatch = useAppDispatch()
  const { isAuthenticated } = useAppSelector((state) => state.auth)

  const handleLogout = () => {
    dispatch(logout())
    onClose()
  }

  const menuItems = [
    { label: 'Your channel', href: '/channel/me', icon: '👤' },
    { label: 'History', href: '/history', icon: '🕒' },
    { label: 'Watch later', href: '/watch-later', icon: '⏰' },
    { label: 'Settings', href: '/settings', icon: '⚙️' },
  ]

  return (
    <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
      <div className="py-2">
        {isAuthenticated ? (
          <>
            {menuItems.map((item, index) => (
              <Link
                key={index}
                to={item.href}
                onClick={onClose}
                className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </Link>
            ))}
            <hr className="my-2 border-gray-200 dark:border-gray-700" />
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <span className="mr-3">🚪</span>
              Sign out
            </button>
          </>
        ) : (
          <div className="px-4 py-2">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Sign in to like videos, comment, and subscribe.
            </p>
            <button className="w-full btn-primary text-sm">
              Sign in
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default UserMenu

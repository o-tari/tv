import { useAppDispatch, useAppSelector } from '../store'
import { toggleSidebar } from '../store/slices/uiSlice'

const FloatingSidebarButton = () => {
  const dispatch = useAppDispatch()
  const { sidebarOpen } = useAppSelector((state) => state.ui)

  return (
    <button
      onClick={() => dispatch(toggleSidebar())}
      className={`fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center ${
        sidebarOpen
          ? 'bg-red-600 hover:bg-red-700 text-white'
          : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600'
      }`}
      aria-label="Toggle sidebar"
    >
      <svg 
        className={`w-6 h-6 transition-transform duration-300 ${sidebarOpen ? 'rotate-180' : ''}`} 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M4 6h16M4 12h16M4 18h16" 
        />
      </svg>
    </button>
  )
}

export default FloatingSidebarButton

import { type ReactNode } from 'react'
import Sidebar from '../components/Sidebar'
import MockDataNotification from '../components/MockDataNotification'
import { useAppSelector } from '../store'

interface LayoutProps {
  children: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const { sidebarOpen } = useAppSelector((state) => state.ui)

  return (
    <div className="min-h-screen bg-white dark:bg-youtube-dark text-gray-900 dark:text-white">
      <div className="flex">
        <Sidebar />
        <main
          className={`flex-1 transition-all duration-300 ${
            sidebarOpen ? 'ml-64' : 'ml-16'
          }`}
        >
          <MockDataNotification />
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout

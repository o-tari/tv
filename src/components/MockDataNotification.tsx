import { useState, useEffect } from 'react'

const MockDataNotification = () => {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const USE_MOCK_DATA = !import.meta.env.VITE_YT_API_KEY || 
      import.meta.env.VITE_YT_API_KEY === 'your_youtube_api_key_here'
    
    if (USE_MOCK_DATA) {
      setShow(true)
    }
  }, [])

  if (!show) return null

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            <strong>Demo Mode:</strong> This app is using mock data. To use real YouTube data, 
            add your YouTube API key to the <code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">.env</code> file.
          </p>
        </div>
        <div className="ml-auto pl-3">
          <button
            onClick={() => setShow(false)}
            className="text-yellow-400 hover:text-yellow-600 dark:hover:text-yellow-200"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default MockDataNotification

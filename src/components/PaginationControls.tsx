import { useAppSelector, useAppDispatch } from '../store'
import { 
  selectVideosPerPage, 
  selectCurrentPage, 
  selectTotalVideos,
  selectHasMoreVideos,
  selectLoadingMore,
  setVideosPerPage,
  setCurrentPage,
  loadMoreChannelVideos
} from '../store/slices/channelsSlice'

interface PaginationControlsProps {
  onPageChange?: (page: number) => void
  onVideosPerPageChange?: (videosPerPage: number) => void
}

const PaginationControls = ({ onPageChange, onVideosPerPageChange }: PaginationControlsProps) => {
  const dispatch = useAppDispatch()
  const videosPerPage = useAppSelector(selectVideosPerPage)
  const currentPage = useAppSelector(selectCurrentPage)
  const totalVideos = useAppSelector(selectTotalVideos)
  const hasMoreVideos = useAppSelector(selectHasMoreVideos)
  const loadingMore = useAppSelector(selectLoadingMore)

  const totalPages = Math.ceil(totalVideos / videosPerPage)
  const startIndex = (currentPage - 1) * videosPerPage + 1
  const endIndex = Math.min(currentPage * videosPerPage, totalVideos)

  const handleVideosPerPageChange = (newVideosPerPage: number) => {
    dispatch(setVideosPerPage(newVideosPerPage))
    onVideosPerPageChange?.(newVideosPerPage)
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      dispatch(setCurrentPage(newPage))
      onPageChange?.(newPage)
    }
  }

  const handleLoadMore = () => {
    dispatch(loadMoreChannelVideos())
  }

  const pageOptions = [10, 20, 50, 100]

  if (totalVideos === 0) {
    return null
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      {/* Videos per page selector */}
      <div className="flex items-center space-x-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Videos per page:
        </label>
        <select
          value={videosPerPage}
          onChange={(e) => handleVideosPerPageChange(Number(e.target.value))}
          className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
        >
          {pageOptions.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      {/* Page info */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Showing {startIndex}-{endIndex} of {totalVideos} videos
      </div>

      {/* Pagination controls */}
      <div className="flex items-center space-x-2">
        {/* Previous page button */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        {/* Page numbers */}
        <div className="flex items-center space-x-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum
            if (totalPages <= 5) {
              pageNum = i + 1
            } else if (currentPage <= 3) {
              pageNum = i + 1
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i
            } else {
              pageNum = currentPage - 2 + i
            }

            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`px-3 py-1 text-sm font-medium rounded-md ${
                  currentPage === pageNum
                    ? 'bg-red-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                {pageNum}
              </button>
            )
          })}
        </div>

        {/* Next page button */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>

      {/* Load more button */}
      {hasMoreVideos && (
        <button
          onClick={handleLoadMore}
          disabled={loadingMore}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-sm font-medium rounded-md transition-colors"
        >
          {loadingMore ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Loading...</span>
            </div>
          ) : (
            'Load More Videos'
          )}
        </button>
      )}
    </div>
  )
}

export default PaginationControls

import { useEffect, useRef, type ReactNode } from 'react'

interface InfiniteScrollProps {
  children: ReactNode
  onLoadMore: () => void
  hasMore: boolean
  loading: boolean
  threshold?: number
}

const InfiniteScroll = ({ 
  children, 
  onLoadMore, 
  hasMore, 
  loading, 
  threshold = 200 
}: InfiniteScrollProps) => {
  const observerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0]
        if (target.isIntersecting && hasMore && !loading) {
          onLoadMore()
        }
      },
      {
        rootMargin: `${threshold}px`,
      }
    )

    if (observerRef.current) {
      observer.observe(observerRef.current)
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current)
      }
    }
  }, [onLoadMore, hasMore, loading, threshold])

  return (
    <div>
      {children}
      {hasMore && (
        <div ref={observerRef} className="py-8">
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            </div>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400">
              Scroll to load more
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default InfiniteScroll

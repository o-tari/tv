import { useState } from 'react'
import { type Comment as CommentType } from '../types/youtube'
import Comment from './Comment'
import InfiniteScroll from './InfiniteScroll'

interface CommentsProps {
  comments: CommentType[]
  loading: boolean
  error: string | null
  onLoadMore: () => void
}

const Comments = ({ comments, loading, error, onLoadMore }: CommentsProps) => {
  const [sortBy, setSortBy] = useState<'top' | 'newest'>('top')
  const [newComment, setNewComment] = useState('')

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (newComment.trim()) {
      // In a real app, this would submit the comment
      setNewComment('')
    }
  }

  if (error) {
    return (
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Comments
        </h3>
        <div className="text-center py-8">
          <p className="text-red-600 dark:text-red-400">
            Failed to load comments: {error}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Comments ({comments.length})
        </h3>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'top' | 'newest')}
            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="top">Top comments</option>
            <option value="newest">Newest first</option>
          </select>
        </div>
      </div>

      {/* Comment form */}
      <div className="mb-6">
        <form onSubmit={handleSubmitComment} className="space-y-4">
          <div className="flex space-x-3">
            <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex-shrink-0"></div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!newComment.trim()}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
            >
              Comment
            </button>
          </div>
        </form>
      </div>

      {/* Comments list */}
      <InfiniteScroll
        onLoadMore={onLoadMore}
        hasMore={comments.length > 0}
        loading={loading}
      >
        <div className="space-y-4">
          {comments.map((comment) => (
            <Comment key={comment.id} comment={comment} />
          ))}
        </div>
      </InfiniteScroll>

      {comments.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400">
            No comments yet. Be the first to comment!
          </p>
        </div>
      )}
    </div>
  )
}

export default Comments

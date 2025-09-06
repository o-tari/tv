import { useState } from 'react'
import { type Comment as CommentType } from '../types/youtube'
import { formatNumber } from '../utils/formatNumber'
import { sanitizeHTML } from '../utils/sanitizeHTML'

interface CommentProps {
  comment: CommentType
  showReplies?: boolean
}

const Comment = ({ comment, showReplies = true }: CommentProps) => {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(comment.likeCount)

  const getTimeAgo = (publishedAt: string) => {
    const now = new Date()
    const published = new Date(publishedAt)
    const diffInSeconds = Math.floor((now.getTime() - published.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`
    return `${Math.floor(diffInSeconds / 31536000)} years ago`
  }

  const handleLike = () => {
    if (liked) {
      setLikeCount(likeCount - 1)
    } else {
      setLikeCount(likeCount + 1)
    }
    setLiked(!liked)
  }

  const handleReply = () => {
    setShowReplyForm(!showReplyForm)
  }

  return (
    <div className="flex space-x-3 py-4">
      <img
        src={comment.authorProfileImageUrl}
        alt={comment.authorDisplayName}
        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-1">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
            {comment.authorDisplayName}
          </h4>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {getTimeAgo(comment.publishedAt)}
          </span>
        </div>
        
        <div 
          className="text-sm text-gray-900 dark:text-white mb-2"
          dangerouslySetInnerHTML={{ 
            __html: sanitizeHTML(comment.textDisplay) 
          }}
        />
        
        <div className="flex items-center space-x-4">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-1 text-xs ${
              liked 
                ? 'text-red-600 dark:text-red-400' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            } transition-colors`}
          >
            <svg className="w-4 h-4" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
            </svg>
            <span>{formatNumber(likeCount)}</span>
          </button>
          
          <button
            onClick={handleReply}
            className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Reply
          </button>
        </div>

        {/* Reply form */}
        {showReplyForm && (
          <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <textarea
              placeholder="Add a reply..."
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              rows={3}
            />
            <div className="flex justify-end space-x-2 mt-2">
              <button
                onClick={() => setShowReplyForm(false)}
                className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors">
                Reply
              </button>
            </div>
          </div>
        )}

        {/* Replies */}
        {showReplies && comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 space-y-4">
            {comment.replies.map((reply) => (
              <Comment key={reply.id} comment={reply} showReplies={false} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Comment

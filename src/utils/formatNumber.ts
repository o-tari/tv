/**
 * Formats a number with appropriate suffix (K, M, B)
 * @param num - Number to format
 * @returns Formatted number string
 */
export const formatNumber = (num: number | string): string => {
  const number = typeof num === 'string' ? parseInt(num, 10) : num
  
  if (isNaN(number)) return '0'
  
  if (number >= 1000000000) {
    return (number / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B'
  }
  
  if (number >= 1000000) {
    return (number / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'
  }
  
  if (number >= 1000) {
    return (number / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
  }
  
  return number.toString()
}

/**
 * Formats a number with commas
 * @param num - Number to format
 * @returns Formatted number string with commas
 */
export const formatNumberWithCommas = (num: number | string): string => {
  const number = typeof num === 'string' ? parseInt(num, 10) : num
  
  if (isNaN(number)) return '0'
  
  return number.toLocaleString()
}

/**
 * Formats view count with appropriate suffix
 * @param viewCount - View count as string or number
 * @returns Formatted view count string
 */
export const formatViewCount = (viewCount: string | number): string => {
  const count = typeof viewCount === 'string' ? parseInt(viewCount, 10) : viewCount
  
  if (isNaN(count)) return '0 views'
  
  const formatted = formatNumber(count)
  return `${formatted} view${count !== 1 ? 's' : ''}`
}

/**
 * Formats subscriber count with appropriate suffix
 * @param subscriberCount - Subscriber count as string or number
 * @returns Formatted subscriber count string
 */
export const formatSubscriberCount = (subscriberCount: string | number): string => {
  const count = typeof subscriberCount === 'string' ? parseInt(subscriberCount, 10) : subscriberCount
  
  if (isNaN(count)) return '0 subscribers'
  
  const formatted = formatNumber(count)
  return `${formatted} subscriber${count !== 1 ? 's' : ''}`
}

/**
 * Formats like count with appropriate suffix
 * @param likeCount - Like count as string or number
 * @returns Formatted like count string
 */
export const formatLikeCount = (likeCount: string | number): string => {
  const count = typeof likeCount === 'string' ? parseInt(likeCount, 10) : likeCount
  
  if (isNaN(count)) return '0'
  
  return formatNumber(count)
}

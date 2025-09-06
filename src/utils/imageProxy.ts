// Utility to handle CORS issues with anime images
export const getImageUrl = (originalUrl: string, title: string, type: 'anime' | 'video' = 'anime', size: 'small' | 'medium' | 'large' = 'medium'): string => {
  if (!originalUrl || originalUrl.trim() === '') {
    return getFallbackImage(title, type, size)
  }

  // Check if the URL needs CORS proxy (for external anime images)
  if (originalUrl.includes('zoro.to') || originalUrl.includes('hianime.to')) {
    // Use images.weserv.nl as a proxy (supports CORS and image resizing)
    const dimensions = getDimensions(size, type)
    return `https://images.weserv.nl/?url=${encodeURIComponent(originalUrl)}&w=${dimensions.width}&h=${dimensions.height}&fit=cover&output=webp`
  }

  // For other URLs, use them directly
  return originalUrl
}

const getDimensions = (size: 'small' | 'medium' | 'large', type: 'anime' | 'video') => {
  if (type === 'anime') {
    switch (size) {
      case 'small': return { width: 200, height: 280 }
      case 'medium': return { width: 300, height: 400 }
      case 'large': return { width: 500, height: 700 }
    }
  } else {
    switch (size) {
      case 'small': return { width: 200, height: 112 }
      case 'medium': return { width: 300, height: 200 }
      case 'large': return { width: 500, height: 300 }
    }
  }
}

export const getFallbackImage = (title: string, type: 'anime' | 'video' = 'anime', size: 'small' | 'medium' | 'large' = 'medium'): string => {
  const encodedTitle = encodeURIComponent(title)
  const dimensions = getDimensions(size, type)
  
  if (type === 'anime') {
    return `https://via.placeholder.com/${dimensions.width}x${dimensions.height}/6366f1/ffffff?text=${encodedTitle}`
  } else {
    return `https://via.placeholder.com/${dimensions.width}x${dimensions.height}/ef4444/ffffff?text=${encodedTitle}`
  }
}

// Alternative: Use a different image service that doesn't have CORS issues
export const getAnimeImage = (originalUrl: string, title: string, size: 'small' | 'medium' | 'large' = 'medium'): string => {
  return getImageUrl(originalUrl, title, 'anime', size)
}

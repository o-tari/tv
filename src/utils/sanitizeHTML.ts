/**
 * Sanitizes HTML content by removing potentially dangerous tags and attributes
 * @param html - HTML string to sanitize
 * @returns Sanitized HTML string
 */
export const sanitizeHTML = (html: string): string => {
  if (!html) return ''

  // Create a temporary div element
  const temp = document.createElement('div')
  temp.innerHTML = html

  // List of allowed tags
  const allowedTags = [
    'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'del',
    'a', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'blockquote', 'pre', 'code'
  ]

  // List of allowed attributes
  const allowedAttributes = ['href', 'target', 'rel', 'class', 'id']

  // Recursively sanitize the DOM tree
  const sanitizeNode = (node: Node): Node | null => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element
      const tagName = element.tagName.toLowerCase()

      // Remove disallowed tags
      if (!allowedTags.includes(tagName)) {
        // Move children to parent
        const parent = element.parentNode
        if (parent) {
          while (element.firstChild) {
            parent.insertBefore(element.firstChild, element)
          }
          parent.removeChild(element)
        }
        return null
      }

      // Remove disallowed attributes
      const attributes = Array.from(element.attributes)
      attributes.forEach(attr => {
        if (!allowedAttributes.includes(attr.name)) {
          element.removeAttribute(attr.name)
        }
      })

      // Sanitize href attributes
      const href = element.getAttribute('href')
      if (href && !isValidURL(href)) {
        element.removeAttribute('href')
      }

      // Recursively sanitize children
      const children = Array.from(element.childNodes)
      children.forEach(child => {
        const sanitizedChild = sanitizeNode(child)
        if (sanitizedChild && sanitizedChild !== child) {
          element.replaceChild(sanitizedChild, child)
        }
      })
    }

    return node
  }

  // Sanitize all child nodes
  const children = Array.from(temp.childNodes)
  children.forEach(child => {
    sanitizeNode(child)
  })

  return temp.innerHTML
}

/**
 * Checks if a URL is valid and safe
 * @param url - URL to validate
 * @returns True if URL is valid and safe
 */
const isValidURL = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url)
    // Only allow http and https protocols
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Truncates text to a specified length and adds ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}

/**
 * Extracts plain text from HTML
 * @param html - HTML string
 * @returns Plain text content
 */
export const extractTextFromHTML = (html: string): string => {
  if (!html) return ''

  const temp = document.createElement('div')
  temp.innerHTML = html
  return temp.textContent || temp.innerText || ''
}

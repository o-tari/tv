// Simple rate limiter to prevent API quota exhaustion
class RateLimiter {
  private requests: number[] = []
  private maxRequests: number
  private timeWindow: number

  constructor(maxRequests: number = 10, timeWindow: number = 60000) {
    this.maxRequests = maxRequests
    this.timeWindow = timeWindow
  }

  async waitIfNeeded(): Promise<void> {
    const now = Date.now()
    
    // Remove requests older than the time window
    this.requests = this.requests.filter(time => now - time < this.timeWindow)
    
    // If we're at the limit, wait
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = Math.min(...this.requests)
      const waitTime = this.timeWindow - (now - oldestRequest) + 1000 // Add 1 second buffer
      
      if (waitTime > 0) {
        console.log(`⏳ Rate limiter: Waiting ${Math.ceil(waitTime / 1000)} seconds...`)
        await new Promise(resolve => setTimeout(resolve, waitTime))
      }
    }
    
    // Record this request
    this.requests.push(now)
  }

  getRemainingRequests(): number {
    const now = Date.now()
    this.requests = this.requests.filter(time => now - time < this.timeWindow)
    return Math.max(0, this.maxRequests - this.requests.length)
  }

  reset(): void {
    this.requests = []
  }
}

// Create a global rate limiter for YouTube API calls
export const youtubeRateLimiter = new RateLimiter(8, 60000) // 8 requests per minute

export default RateLimiter

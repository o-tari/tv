import { getTMDBService } from './tmdb'
import { checkForNewEpisodes, getAllEpisodesForTVShow } from '../utils/newEpisodeUtils'
import type { TMDBContinueWatchingItem } from '../store/slices/tmdbContinueWatchingSlice'

export interface ProcessedContinueWatchingItem extends TMDBContinueWatchingItem {
  hasNewEpisodes: boolean
  newEpisodesCount: number
}

export class NewEpisodeService {
  private tmdbService: any

  constructor(tmdbApiKey: string) {
    this.tmdbService = getTMDBService(tmdbApiKey)
  }

  /**
   * Process all continue watching items to check for new episodes
   */
  async processItemsForNewEpisodes(items: TMDBContinueWatchingItem[]): Promise<ProcessedContinueWatchingItem[]> {
    const processedItems: ProcessedContinueWatchingItem[] = []

    for (const item of items) {
      if (item.type !== 'tv' || !item.lastWatchedEpisode) {
        // For non-TV items or items without last watched episode, just copy the item
        processedItems.push({
          ...item,
          hasNewEpisodes: false,
          newEpisodesCount: 0
        })
        continue
      }

      try {
        // Get TV show details to access seasons
        const tvDetails = await this.tmdbService.getTVDetails(item.tmdbId)
        if (!tvDetails.seasons) {
          processedItems.push({
            ...item,
            hasNewEpisodes: false,
            newEpisodesCount: 0
          })
          continue
        }

        // Get all episodes
        const allEpisodes = await getAllEpisodesForTVShow(this.tmdbService, item.tmdbId, tvDetails.seasons)
        
        // Check for new episodes
        const newEpisodeInfo = checkForNewEpisodes(item.lastWatchedEpisode, allEpisodes)
        
        processedItems.push({
          ...item,
          hasNewEpisodes: newEpisodeInfo.hasNewEpisodes,
          newEpisodesCount: newEpisodeInfo.newEpisodesCount
        })
      } catch (error) {
        console.error('Error checking for new episodes for item:', item.title, error)
        processedItems.push({
          ...item,
          hasNewEpisodes: false,
          newEpisodesCount: 0
        })
      }
    }

    // Sort items: new episodes first, then by last watched time
    return processedItems.sort((a, b) => {
      // If both have new episodes or neither has new episodes, sort by last watched time
      if (a.hasNewEpisodes === b.hasNewEpisodes) {
        return b.lastWatchedTime - a.lastWatchedTime
      }
      // Items with new episodes come first
      return a.hasNewEpisodes ? -1 : 1
    })
  }
}

// Create a singleton instance
let newEpisodeService: NewEpisodeService | null = null

export const getNewEpisodeService = (apiKey: string): NewEpisodeService => {
  if (!newEpisodeService || newEpisodeService['tmdbService']['apiKey'] !== apiKey) {
    newEpisodeService = new NewEpisodeService(apiKey)
  }
  return newEpisodeService
}

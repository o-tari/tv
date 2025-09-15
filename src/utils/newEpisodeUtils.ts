import type { TMDBEpisode } from '../types/tmdb'

export interface LastWatchedEpisode {
  seasonNumber: number
  episodeNumber: number
  airDate: string
}

export interface NewEpisodeInfo {
  hasNewEpisodes: boolean
  latestEpisode?: TMDBEpisode
  newEpisodesCount: number
}

/**
 * Checks if a TV show has new episodes based on the last watched episode and available episodes
 * @param lastWatchedEpisode - The last episode the user watched
 * @param allEpisodes - All available episodes from the TV show
 * @returns Information about new episodes
 */
export function checkForNewEpisodes(
  lastWatchedEpisode: LastWatchedEpisode | undefined,
  allEpisodes: TMDBEpisode[]
): NewEpisodeInfo {
  if (!lastWatchedEpisode || allEpisodes.length === 0) {
    return {
      hasNewEpisodes: false,
      newEpisodesCount: 0
    }
  }

  const currentDate = new Date()
  
  // Filter episodes that:
  // 1. Have aired (air_date is not empty and is before/on current date)
  // 2. Are after the last watched episode (higher season or same season with higher episode number)
  // 3. Have a valid air date
  const newEpisodes = allEpisodes.filter(episode => {
    if (!episode.air_date) return false
    
    const episodeAirDate = new Date(episode.air_date)
    
    // Episode must have aired
    if (episodeAirDate > currentDate) return false
    
    // Episode must be after the last watched episode
    const isAfterLastWatched = 
      episode.season_number > lastWatchedEpisode.seasonNumber ||
      (episode.season_number === lastWatchedEpisode.seasonNumber && 
       episode.episode_number > lastWatchedEpisode.episodeNumber)
    
    return isAfterLastWatched
  })

  // Sort episodes by season and episode number to get the latest
  const sortedNewEpisodes = newEpisodes.sort((a, b) => {
    if (a.season_number !== b.season_number) {
      return a.season_number - b.season_number
    }
    return a.episode_number - b.episode_number
  })

  return {
    hasNewEpisodes: newEpisodes.length > 0,
    latestEpisode: sortedNewEpisodes[sortedNewEpisodes.length - 1],
    newEpisodesCount: newEpisodes.length
  }
}

/**
 * Checks if an episode air date is in the future
 * @param airDate - The air date string (can be empty or null)
 * @returns true if the episode air date is in the future, false otherwise
 */
export function isEpisodeInFuture(airDate: string | null | undefined): boolean {
  if (!airDate) return false
  
  const currentDate = new Date()
  const episodeAirDate = new Date(airDate)
  
  return episodeAirDate > currentDate
}

/**
 * Formats a date string to display with month name
 * @param dateString - The date string (YYYY-MM-DD format)
 * @returns formatted date string with month name (e.g., "Jan 15, 2024")
 */
export function formatDateWithMonthName(dateString: string | null | undefined): string {
  if (!dateString) return ''
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch (error) {
    return dateString
  }
}

/**
 * Gets all episodes for a TV show by fetching all seasons
 * This would typically be called when checking for new episodes
 */
export async function getAllEpisodesForTVShow(
  tmdbService: any,
  tvId: number,
  seasons: Array<{ season_number: number }>
): Promise<TMDBEpisode[]> {
  const allEpisodes: TMDBEpisode[] = []
  
  try {
    // Fetch episodes for each season
    for (const season of seasons) {
      const seasonDetails = await tmdbService.getSeasonDetails(tvId, season.season_number)
      if (seasonDetails.episodes) {
        allEpisodes.push(...seasonDetails.episodes)
      }
    }
  } catch (error) {
    console.error('Error fetching episodes for TV show:', error)
  }
  
  return allEpisodes
}

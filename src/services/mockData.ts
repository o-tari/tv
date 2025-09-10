import { type Video, type Channel } from '../types/youtube'

// Mock data for when API is not available
export const mockVideos: Video[] = [
  // Music videos
  {
    id: 'mock-music-1',
    title: 'Best Music Videos 2024 - Top Hits',
    description: 'The most popular music videos and songs of 2024 featuring amazing artists and concerts.',
    thumbnail: 'https://picsum.photos/480/360?random=1',
    channelTitle: 'Music Channel',
    channelId: 'mock-music-channel',
    publishedAt: '2024-01-15T10:00:00Z',
    duration: 'PT15M30S',
    viewCount: '125000',
  },
  {
    id: 'mock-music-2',
    title: 'Live Concert Performance - Amazing Artist',
    description: 'Incredible live concert performance with amazing music and song performances.',
    thumbnail: 'https://picsum.photos/480/360?random=2',
    channelTitle: 'Concert Live',
    channelId: 'mock-concert-channel',
    publishedAt: '2024-01-14T14:30:00Z',
    duration: 'PT22M15S',
    viewCount: '89000',
  },
  
  // Gaming videos
  {
    id: 'mock-gaming-1',
    title: 'Epic Gaming Stream - New Game Release',
    description: 'Amazing gaming content with live stream gameplay and game reviews.',
    thumbnail: 'https://picsum.photos/480/360?random=3',
    channelTitle: 'Gaming Pro',
    channelId: 'mock-gaming-channel',
    publishedAt: '2024-01-13T09:15:00Z',
    duration: 'PT18M45S',
    viewCount: '156000',
  },
  {
    id: 'mock-gaming-2',
    title: 'Twitch Stream Highlights - Gaming Fun',
    description: 'Best moments from gaming streams and twitch gameplay sessions.',
    thumbnail: 'https://picsum.photos/480/360?random=4',
    channelTitle: 'Stream Master',
    channelId: 'mock-stream-channel',
    publishedAt: '2024-01-12T16:45:00Z',
    duration: 'PT25M20S',
    viewCount: '98000',
  },
  
  // News videos
  {
    id: 'mock-news-1',
    title: 'Breaking News Update - Latest Events',
    description: 'Latest news and current events with breaking news updates and reports.',
    thumbnail: 'https://picsum.photos/480/360?random=5',
    channelTitle: 'News Network',
    channelId: 'mock-news-channel',
    publishedAt: '2024-01-11T11:20:00Z',
    duration: 'PT20M10S',
    viewCount: '134000',
  },
  {
    id: 'mock-news-2',
    title: 'Daily News Report - Current Affairs',
    description: 'Comprehensive news report covering current affairs and breaking news.',
    thumbnail: 'https://picsum.photos/480/360?random=6',
    channelTitle: 'Daily News',
    channelId: 'mock-daily-news',
    publishedAt: '2024-01-10T13:30:00Z',
    duration: 'PT16M35S',
    viewCount: '87000',
  },
  
  // Education videos
  {
    id: 'mock-education-1',
    title: 'Learn Programming - Complete Tutorial',
    description: 'Comprehensive programming tutorial and course for beginners to learn coding.',
    thumbnail: 'https://picsum.photos/480/360?random=7',
    channelTitle: 'Learn Academy',
    channelId: 'mock-education-channel',
    publishedAt: '2024-01-09T08:00:00Z',
    duration: 'PT30M45S',
    viewCount: '245000',
  },
  {
    id: 'mock-education-2',
    title: 'Math Lesson - Advanced Concepts',
    description: 'Educational content teaching advanced mathematical concepts and lessons.',
    thumbnail: 'https://picsum.photos/480/360?random=8',
    channelTitle: 'Math Tutor',
    channelId: 'mock-math-channel',
    publishedAt: '2024-01-08T15:20:00Z',
    duration: 'PT28M15S',
    viewCount: '189000',
  },
  
  // Science & Technology
  {
    id: 'mock-science-1',
    title: 'Amazing Science Discovery - Tech Innovation',
    description: 'Latest science research and technology innovation with amazing discoveries.',
    thumbnail: 'https://picsum.photos/480/360?random=9',
    channelTitle: 'Science Channel',
    channelId: 'mock-science-channel',
    publishedAt: '2024-01-07T12:10:00Z',
    duration: 'PT22M30S',
    viewCount: '167000',
  },
  {
    id: 'mock-tech-1',
    title: 'Technology Review - Latest Gadgets',
    description: 'Comprehensive technology review of latest gadgets and tech innovations.',
    thumbnail: 'https://picsum.photos/480/360?random=10',
    channelTitle: 'Tech Review',
    channelId: 'mock-tech-channel',
    publishedAt: '2024-01-06T14:45:00Z',
    duration: 'PT19M20S',
    viewCount: '203000',
  },
  
  // Comedy videos
  {
    id: 'mock-comedy-1',
    title: 'Funny Comedy Show - Hilarious Jokes',
    description: 'Amazing comedy content with funny jokes and humor that will make you laugh.',
    thumbnail: 'https://picsum.photos/480/360?random=11',
    channelTitle: 'Comedy Central',
    channelId: 'mock-comedy-channel',
    publishedAt: '2024-01-05T20:30:00Z',
    duration: 'PT15M45S',
    viewCount: '312000',
  },
  {
    id: 'mock-comedy-2',
    title: 'Stand-up Comedy Special',
    description: 'Hilarious stand-up comedy performance with amazing humor and funny moments.',
    thumbnail: 'https://picsum.photos/480/360?random=12',
    channelTitle: 'Stand-up Pro',
    channelId: 'mock-standup-channel',
    publishedAt: '2024-01-04T19:15:00Z',
    duration: 'PT35M10S',
    viewCount: '278000',
  },
  
  // Entertainment videos
  {
    id: 'mock-entertainment-1',
    title: 'Movie Review - Hollywood Blockbuster',
    description: 'Entertainment content featuring movie reviews and celebrity interviews.',
    thumbnail: 'https://picsum.photos/480/360?random=13',
    channelTitle: 'Movie Reviews',
    channelId: 'mock-movie-channel',
    publishedAt: '2024-01-03T16:20:00Z',
    duration: 'PT24M30S',
    viewCount: '189000',
  },
  {
    id: 'mock-entertainment-2',
    title: 'Celebrity Show - Hollywood Stars',
    description: 'Entertainment show featuring celebrity interviews and Hollywood stars.',
    thumbnail: 'https://picsum.photos/480/360?random=14',
    channelTitle: 'Celebrity News',
    channelId: 'mock-celebrity-channel',
    publishedAt: '2024-01-02T18:45:00Z',
    duration: 'PT21M15S',
    viewCount: '156000',
  },
  
  // Lifestyle videos
  {
    id: 'mock-lifestyle-1',
    title: 'Fashion & Beauty Tips - Style Guide',
    description: 'Lifestyle content featuring fashion tips, beauty tutorials, and health advice.',
    thumbnail: 'https://picsum.photos/480/360?random=15',
    channelTitle: 'Fashion & Beauty',
    channelId: 'mock-fashion-channel',
    publishedAt: '2024-01-01T11:30:00Z',
    duration: 'PT18M40S',
    viewCount: '234000',
  },
  {
    id: 'mock-lifestyle-2',
    title: 'Fitness Workout - Health & Wellness',
    description: 'Health and fitness content with workout routines and wellness tips.',
    thumbnail: 'https://picsum.photos/480/360?random=16',
    channelTitle: 'Fitness Pro',
    channelId: 'mock-fitness-channel',
    publishedAt: '2023-12-31T07:00:00Z',
    duration: 'PT26M25S',
    viewCount: '198000',
  },
  
  // Travel videos
  {
    id: 'mock-travel-1',
    title: 'Amazing Travel Destination - Adventure Trip',
    description: 'Travel content featuring amazing destinations and adventure trips around the world.',
    thumbnail: 'https://picsum.photos/480/360?random=17',
    channelTitle: 'Travel Adventures',
    channelId: 'mock-travel-channel',
    publishedAt: '2023-12-30T14:15:00Z',
    duration: 'PT32M50S',
    viewCount: '267000',
  },
  {
    id: 'mock-travel-2',
    title: 'Vacation Guide - Best Destinations',
    description: 'Travel guide featuring the best vacation destinations and trip planning tips.',
    thumbnail: 'https://picsum.photos/480/360?random=18',
    channelTitle: 'Travel Guide',
    channelId: 'mock-travel-guide',
    publishedAt: '2023-12-29T10:30:00Z',
    duration: 'PT29M35S',
    viewCount: '145000',
  },
  
  // General/Education videos
  {
    id: 'mock-general-1',
    title: 'How to Build a YouTube Clone with React',
    description: 'Learn how to build a production-ready YouTube clone using React, TypeScript, and the YouTube Data API.',
    thumbnail: 'https://picsum.photos/480/360?random=19',
    channelTitle: 'Code Academy',
    channelId: 'mock-channel-1',
    publishedAt: '2024-01-15T10:00:00Z',
    duration: 'PT15M30S',
    viewCount: '125000',
  },
  {
    id: 'mock-general-2',
    title: 'React 19 New Features Explained',
    description: 'Discover the latest features in React 19 and how they can improve your development experience.',
    thumbnail: 'https://picsum.photos/480/360?random=20',
    channelTitle: 'React Masters',
    channelId: 'mock-channel-2',
    publishedAt: '2024-01-14T14:30:00Z',
    duration: 'PT22M15S',
    viewCount: '89000',
  },
]

export const mockChannel: Channel = {
  id: 'mock-channel-1',
  title: 'Code Academy',
  description: 'Learn modern web development with practical tutorials and real-world projects.',
  thumbnail: 'https://picsum.photos/240/240?random=100',
  subscriberCount: '2500000',
  videoCount: '1250',
  viewCount: '125000000',
  customUrl: '@codeacademy',
  country: 'US',
}

export const mockSearchResults = {
  items: mockVideos,
  nextPageToken: 'mock-next-page',
  totalResults: 1000,
}

export const mockRelatedVideos = {
  items: mockVideos.slice(1, 4),
  nextPageToken: 'mock-related-next',
  totalResults: 500,
}

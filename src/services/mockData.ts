import { type Video, type Channel } from '../types/youtube'

// Mock data for when API is not available
export const mockVideos: Video[] = [
  {
    id: 'mock-1',
    title: 'How to Build a YouTube Clone with React',
    description: 'Learn how to build a production-ready YouTube clone using React, TypeScript, and the YouTube Data API.',
    thumbnail: 'https://picsum.photos/480/360?random=1',
    channelTitle: 'Code Academy',
    channelId: 'mock-channel-1',
    publishedAt: '2024-01-15T10:00:00Z',
    duration: 'PT15M30S',
    viewCount: '125000',
  },
  {
    id: 'mock-2',
    title: 'React 19 New Features Explained',
    description: 'Discover the latest features in React 19 and how they can improve your development experience.',
    thumbnail: 'https://picsum.photos/480/360?random=2',
    channelTitle: 'React Masters',
    channelId: 'mock-channel-2',
    publishedAt: '2024-01-14T14:30:00Z',
    duration: 'PT22M15S',
    viewCount: '89000',
  },
  {
    id: 'mock-3',
    title: 'TypeScript Best Practices 2024',
    description: 'Essential TypeScript patterns and practices every developer should know.',
    thumbnail: 'https://picsum.photos/480/360?random=3',
    channelTitle: 'TypeScript Pro',
    channelId: 'mock-channel-3',
    publishedAt: '2024-01-13T09:15:00Z',
    duration: 'PT18M45S',
    viewCount: '156000',
  },
  {
    id: 'mock-4',
    title: 'Building Responsive UIs with Tailwind CSS',
    description: 'Master responsive design using Tailwind CSS utility classes.',
    thumbnail: 'https://picsum.photos/480/360?random=4',
    channelTitle: 'CSS Masters',
    channelId: 'mock-channel-4',
    publishedAt: '2024-01-12T16:45:00Z',
    duration: 'PT25M20S',
    viewCount: '98000',
  },
  {
    id: 'mock-5',
    title: 'Redux Toolkit State Management',
    description: 'Learn modern Redux patterns with Redux Toolkit for better state management.',
    thumbnail: 'https://picsum.photos/480/360?random=5',
    channelTitle: 'State Management Pro',
    channelId: 'mock-channel-5',
    publishedAt: '2024-01-11T11:20:00Z',
    duration: 'PT20M10S',
    viewCount: '134000',
  },
  {
    id: 'mock-6',
    title: 'Vite vs Webpack: Build Tool Comparison',
    description: 'Compare Vite and Webpack for modern JavaScript development.',
    thumbnail: 'https://picsum.photos/480/360?random=6',
    channelTitle: 'Build Tools Expert',
    channelId: 'mock-channel-6',
    publishedAt: '2024-01-10T13:30:00Z',
    duration: 'PT16M35S',
    viewCount: '87000',
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

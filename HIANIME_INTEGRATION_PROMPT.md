# HiAnime API Integration - Implementation Guide

## Overview
This document provides a comprehensive guide for implementing HiAnime API integration into a React application. The implementation includes API key management, caching, routing, and UI components.

## API Details

### Base URL
```
https://hianime.p.rapidapi.com
```

### Required Headers
```
x-rapidapi-host: hianime.p.rapidapi.com
x-rapidapi-key: YOUR_API_KEY
```

### Key Endpoints

#### 1. Home Page Data
```bash
GET /anime/home
```
Returns comprehensive home page data including:
- Spotlight animes
- Trending animes
- Latest episodes
- Upcoming animes
- Top 10 rankings (today, week, month)
- Top airing animes
- Available genres

#### 2. Anime Information
```bash
GET /anime/info?id={anime_id}
```
Returns detailed anime information including:
- Basic info (name, description, poster)
- Statistics (episodes, rating, quality, type)
- Character and voice actor information
- Promotional videos
- Additional metadata (studios, producers, genres)

## Implementation Structure

### 1. Settings Configuration
- Add HiAnime API key to settings slice
- Include API key input in settings component
- Store API key in localStorage with other settings

### 2. Type Definitions
Create comprehensive TypeScript interfaces for:
- API response structures
- Converted media formats
- Cache data structures
- Component props

### 3. Service Layer
Implement HiAnime service with:
- API key management
- Request/response handling
- Local storage caching (1-hour lifetime)
- Data conversion utilities
- Error handling

### 4. Caching Strategy
- Cache duration: 1 hour (3,600,000 ms)
- Cache key format: `hianime_cache_{endpoint}_{params}`
- Automatic cache expiration
- Cache management utilities

### 5. UI Components

#### Main Page (HiAnimePage)
- Tabbed interface for different content types
- Search functionality
- Media grid display
- Loading and error states
- Responsive design

#### Watch Page (HiAnimeWatchPage)
- Detailed anime information display
- Character and voice actor listings
- Promotional video embeds
- Related anime suggestions
- Navigation controls

### 6. Routing
- `/hianime` - Main HiAnime page
- `/hianime/:animeId` - Individual anime watch page
- Lazy loading for performance

### 7. Navigation
- Add HiAnime to sidebar navigation
- Use appropriate icon (🌸)
- Active state management

## Key Features

### Data Conversion
Convert HiAnime API responses to unified media format for compatibility with existing components:
- Spotlight animes → Media format
- Trending animes → Media format
- Latest episodes → Media format
- Upcoming animes → Media format
- Top 10 rankings → Media format
- Top airing animes → Media format

### Error Handling
- API key validation
- Network error handling
- User-friendly error messages
- Retry mechanisms

### Performance Optimizations
- Lazy loading of components
- Local storage caching
- Efficient data conversion
- Responsive image loading

## Usage Instructions

### 1. API Key Setup
1. Go to Settings page
2. Enter HiAnime API key in the designated field
3. Save settings
4. API key is automatically stored and used for requests

### 2. Navigation
1. Click on "HiAnime" in the sidebar
2. Browse different content tabs
3. Click on any anime to view details
4. Use search functionality (when implemented)

### 3. Caching
- Data is automatically cached for 1 hour
- Cache is cleared when API key changes
- Manual cache clearing available through service

## File Structure
```
src/
├── types/
│   └── hianime.ts              # Type definitions
├── services/
│   └── hianime.ts              # API service and caching
├── pages/
│   ├── HiAnimePage.tsx         # Main HiAnime page
│   └── HiAnimeWatchPage.tsx    # Individual anime page
├── store/slices/
│   └── settingsSlice.ts        # Updated with HiAnime API key
├── components/
│   ├── Sidebar.tsx             # Updated with HiAnime navigation
│   └── Settings.tsx            # Updated with HiAnime API key input
└── app/
    └── App.tsx                 # Updated with HiAnime routes
```

## API Response Examples

### Home Page Response Structure
```json
{
  "spotlightAnimes": [...],
  "trendingAnimes": [...],
  "latestEpisodeAnimes": [...],
  "topUpcomingAnimes": [...],
  "top10Animes": {
    "today": [...],
    "week": [...],
    "month": [...]
  },
  "topAiringAnimes": [...],
  "genres": [...]
}
```

### Anime Info Response Structure
```json
{
  "anime": {
    "info": {
      "id": "string",
      "name": "string",
      "description": "string",
      "poster": "string",
      "stats": {...},
      "charactersVoiceActors": [...],
      "promotionalVideos": [...]
    },
    "moreInfo": {
      "genres": [...],
      "studios": "string",
      "producers": [...],
      "malscore": "string"
    }
  },
  "mostPopularAnimes": [...]
}
```

## Testing Checklist

- [ ] API key configuration works
- [ ] Home page loads all content types
- [ ] Caching works correctly (1-hour expiration)
- [ ] Navigation between pages works
- [ ] Error handling displays appropriate messages
- [ ] Responsive design works on different screen sizes
- [ ] Search functionality (when implemented)
- [ ] Watch page displays all anime information
- [ ] Character and voice actor information displays
- [ ] Promotional videos embed correctly

## Future Enhancements

1. **Search Functionality**
   - Implement search API endpoint
   - Add search results page
   - Include search filters

2. **Episode Streaming**
   - Add episode listing
   - Implement video player integration
   - Add streaming link management

3. **User Features**
   - Add to watchlist functionality
   - Continue watching tracking
   - User ratings and reviews

4. **Advanced Features**
   - Genre filtering
   - Advanced search filters
   - Recommendation system
   - Social features

## Troubleshooting

### Common Issues

1. **API Key Not Working**
   - Verify API key is correct
   - Check if API key has proper permissions
   - Ensure API key is saved in settings

2. **Caching Issues**
   - Clear browser localStorage
   - Check cache expiration settings
   - Verify cache key generation

3. **Network Errors**
   - Check internet connection
   - Verify API endpoint availability
   - Check for CORS issues

4. **UI Issues**
   - Verify component imports
   - Check for missing dependencies
   - Ensure proper routing configuration

## Security Considerations

- API keys are stored in localStorage (client-side)
- Consider implementing server-side proxy for production
- Validate all API responses before processing
- Implement rate limiting if needed
- Use HTTPS for all API requests

## Performance Considerations

- Implement image lazy loading
- Use virtual scrolling for large lists
- Optimize bundle size with code splitting
- Implement service worker for offline caching
- Use CDN for static assets

This implementation provides a solid foundation for HiAnime integration that can be extended with additional features as needed.

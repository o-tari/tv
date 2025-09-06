# TMDB Integration

This document describes the TMDB (The Movie Database) integration that has been added to the YouTube TV app.

## Features

### 1. Settings Configuration
- **TMDB API Key**: Users can configure their TMDB API key in the settings page
- **Upcoming Releases Toggle**: Users can choose whether to show upcoming movies/TV shows or only released content
- Both settings are persisted in localStorage

### 2. Movies & TV Page
- **Search**: Search for movies and TV shows using TMDB's search API
- **Trending Content**: Display trending movies and TV shows
- **Filtering**: Content is filtered based on the "upcoming releases" setting
- **Responsive Design**: Cards adapt to different screen sizes

### 3. Watch Page
- **Trailer Player**: YouTube player for movie/TV show trailers
- **Content Details**: Comprehensive information including ratings, genres, release dates
- **TV Show Seasons**: Season and episode information for TV shows
- **Additional Info**: Status, language, country information

## API Endpoints Used

### Search
- `GET /search/keyword` - Search for keywords
- `GET /search/movie` - Search for movies
- `GET /search/tv` - Search for TV shows

### Trending
- `GET /trending/movie/{time_window}` - Trending movies
- `GET /trending/tv/{time_window}` - Trending TV shows

### Details
- `GET /movie/{movie_id}` - Movie details with videos
- `GET /tv/{tv_id}` - TV show details with videos

## Components

### TMDBService
- Centralized service for all TMDB API calls
- Handles authentication with API key
- Includes content filtering based on release dates
- Error handling and response parsing

### TMDBMediaCard
- Specialized card component for TMDB content
- Displays movie/TV show information
- Handles different variants (default, compact, large)
- Includes rating display and proper image handling

### Pages
- **MoviesTVPage**: Main page for browsing movies and TV shows
- **TMDBWatchPage**: Detailed view for individual movies/TV shows

## Routing

- `/movies-tv` - Movies & TV main page
- `/tmdb-watch/:type/:id` - Watch page for specific content
  - `:type` can be "movie" or "tv"
  - `:id` is the TMDB content ID

## Configuration

To use the TMDB integration:

1. Get a TMDB API key from [themoviedb.org](https://www.themoviedb.org/settings/api)
2. Go to Settings in the app
3. Enter your TMDB API key
4. Configure whether to show upcoming releases
5. Save settings

## Content Filtering

The app respects the "Show upcoming releases" setting:
- **Enabled**: Shows all content including upcoming releases
- **Disabled**: Only shows content released before the current date

This filtering is applied to:
- Search results
- Trending movies
- Trending TV shows

## Image Handling

- Uses TMDB's image CDN for posters and backdrops
- Falls back to a placeholder SVG for missing images
- Proper aspect ratios for movie/TV show posters (3:4)

## Error Handling

- Graceful fallbacks for missing API keys
- Error messages for failed API calls
- Loading states during data fetching
- Proper error boundaries for component failures

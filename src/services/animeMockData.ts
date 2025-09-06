import { type Anime } from '../types/anime'

export const mockAnimeData: Anime[] = [
  {
    id: '1',
    title: 'Demon Slayer: Kimetsu no Yaiba',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop',
    url: '/anime/1',
    genres: ['Action', 'Supernatural', 'Historical'],
    description: 'A young boy becomes a demon slayer after his family is killed by demons.',
    status: 'Completed',
    totalEpisodes: 26,
    subOrDub: 'sub',
    type: 'TV',
    releaseDate: '2019-04-06'
  },
  {
    id: '2',
    title: 'Attack on Titan',
    image: 'https://images.unsplash.com/photo-1613376023733-0a73315d9b54?w=300&h=400&fit=crop',
    url: '/anime/2',
    genres: ['Action', 'Drama', 'Military'],
    description: 'Humanity fights for survival against giant humanoid Titans.',
    status: 'Completed',
    totalEpisodes: 75,
    subOrDub: 'sub',
    type: 'TV',
    releaseDate: '2013-04-07'
  },
  {
    id: '3',
    title: 'My Hero Academia',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop',
    url: '/anime/3',
    genres: ['Action', 'School', 'Super Power'],
    description: 'A boy without superpowers dreams of becoming a hero.',
    status: 'Ongoing',
    totalEpisodes: 138,
    subOrDub: 'sub',
    type: 'TV',
    releaseDate: '2016-04-03'
  },
  {
    id: '4',
    title: 'One Piece',
    image: 'https://images.unsplash.com/photo-1613376023733-0a73315d9b54?w=300&h=400&fit=crop',
    url: '/anime/4',
    genres: ['Action', 'Adventure', 'Comedy'],
    description: 'A pirate crew searches for the ultimate treasure.',
    status: 'Ongoing',
    totalEpisodes: 1000,
    subOrDub: 'sub',
    type: 'TV',
    releaseDate: '1999-10-20'
  },
  {
    id: '5',
    title: 'Naruto',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop',
    url: '/anime/5',
    genres: ['Action', 'Martial Arts', 'Ninja'],
    description: 'A young ninja dreams of becoming the Hokage.',
    status: 'Completed',
    totalEpisodes: 720,
    subOrDub: 'sub',
    type: 'TV',
    releaseDate: '2002-10-03'
  },
  {
    id: '6',
    title: 'Death Note',
    image: 'https://images.unsplash.com/photo-1613376023733-0a73315d9b54?w=300&h=400&fit=crop',
    url: '/anime/6',
    genres: ['Thriller', 'Supernatural', 'Psychological'],
    description: 'A high school student finds a notebook that can kill people.',
    status: 'Completed',
    totalEpisodes: 37,
    subOrDub: 'sub',
    type: 'TV',
    releaseDate: '2006-10-04'
  }
]

export const mockAnimeSearchResponse = {
  currentPage: 1,
  hasNextPage: false,
  results: mockAnimeData
}

export const mockAnimeEpisodesResponse = {
  currentPage: 1,
  hasNextPage: false,
  results: mockAnimeData.map((anime, index) => ({
    id: `ep-${anime.id}`,
    episodeId: `ep-${anime.id}`,
    episodeNumber: index + 1,
    title: `${anime.title} - Episode ${index + 1}`,
    image: anime.image,
    url: `/anime/${anime.id}/episode/${index + 1}`
  }))
}

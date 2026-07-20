export interface City {
  id: string;
  name: string;
}

export interface Movie {
  id: string;
  title: string;
  genre: string;
  language: string;
  rating: number;
  durationMinutes: number;
  releaseDate: string;
  posterUrl: string;
}

export interface Showtime {
  id: string;
  movieId: string;
  screen: string;
  startTime: string;
  basePrice: number;
  totalSeats: number;
}

export interface City {
  id: string;
  name: string;
}

export interface Movie {
  id: string;
  title: string;
  genre: string[];
  language: string;
  rating: number;
  durationMins: number;
  releaseDate: string;
  posterUrl: string;
  certification: string;
  /** ids of cities where the movie is currently showing */
  cityIds: string[];
}

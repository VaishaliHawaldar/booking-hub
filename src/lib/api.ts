import { cities } from "@/data/cities";
import { City, Movie, Showtime } from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5210";

async function apiFetch<T>(path: string, accessToken?: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    cache: "no-store",
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
  });
  if (!res.ok) {
    throw new Error(`API request to ${path} failed with status ${res.status}`);
  }
  return res.json();
}

// No cities endpoint is exposed by the API yet, so this stays mock for now.
export async function getCities(): Promise<City[]> {
  return cities;
}

export async function getMovies(accessToken?: string): Promise<Movie[]> {
  return apiFetch<Movie[]>("/api/Movies", accessToken);
}

export async function getMovie(id: string, accessToken?: string): Promise<Movie> {
  return apiFetch<Movie>(`/api/Movies/${id}`, accessToken);
}

export async function getShowtimes(
  movieId: string,
  accessToken?: string,
): Promise<Showtime[]> {
  return apiFetch<Showtime[]>(`/api/Showtimes/${movieId}`, accessToken);
}

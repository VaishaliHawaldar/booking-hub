import { cities } from "@/data/cities";
import { City, Movie, Showtime, UserProfile } from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5210";

async function apiFetch<T>(
  path: string,
  accessToken?: string,
  init?: { method?: string; body?: unknown },
): Promise<T> {
  const headers: Record<string, string> = {};
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  if (init?.body !== undefined) headers["Content-Type"] = "application/json";

  const res = await fetch(`${API_BASE_URL}${path}`, {
    cache: "no-store",
    method: init?.method,
    headers,
    body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
  });
  if (!res.ok) {
    throw new Error(`API request to ${path} failed with status ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
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

export async function getProfile(accessToken: string): Promise<UserProfile> {
  return apiFetch<UserProfile>("/api/Users/me", accessToken);
}

export async function updateProfile(
  profile: UserProfile,
  accessToken: string,
): Promise<void> {
  await apiFetch<void>("/api/Users/me", accessToken, {
    method: "PUT",
    body: profile,
  });
}

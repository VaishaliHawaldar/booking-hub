import { cities } from "@/data/cities";
import { movies } from "@/data/movies";
import { City, Movie } from "@/types";

/**
 * Mock data access layer.
 *
 * These functions stand in for the .NET Core Web API that will replace them
 * later. Keep the signatures stable so swapping the implementation to `fetch`
 * calls is a single-file change.
 */

export async function getCities(): Promise<City[]> {
  return cities;
}

export async function getMovies(cityId?: string): Promise<Movie[]> {
  if (!cityId || cityId === "all") {
    return movies;
  }
  return movies.filter((movie) => movie.cityIds.includes(cityId));
}

import { Movie } from "@/types";
import MovieCard from "./movie-card";

export default function MovieList({ movies }: { movies: Movie[] }) {
  if (movies.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-700 py-16 text-center text-slate-400">
        No movies showing in this city yet. Try another city.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
}

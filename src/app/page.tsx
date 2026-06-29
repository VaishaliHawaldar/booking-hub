import { Suspense } from "react";
import CityFilter from "@/components/city-filter";
import MovieList from "@/components/movie-list";
import SignIn from "@/components/sign-in";
import { getCities, getMovies } from "@/lib/api";

interface HomeProps {
  searchParams: Promise<{ city?: string }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const { city } = await searchParams;
  const selectedCityId = city ?? "all";

  const [cities, movies] = await Promise.all([
    getCities(),
    getMovies(selectedCityId),
  ]);

  const cityName =
    cities.find((c) => c.id === selectedCityId)?.name ?? "All cities";

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            🎬 BookingHub
          </h1>
          <p className="text-sm text-slate-400">
            Now showing in {cityName}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Suspense fallback={<div className="h-10 w-48" />}>
            <CityFilter cities={cities} selectedCityId={selectedCityId} />
          </Suspense>
          <SignIn />
        </div>
      </header>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-200">
          Movies <span className="text-slate-500">({movies.length})</span>
        </h2>
        <MovieList movies={movies} />
      </section>

      <footer className="mt-12 border-t border-slate-800 pt-6 text-center text-xs text-slate-500">
        Mock data for now · .NET Core Web API coming soon
      </footer>
    </main>
  );
}

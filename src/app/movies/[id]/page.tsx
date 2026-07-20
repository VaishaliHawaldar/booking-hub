import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getMovie, getShowtimes } from "@/lib/api";

function formatDuration(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}

interface MovieDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function MovieDetailPage({ params }: MovieDetailPageProps) {
  const { id } = await params;

  const session = await auth();
  const [movie, showtimes] = await Promise.all([
    getMovie(id, session?.accessToken).catch(() => null),
    getShowtimes(id, session?.accessToken).catch(() => []),
  ]);

  if (!movie) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <Link href="/" className="text-sm text-indigo-400 hover:text-indigo-300">
        ← Back to movies
      </Link>

      <div className="mt-6 flex flex-col gap-6 sm:flex-row">
        <div className="relative aspect-[2/3] w-48 shrink-0 overflow-hidden rounded-xl bg-slate-800">
          <Image
            src={movie.posterUrl}
            alt={`${movie.title} poster`}
            fill
            sizes="192px"
            className="object-cover"
          />
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight">{movie.title}</h1>
          <p className="text-sm text-slate-400">
            {movie.language} · {formatDuration(movie.durationMinutes)} · {movie.genre}
          </p>
          <span className="inline-block rounded-md bg-black/40 px-2 py-1 text-xs font-semibold text-amber-400">
            ★ {movie.rating.toFixed(1)}
          </span>
          <p className="text-sm text-slate-400">
            Release date: {new Date(movie.releaseDate).toLocaleDateString()}
          </p>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="mb-4 text-lg font-semibold text-slate-200">Showtimes</h2>
        {showtimes.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-700 py-12 text-center text-slate-400">
            No showtimes available for this movie yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {showtimes.map((showtime) => (
              <div
                key={showtime.id}
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-4"
              >
                <div>
                  <p className="font-semibold text-slate-100">{showtime.screen}</p>
                  <p className="text-sm text-slate-400">
                    {new Date(showtime.startTime).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-indigo-400">
                    ${showtime.basePrice.toFixed(2)}
                  </p>
                  <p className="text-xs text-slate-500">{showtime.totalSeats} seats</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

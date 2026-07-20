import Image from "next/image";
import Link from "next/link";
import { Movie } from "@/types";

function formatDuration(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}

export default function MovieCard({ movie }: { movie: Movie }) {
  return (
    <article className="group overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 transition hover:border-indigo-500/60 hover:shadow-lg hover:shadow-indigo-500/10">
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-800">
        <Image
          src={movie.posterUrl}
          alt={`${movie.title} poster`}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="object-cover transition duration-300 group-hover:scale-105"
        />
        <span className="absolute right-2 top-2 rounded-md bg-black/70 px-2 py-1 text-xs font-semibold text-amber-400">
          ★ {movie.rating.toFixed(1)}
        </span>
      </div>

      <div className="space-y-2 p-3">
        <h3 className="truncate font-semibold text-slate-100" title={movie.title}>
          {movie.title}
        </h3>
        <p className="text-xs text-slate-400">
          {movie.language} · {formatDuration(movie.durationMinutes)}
        </p>
        <div className="flex flex-wrap gap-1">
          <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">
            {movie.genre}
          </span>
        </div>
        <Link
          href={`/movies/${movie.id}`}
          className="mt-1 block w-full rounded-lg bg-indigo-600 py-2 text-center text-sm font-semibold text-white transition hover:bg-indigo-500"
        >
          Book tickets
        </Link>
      </div>
    </article>
  );
}

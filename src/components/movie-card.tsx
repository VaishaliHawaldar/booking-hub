import Image from "next/image";
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
        <span className="absolute left-2 top-2 rounded-md bg-indigo-600/90 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
          {movie.certification}
        </span>
      </div>

      <div className="space-y-2 p-3">
        <h3 className="truncate font-semibold text-slate-100" title={movie.title}>
          {movie.title}
        </h3>
        <p className="text-xs text-slate-400">
          {movie.language} · {formatDuration(movie.durationMins)}
        </p>
        <div className="flex flex-wrap gap-1">
          {movie.genre.slice(0, 3).map((g) => (
            <span
              key={g}
              className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300"
            >
              {g}
            </span>
          ))}
        </div>
        <button className="mt-1 w-full rounded-lg bg-indigo-600 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500">
          Book tickets
        </button>
      </div>
    </article>
  );
}

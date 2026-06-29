"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { City } from "@/types";

interface CityFilterProps {
  cities: City[];
  selectedCityId: string;
}

export default function CityFilter({ cities, selectedCityId }: CityFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function handleChange(cityId: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (cityId === "all") {
      params.delete("city");
    } else {
      params.set("city", cityId);
    }
    const query = params.toString();
    startTransition(() => {
      router.push(query ? `/?${query}` : "/");
    });
  }

  return (
    <div className="flex items-center gap-3">
      <label htmlFor="city" className="text-sm font-medium text-slate-300">
        City
      </label>
      <select
        id="city"
        value={selectedCityId}
        onChange={(e) => handleChange(e.target.value)}
        disabled={isPending}
        className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-100 outline-none transition focus:border-indigo-500 disabled:opacity-60"
      >
        <option value="all">All cities</option>
        {cities.map((city) => (
          <option key={city.id} value={city.id}>
            {city.name}
          </option>
        ))}
      </select>
    </div>
  );
}

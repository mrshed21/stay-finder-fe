"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PropertiesFilter } from "@/utils/propertyService";

const fieldClassName =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-zinc-300";

type PropertyFilterProps = {
  filter: PropertiesFilter;
};

export default function PropertyFilter({ filter }: PropertyFilterProps) {
  const router = useRouter();
  const [search, setSearch] = useState(filter.location || "");
  const [maxPrice, setMaxPrice] = useState(filter.maxprice || "");
  const [maxGuests, setMaxGuests] = useState(filter.maxguests || "");
  const [sort, setSort] = useState(filter.sort || "");

  const onFiltering = () => {
    const params = new URLSearchParams();
    if (search.trim()) params.set("location", search.trim());
    if (maxPrice) params.set("maxprice", maxPrice);
    if (maxGuests) params.set("maxguests", maxGuests);
    if (sort) params.set("sort", sort);
    const query = params.toString();
    router.push(query ? `/?${query}` : "/");
  };

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="flex flex-col gap-1 text-sm">
        Location
        <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} className={fieldClassName} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Maximum price per night
        <input type="number" min={0} value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className={fieldClassName} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Guests
        <input type="number" min={1} step={1} value={maxGuests} onChange={(e) => setMaxGuests(e.target.value)} className={fieldClassName} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Sort by price
        <select value={sort} onChange={(e) => setSort(e.target.value as "" | "asc" | "desc")} className={fieldClassName}>
          <option value="">Default order</option>
          <option value="asc">Lowest first</option>
          <option value="desc">Highest first</option>
        </select>
      </label>
      <button
        type="button"
        onClick={onFiltering}
        className="w-fit rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
      >
        Filter
      </button>
    </div>
  );
}

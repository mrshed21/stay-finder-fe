"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PropertiesFilter } from "@/utils/propertyService";

const fieldClassName = "field text-sm";

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
    <div className="glass grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
      <label className="field-label">
        Location
        <input type="search" placeholder="e.g. Stockholm" value={search} onChange={(e) => setSearch(e.target.value)} className={fieldClassName} />
      </label>
      <label className="field-label">
        Maximum price per night
        <input type="number" min={0} placeholder="Any price" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className={fieldClassName} />
      </label>
      <label className="field-label">
        Guests
        <input type="number" min={1} step={1} placeholder="Any" value={maxGuests} onChange={(e) => setMaxGuests(e.target.value)} className={fieldClassName} />
      </label>
      <label className="field-label">
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
        className="button-primary w-full sm:col-span-2 sm:w-fit sm:px-6"
      >
        Filter
      </button>
    </div>
  );
}

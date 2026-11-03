"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
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
  const [checkIn, setCheckIn] = useState(filter.checkin || "");
  const [checkOut, setCheckOut] = useState(filter.checkout || "");
  const [dateError, setDateError] = useState<string>();

  const onFiltering = () => {
    // VG7: dates are optional, but must be a valid future range when used.
    if (Boolean(checkIn) !== Boolean(checkOut)) {
      setDateError("Choose both check-in and check-out, or leave both empty.");
      return;
    }
    if (checkIn && checkOut <= checkIn) {
      setDateError("Check-out must be after check-in.");
      return;
    }
    if (checkIn && checkIn < format(new Date(), "yyyy-MM-dd")) {
      setDateError("Check-in cannot be in the past.");
      return;
    }
    setDateError(undefined);

    const params = new URLSearchParams();
    if (search.trim()) params.set("location", search.trim());
    if (maxPrice) params.set("maxprice", maxPrice);
    if (maxGuests) params.set("maxguests", maxGuests);
    if (sort) params.set("sort", sort);
    if (checkIn && checkOut) {
      params.set("checkin", checkIn);
      params.set("checkout", checkOut);
    }
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
      <label className="field-label">
        Check-in
        <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className={fieldClassName} />
      </label>
      <label className="field-label">
        Check-out
        <input type="date" min={checkIn || undefined} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className={fieldClassName} />
      </label>
      {dateError ? <p role="alert" className="notice-error sm:col-span-2">{dateError}</p> : null}
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

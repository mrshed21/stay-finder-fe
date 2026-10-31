"use client";

import React, { useEffect, useMemo, useState } from "react";
import { DayPicker } from "react-day-picker";
import type { DateRange } from "react-day-picker";
import { parseISO, format, startOfToday } from "date-fns";
import "react-day-picker/style.css";
import type { BookingDates } from "@/types/booking";

type BookingPickerProps = {
  initialDates?: BookingDates;
  selectDates: React.Dispatch<React.SetStateAction<BookingDates | undefined>>;
};

export default function BookingPicker({
  initialDates,
  selectDates,
}: BookingPickerProps) {
  const [range, setRange] = useState<DateRange | undefined>(
    initialDates
      ? {
          from: parseISO(initialDates.check_in),
          to: parseISO(initialDates.check_out),
        }
      : undefined,
  );

  useEffect(() => {
    setRange(
      initialDates
        ? {
            from: parseISO(initialDates.check_in),
            to: parseISO(initialDates.check_out),
          }
        : undefined,
    );
  }, [initialDates?.check_in, initialDates?.check_out]);

  const bookedDates: BookingDates[] = [];
  const booked = useMemo(
    () =>
      bookedDates
        .map((dates) => [dates.check_in, dates.check_out])
        .flat()
        .map((date) => parseISO(date)),
    [bookedDates],
  );

  const onSelect = (next?: DateRange) => {
    setRange(next);
    if (next?.from && next?.to) {
      selectDates?.({
        check_in: format(next.from, "yyyy-MM-dd"),
        check_out: format(next.to, "yyyy-MM-dd"),
      });
    } else {
      selectDates?.(undefined);
    }
  };

  return (
    <DayPicker
      mode="range"
      selected={range}
      onSelect={onSelect}
      disabled={[{ before: startOfToday() }, ...booked]}
      excludeDisabled // prevents ranges that span a booked date
    />
  );
}

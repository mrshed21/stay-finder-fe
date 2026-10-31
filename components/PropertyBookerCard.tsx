"use client";

import { differenceInCalendarDays, parseISO } from "date-fns";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";

import BookingPicker from "./BookingPicker";
import { useAuth } from "@/contexts/auth";
import type { Booking, BookingDates } from "@/types/booking";
import type { Property } from "@/types/property";

type PropertyBookerCardProps = {
  property: Property;
};

type BookingResponse = Omit<Booking, "user_id"> & { user_id?: string };

const fieldClassName =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950";

function apiErrorMessage(body: unknown): string {
  if (typeof body === "object" && body !== null && "errors" in body) {
    const errors = (body as { errors?: unknown }).errors;
    if (Array.isArray(errors)) {
      return errors
        .map((error) => Array.isArray(error) ? error[1] : "Invalid booking details")
        .join(" ");
    }
  }
  if (typeof body === "object" && body !== null && "error" in body) {
    const error = (body as { error?: unknown }).error;
    if (typeof error === "string") return error;
  }
  return "Could not complete the booking. Please check the details and try again.";
}

export default function PropertyBookerCard({ property }: PropertyBookerCardProps) {
  const auth = useAuth();
  const [bookingDates, setBookingDates] = useState<BookingDates>();
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guests, setGuests] = useState("1");
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [bookingError, setBookingError] = useState<string>();
  const [listError, setListError] = useState<string>();
  const [success, setSuccess] = useState<string>();
  const [pending, setPending] = useState(false);
  const [refreshBookings, setRefreshBookings] = useState(0);
  const [editingBooking, setEditingBooking] = useState<BookingResponse | null>(null);
  const [editDates, setEditDates] = useState<BookingDates>();

  const nights = bookingDates
    ? differenceInCalendarDays(
        parseISO(bookingDates.check_out),
        parseISO(bookingDates.check_in),
      )
    : 0;
  const estimatedTotal = nights > 0 ? nights * Number(property.price_per_night) : 0;

  useEffect(() => {
    if (auth.isPending || !auth.user) {
      setBookings([]);
      setListError(undefined);
      return;
    }

    let cancelled = false;
    async function loadBookings() {
      setListError(undefined);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/bookings/properties/${property.property_id}`,
          { credentials: "include" },
        );
        if (!response.ok) {
          const body = await response.json().catch(() => null);
          if (!cancelled) {
            setListError(response.status === 401
              ? "Sign in to view bookings for this stay."
              : apiErrorMessage(body));
          }
          return;
        }
        const data: BookingResponse[] = await response.json();
        if (!cancelled) setBookings(data);
      } catch {
        if (!cancelled) setListError("Could not load bookings. Please try again.");
      }
    }

    loadBookings();
    return () => {
      cancelled = true;
    };
  }, [auth.isPending, auth.user, property.property_id, refreshBookings]);

  async function submitBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBookingError(undefined);
    setSuccess(undefined);

    if (!bookingDates) {
      setBookingError("Choose check-in and check-out dates.");
      return;
    }
    if (Number(guests) < 1 || !Number.isInteger(Number(guests))) {
      setBookingError("Enter at least one guest.");
      return;
    }

    setPending(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/bookings/properties/${property.property_id}`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            guest_name: guestName,
            guest_email: guestEmail,
            guests: Number(guests),
            check_in: bookingDates.check_in,
            check_out: bookingDates.check_out,
          }),
        },
      );

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setBookingError(response.status === 401
          ? "Sign in before booking this stay."
          : apiErrorMessage(body));
        return;
      }

      setSuccess("Your booking request was sent.");
      setGuestName("");
      setGuestEmail("");
      setGuests("1");
      setBookingDates(undefined);
      setRefreshBookings((value) => value + 1);
    } catch {
      setBookingError("Could not connect to Stay Finder. Please try again.");
    } finally {
      setPending(false);
    }
  }

  async function updateMyBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingBooking) return;
    setBookingError(undefined);
    const formData = new FormData(event.currentTarget);
    const nextDates = editDates ?? {
      check_in: editingBooking.check_in,
      check_out: editingBooking.check_out,
    };

    setPending(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/bookings/properties/${property.property_id}/${editingBooking.booking_id}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            guest_name: String(formData.get("guest_name") ?? ""),
            guest_email: String(formData.get("guest_email") ?? ""),
            guests: Number(formData.get("guests")),
            check_in: nextDates.check_in,
            check_out: nextDates.check_out,
          }),
        },
      );
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setBookingError(apiErrorMessage(body));
        return;
      }
      setEditingBooking(null);
      setRefreshBookings((value) => value + 1);
      setSuccess("Your booking was updated.");
    } catch {
      setBookingError("Could not connect to Stay Finder. Please try again.");
    } finally {
      setPending(false);
    }
  }

  async function deleteMyBooking(booking: BookingResponse) {
    if (!window.confirm("Delete this booking?")) return;
    setBookingError(undefined);
    setPending(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/bookings/properties/${property.property_id}/${booking.booking_id}`,
        { method: "DELETE", credentials: "include" },
      );
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setBookingError(apiErrorMessage(body));
        return;
      }
      setRefreshBookings((value) => value + 1);
      setSuccess("Your booking was deleted.");
    } catch {
      setBookingError("Could not connect to Stay Finder. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="flex flex-col gap-5 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <h2 className="text-lg font-semibold">Book this stay</h2>

      {auth.isPending ? (
        <p>Checking your sign-in…</p>
      ) : !auth.user ? (
        <p>
          Please <Link className="underline" href="/auth/login">log in</Link> to book this stay.
        </p>
      ) : (
        <>
          <form onSubmit={submitBooking} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1 text-sm">
              Guest name
              <input className={fieldClassName} value={guestName} onChange={(event) => setGuestName(event.target.value)} required minLength={2} />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Guest email
              <input className={fieldClassName} type="email" value={guestEmail} onChange={(event) => setGuestEmail(event.target.value)} required />
            </label>
            <label className="flex max-w-xs flex-col gap-1 text-sm">
              Number of guests
              <input className={fieldClassName} type="number" min={1} step={1} value={guests} onChange={(event) => setGuests(event.target.value)} required />
            </label>
            <div>
              <p className="mb-2 text-sm font-medium">Choose check-in and check-out</p>
              <BookingPicker initialDates={bookingDates} selectDates={setBookingDates} />
            </div>
            {nights > 0 ? (
              <p className="text-sm">
                {nights} {nights === 1 ? "night" : "nights"} · Estimated total: {estimatedTotal.toFixed(2)} kr
              </p>
            ) : null}
            {bookingError ? <p role="alert" className="text-sm text-red-600">{bookingError}</p> : null}
            {success ? <p role="status" className="text-sm text-green-700">{success}</p> : null}
            <button type="submit" disabled={pending} className="w-fit rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900">
              {pending ? "Sending…" : "Request booking"}
            </button>
          </form>

          <div className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
            <h3 className="font-semibold">Bookings for this stay</h3>
            {listError ? <p role="alert" className="mt-2 text-sm text-red-600">{listError}</p> : null}
            {!listError && bookings.length === 0 ? <p className="mt-2 text-sm text-zinc-600">No bookings to show.</p> : null}
            <ul className="mt-3 flex flex-col gap-3">
              {bookings.map((booking) => (
                <li key={booking.booking_id} className="rounded-lg border border-zinc-200 p-3 text-sm dark:border-zinc-800">
                  <p className="font-medium">{booking.guest_name} · {booking.status}</p>
                  <p>{booking.check_in} to {booking.check_out} · {booking.guests} guests</p>
                  {booking.user_id === auth.user?.id ? (
                    editingBooking?.booking_id === booking.booking_id ? (
                      <form onSubmit={updateMyBooking} className="mt-3 flex flex-col gap-3">
                        <label className="flex flex-col gap-1">
                          Guest name
                          <input name="guest_name" className={fieldClassName} defaultValue={booking.guest_name} required minLength={2} />
                        </label>
                        <label className="flex flex-col gap-1">
                          Guest email
                          <input name="guest_email" type="email" className={fieldClassName} defaultValue={booking.guest_email} required />
                        </label>
                        <label className="flex max-w-xs flex-col gap-1">
                          Number of guests
                          <input name="guests" type="number" min={1} step={1} className={fieldClassName} defaultValue={booking.guests} required />
                        </label>
                        <BookingPicker
                          initialDates={{ check_in: booking.check_in, check_out: booking.check_out }}
                          selectDates={setEditDates}
                        />
                        <div className="flex gap-3">
                          <button type="submit" disabled={pending} className="rounded-lg border px-3 py-1">Save</button>
                          <button type="button" onClick={() => setEditingBooking(null)} className="rounded-lg border px-3 py-1">Cancel</button>
                        </div>
                      </form>
                    ) : (
                      <div className="mt-2 flex gap-3">
                        <button type="button" onClick={() => { setEditingBooking(booking); setEditDates(undefined); }} className="underline">Edit</button>
                        <button type="button" disabled={pending} onClick={() => deleteMyBooking(booking)} className="underline">Delete</button>
                      </div>
                    )
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </section>
  );
}

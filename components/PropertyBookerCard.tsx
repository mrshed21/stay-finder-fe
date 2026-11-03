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

const fieldClassName = "field text-sm";

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
  const editDatesChanged = Boolean(
    editingBooking && editDates &&
    (editDates.check_in !== editingBooking.check_in || editDates.check_out !== editingBooking.check_out),
  );
  const editNights = editDates
    ? differenceInCalendarDays(parseISO(editDates.check_out), parseISO(editDates.check_in))
    : 0;
  const editEstimatedTotal = editNights > 0
    ? editNights * Number(property.price_per_night)
    : 0;

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
    if (Number(guests) > property.max_guests) {
      setBookingError(`This stay allows up to ${property.max_guests} guests.`);
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
    <section className="glass flex flex-col gap-6 p-5 sm:p-8">
      <h2 className="text-xl font-semibold">Book this stay</h2>

      {auth.isPending ? (
        <p className="text-muted">Checking your sign-in…</p>
      ) : !auth.user ? (
        <p>
          Please <Link className="text-link" href="/auth/login">log in</Link> to book this stay.
        </p>
      ) : (
        <>
          <form onSubmit={submitBooking} className="flex flex-col gap-5">
            <label className="field-label">
              Guest name
              <input className={fieldClassName} value={guestName} onChange={(event) => setGuestName(event.target.value)} required minLength={2} />
            </label>
            <label className="field-label">
              Guest email
              <input className={fieldClassName} type="email" value={guestEmail} onChange={(event) => setGuestEmail(event.target.value)} required />
            </label>
            <label className="field-label max-w-xs">
              Number of guests
              <input className={fieldClassName} type="number" min={1} max={property.max_guests} step={1} value={guests} onChange={(event) => setGuests(event.target.value)} required />
            </label>
            <div>
              <p className="mb-2 text-sm font-medium text-muted">Choose check-in and check-out</p>
              <BookingPicker initialDates={bookingDates} selectDates={setBookingDates} />
            </div>
            {nights > 0 ? (
              <p className="rounded-lg border border-olive/40 bg-olive/10 px-4 py-3 text-sm">
                {nights} {nights === 1 ? "night" : "nights"} · Estimated total: <span className="font-semibold">{estimatedTotal.toFixed(2)} kr</span>
              </p>
            ) : null}
            {bookingError ? <p role="alert" className="notice-error">{bookingError}</p> : null}
            {success ? <p role="status" className="notice-success">{success}</p> : null}
            <button type="submit" disabled={pending} className="button-primary w-full sm:w-fit sm:px-6">
              {pending ? "Sending…" : "Request booking"}
            </button>
          </form>

          <div className="border-t border-line-soft pt-6">
            <h3 className="text-lg font-semibold">Bookings for this stay</h3>
            {listError ? <p role="alert" className="notice-error mt-3">{listError}</p> : null}
            {!listError && bookings.length === 0 ? <p className="mt-2 text-sm text-muted">No bookings to show.</p> : null}
            <ul className="mt-3 flex flex-col gap-3">
              {bookings.map((booking) => (
                <li key={booking.booking_id} className="glass-inset flex flex-col gap-1 p-4 text-sm">
                  <p className="flex flex-wrap items-center gap-2 font-semibold">{booking.guest_name} <span className="badge">{booking.status}</span></p>
                  <p className="text-muted">{booking.check_in} to {booking.check_out} · {booking.guests} guests</p>
                  <p className="font-medium">
                    Total: {booking.total_price === null
                      ? "Not available for this booking"
                      : `${Number(booking.total_price).toFixed(2)} kr`}
                  </p>
                  {booking.user_id === auth.user?.id ? (
                    editingBooking?.booking_id === booking.booking_id ? (
                      <form onSubmit={updateMyBooking} className="mt-3 flex flex-col gap-4 border-t border-line-soft pt-4">
                        <label className="field-label">
                          Guest name
                          <input name="guest_name" className={fieldClassName} defaultValue={booking.guest_name} required minLength={2} />
                        </label>
                        <label className="field-label">
                          Guest email
                          <input name="guest_email" type="email" className={fieldClassName} defaultValue={booking.guest_email} required />
                        </label>
                        <label className="field-label max-w-xs">
                          Number of guests
                          <input name="guests" type="number" min={1} max={property.max_guests} step={1} className={fieldClassName} defaultValue={booking.guests} required />
                        </label>
                        <BookingPicker
                          initialDates={{ check_in: booking.check_in, check_out: booking.check_out }}
                          selectDates={setEditDates}
                        />
                        <div className="flex flex-col gap-1 rounded-lg border border-olive/40 bg-olive/10 px-4 py-3">
                          <p className="text-muted">
                            Current saved total: {booking.total_price === null
                              ? "Total not available"
                              : `${Number(booking.total_price).toFixed(2)} kr`}
                          </p>
                          {editDatesChanged && editNights > 0 ? (
                            <p className="font-medium">
                              New estimated total: {editEstimatedTotal.toFixed(2)} kr. This total applies when you save.
                            </p>
                          ) : null}
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <button type="submit" disabled={pending} className="button-primary">Save</button>
                          <button type="button" onClick={() => setEditingBooking(null)} className="button-secondary">Cancel</button>
                        </div>
                      </form>
                    ) : (
                      <div className="mt-3 flex flex-wrap gap-3">
                        <button type="button" onClick={() => { setEditingBooking(booking); setEditDates(undefined); }} className="button-secondary">Edit</button>
                        <button type="button" disabled={pending} onClick={() => deleteMyBooking(booking)} className="button-danger">Delete</button>
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

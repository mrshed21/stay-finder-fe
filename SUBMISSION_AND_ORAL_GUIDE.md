# StayFinder: submission and oral review

## Submission

Submit only:

1. Backend repository: <https://github.com/mrshed21/stay-finder-be>
2. Frontend repository: <https://github.com/mrshed21/stay-finder-fe>
3. Postman collection: `StayFinder.postman_collection.json` from the backend repository root. It has 35 requests, including VG2, VG4 and VG7.
4. One line with the completed criteria: **G1–G16 and VG1–VG7.**

The Postman file contains no credentials. Set `testEmail` and `testPassword` in a local Postman environment and do not export or submit that environment. Do not submit `.env` files, passwords, session cookies or access tokens. Check that both repositories are pushed and that the links open for your teacher.

Submission deadline: **November 4, 2026, 23:59**. Oral review: **November 5, 2026**.

## 15-minute demonstration (local, over Zoom or Teams)

Run the backend and frontend on your own computer and share your screen in Zoom or Teams.

### Before the call

- Start the backend (`npm run dev`, port 3000) and the frontend (`npm run dev -- --port 3001`) as described in each README. If you use other ports, `NEXT_PUBLIC_BACKEND_URL` and `FRONTEND_URL` must match them.
- Prepare two test accounts: **A** owns a disposable property and **B** is the guest. Sign in as A in a normal browser window and as B in a private window, so both sessions stay open.
- Choose free future dates for the bookings in advance.
- Open both repositories in your editor, and Postman with the collection and your local environment.
- Before sharing, close `.env` files, the Supabase dashboard, notifications and anything else private. Zoom the browser and editor in so the text is readable.
- Test your microphone and screen sharing once before the review.

### Plan

1. **Overview (1 min):** Next.js frontend → Hono API → Supabase Auth and Postgres. Name the completed criteria: G1–G16 and VG1–VG7.
2. **Browsing and sign-in (2 min):** show the stays list, a property page and the not-found page for a made-up ID. Log in as A, show the email in the navigation, and refresh to show that the session is kept.
3. **Properties (2 min):** filter by location, price and guests, and sort by price. As A, create or edit the disposable property. Explain that only the owner sees the controls, and that the API and RLS also check ownership.
4. **Booking as B (3 min):** book A's property. Show the nights and price, the saved total, the guest-count limit (VG3), and a past check-in (VG5) or an invalid email. Change the dates and show the new total (VG6).
5. **No double booking, VG2 (1 min):** as B, try dates that overlap the booking and show "These dates are already booked". Then book dates that start on the first booking's check-out day; that is allowed.
6. **Confirm or reject, VG4 (1.5 min):** as A, open the property page. Confirm the first booking and reject the second. A rejected booking becomes `cancelled` and frees its dates.
7. **Availability search, VG7 (1.5 min):** on the home page, search with dates that overlap the confirmed booking: the property is hidden. Search with the rejected booking's dates: the property is shown, because cancelled bookings do not block. Try check-out before check-in to show the message.
8. **Code and Postman (2 min):** show a Hono route with its Zod validator, the booking trigger, the `bookings_no_overlap` constraint and the `booked_property_ids` function. Run a few Postman requests, for example the VG7 `400`, the VG2 `409` and an unauthenticated `401`.
9. **Questions (1 min).**

Use only disposable records. Do not delete existing school data during the demonstration. In Postman, writes run only when `allowWrites` is `true`, and `DELETE` also needs `allowDestructive`. Send `DELETE` requests by hand at the end, because the Collection Runner would delete the property before the booking requests run.

If the network or Supabase fails during the call, show the code and run the backend build and tests from the backend README instead.

## Short explanations and likely questions

### How do the frontend, API, and database connect?

The Next.js app sends HTTP requests to the Hono API at `NEXT_PUBLIC_BACKEND_URL`. The API validates requests, uses the signed-in user's Supabase client, and reads or writes Postgres. The database returns JSON that the frontend displays.

### What is authentication versus authorization?

Authentication identifies the signed-in user. Authorization decides what that user may do. Supabase Auth identifies the user; API ownership checks and database RLS authorize the operation.

### Why does the browser include cookies?

The backend stores the Supabase session in HTTP-only cookies. Frontend `fetch` calls set `credentials: "include"`, so the browser sends those cookies. JavaScript cannot read an HTTP-only cookie, which reduces exposure to script code.

### How is property ownership enforced?

On create, the API gets `user_id` from the authenticated session, not the request body. On update/delete, the API checks the property's owner. RLS repeats the owner check in Postgres, so a direct API or Supabase request cannot rely on hidden buttons for security.

### How does booking ownership work?

The API gets the booking guest from the session. RLS lets a guest read their own bookings and lets a property owner read bookings for their property. Only the guest can edit or delete a booking. Since VG4, the property owner may also change the status of a pending booking, and nothing else.

### How does VG2 stop overlapping bookings?

A stay covers `[check_in, check_out)`, so the check-out day is free for the next guest. The database exclusion constraint `bookings_no_overlap` rejects two pending or confirmed bookings for the same property that share a night. Cancelled bookings do not count. PostgreSQL checks every row, including rows that RLS hides, so two requests at the same time cannot both succeed. The API turns the error into `409` "These dates are already booked".

### How does VG3 capacity validation work?

The API reads `max_guests` from the property and rejects a larger party with a readable error. A database trigger repeats the check using the property row, including on direct Supabase writes. A second trigger prevents lowering capacity below qualifying active bookings.

### How does VG4 confirm and reject work?

New bookings are `pending`. The owner sends `PATCH /bookings/properties/:propertyId/:bookingId/status` with `confirmed` or `cancelled`. The API checks that the user owns the property and that the booking is still pending. In the database, an RLS policy lets owners update bookings on their own properties, and the booking trigger allows only that status change. A guest cannot change the status, and an owner cannot change guest details, dates or price.

### How does VG5 treat past dates?

The API and database compare ISO calendar dates using UTC. A check-in before today's UTC date is rejected; today is allowed. On update, the old booking's check-in is checked before accepting the proposed dates. A past booking cannot be edited or directly deleted.

### How does VG6 calculate price?

For a new booking, the backend and database calculate nightly price times nights. The database ignores a price sent by a client. A non-date edit preserves the stored total; changing dates recalculates using the property's current nightly rate. A legacy booking with a null total stays null until its dates change.

### How does VG7 search for free dates when RLS hides other bookings?

The API cannot decide availability from bookings it cannot see, so it calls the database function `booked_property_ids(check_in, check_out)`. The function runs with its owner's rights and returns only the ids of properties with an overlapping pending or confirmed booking, never guest details. The API leaves those properties out of the list. Missing, reversed or past dates return `400`.

### Why validate in both the API and database?

API validation gives the user a clear message before a write. Database constraints, RLS, and triggers protect the data if someone bypasses the frontend or calls Supabase directly.

### What are TypeScript types for, and can they validate API input?

Types help catch mistakes while writing and building the application. They are removed at runtime, so they do not validate incoming JSON. Zod validates runtime API input. `interface` and `type` both describe shapes; an interface can be extended or merged, while a type alias can also describe unions and other type expressions.

## Scope

All G1–G16 and VG1–VG7 criteria are implemented, and all migrations are applied to the hosted Supabase project. VG2, VG4 and VG7 were checked there through the API and the website after their migrations were applied. The automated tests use mocked Supabase clients and a local PostgreSQL database. Unless you have run them since, say during the oral review that the direct Supabase checks below were not run.

## Direct Supabase checks with ordinary test accounts

The migrations are applied, but the direct authenticated RLS/trigger cases below were not run during final QA because no signed-in test session was available. Do not use the SQL Editor or a service-role key for these checks. Use the Supabase project's publishable/anon key plus the short-lived access token obtained by signing in as ordinary test account A or B through Supabase Auth. Keep both values out of this repository and out of screenshots.

Prepare a property owned by A and a booking made by B only if you have an approved disposable fixture. Use the Supabase REST endpoint `https://<project-ref>.supabase.co/rest/v1`; send `apikey: <publishable-key>` and `Authorization: Bearer <that-test-user-access-token>`.

1. **Read visibility:** as A, GET `bookings?property_id=eq.<property-id>&select=booking_id,user_id,status,total_price,guests,check_in,check_out`. A should see the property's booking. As B, query that booking's ID; B should see only B's own booking. A different test user should see no row.
2. **Owner limits (VG4):** use only a dedicated disposable booking. As A, PATCH `bookings?booking_id=eq.<B-booking-id>` with `{"guest_name":"Changed by owner"}`; the booking trigger should reject it. As A, DELETE the same booking; RLS should affect zero rows. As A, PATCH `{"status":"confirmed"}` while the booking is `pending`; that should succeed, and a second status change should be rejected. Re-read as B and confirm the guest details are unchanged. Never use DELETE against a school record.
3. **Status and price:** as B, try PATCHing the disposable booking with `{"status":"confirmed"}`; the trigger should reject it. Try an unrelated edit with `total_price` forged; the trigger should retain the stored amount. A forged-price INSERT should return a stored total calculated from the current nightly rate and dates, and force `status` to `pending`; that INSERT creates a row, so only do it when a disposable test booking has been explicitly prepared.
4. **Capacity:** as B, try changing a disposable booking to more guests than the property's current `max_guests`; expect a database error and verify the row is unchanged. As A, try reducing the disposable property's capacity below an active booking's guest count; expect an error and verify the property is unchanged.
5. **Past dates:** as B, try moving a future disposable booking's check-in into the past; expect an error and verify it is unchanged. Direct deletion of a past booking can only be tested if a disposable past booking already exists; the trigger prevents creating one through normal requests. Do not use an existing school booking as a test fixture.
6. **Property cascade:** the migration intentionally allows the existing `ON DELETE CASCADE` when an owner deletes a property, including its historical bookings. Verify only with a disposable property and its disposable bookings, because the test deletes those rows.
7. **Property RLS:** public property SELECT should work without a login. As B, attempt to update A's disposable property; RLS should affect zero rows. A direct INSERT with a `user_id` other than B's Auth user ID should be rejected. Only create disposable rows for tests.
8. **Overlap (VG2):** as B, INSERT a booking whose dates overlap an active disposable booking on the same property; expect error `23P01` and no new row. Only try it with a disposable fixture, because a typo in the dates would create a row.
9. **Availability (VG7):** with only the `apikey` header and no user token, POST `rpc/booked_property_ids` with `{"p_check_in":"2099-01-10","p_check_out":"2099-01-12"}`. It should return property ids only. A GET on `bookings` with the same headers should return no booking rows.

If a suitable disposable fixture is unavailable, leave that case **UNVERIFIED** instead of trying it against existing data.

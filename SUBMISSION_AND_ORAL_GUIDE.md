# StayFinder: submission and oral review

## Submission checklist

The assignment asks you to submit:

- The GitHub repository link for the backend and the frontend.
- A list of the criteria you have completed.
- A file containing API test calls. The backend `requests.http` file is the example collection; run it with your course REST Client and disposable data.

Before submitting, replace the example test account and IDs in `requests.http` locally. Do not submit real passwords, session cookies, access tokens, or `.env` files. Check that both repositories are pushed and that the links open for your teacher.

Submission deadline: **November 4, 2026, 23:59**. Oral review: **November 5, 2026**.

## 8–10 minute demonstration plan

1. **Start (about 1 minute):** show the public stays list, one property detail page, and the not-found page for a made-up ID.
2. **Authentication (about 1 minute):** register or log in with a test account, show the email in navigation, refresh to show session restoration, then log out.
3. **Properties (about 2 minutes):** apply location, price, guest-count, and price-sort filters. As the owner, create or edit a disposable property. Explain that only the owner sees controls and the API/RLS also enforce ownership.
4. **Booking (about 3 minutes):** sign in as guest B and book A's property. Show the night count and price, saved booking total, a capacity rejection, and an invalid date or email message. Change the dates and show the new estimate and saved total.
5. **Rules in code (about 2 minutes):** point to the Hono booking route, Zod validator, database functions, RLS policies, and booking trigger. Use account A to show its own property bookings while the guest-only edit/delete controls remain hidden. Explain direct Supabase checks separately from API checks.

Use only disposable records that you are willing to delete. Do not delete existing school data during the demonstration.

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

The API gets the booking guest from the session. RLS lets a guest read their own bookings and lets a property owner read bookings for their property. Booking update/delete RLS applies to the guest owner; property owners can read but do not gain edit/delete permission over a guest's booking.

### How does VG3 capacity validation work?

The API reads `max_guests` from the property and rejects a larger party with a readable error. A database trigger repeats the check using the property row, including on direct Supabase writes. A second trigger prevents lowering capacity below qualifying active bookings.

### How does VG5 treat past dates?

The API and database compare ISO calendar dates using UTC. A check-in before today's UTC date is rejected; today is allowed. On update, the old booking's check-in is checked before accepting the proposed dates. A past booking cannot be edited or directly deleted.

### How does VG6 calculate price?

For a new booking, the backend and database calculate nightly price times nights. The database ignores a price sent by a client. A non-date edit preserves the stored total; changing dates recalculates using the property's current nightly rate. A legacy booking with a null total stays null until its dates change.

### Why validate in both the API and database?

API validation gives the user a clear message before a write. Database constraints, RLS, and triggers protect the data if someone bypasses the frontend or calls Supabase directly.

### What are TypeScript types for, and can they validate API input?

Types help catch mistakes while writing and building the application. They are removed at runtime, so they do not validate incoming JSON. Zod validates runtime API input. `interface` and `type` both describe shapes; an interface can be extended or merged, while a type alias can also describe unions and other type expressions.

## Honest scope statement

The selected VG criteria are VG1, VG3, VG5, and VG6. VG2 overlap prevention, VG4 status transitions, and VG7 availability search are outside this submission. The API and build checks do not replace authenticated direct-Supabase tests; identify any such checks that were not performed during the oral review.

## Direct Supabase checks with ordinary test accounts

The migration is applied, but the direct authenticated RLS/trigger cases below were not run during final QA because no signed-in test session was available. Do not use the SQL Editor or a service-role key for these checks. Use the Supabase project's publishable/anon key plus the short-lived access token obtained by signing in as ordinary test account A or B through Supabase Auth. Keep both values out of this repository and out of screenshots.

Prepare a property owned by A and a booking made by B only if you have an approved disposable fixture. Use the Supabase REST endpoint `https://<project-ref>.supabase.co/rest/v1`; send `apikey: <publishable-key>` and `Authorization: Bearer <that-test-user-access-token>`.

1. **Read visibility:** as A, GET `bookings?property_id=eq.<property-id>&select=booking_id,user_id,status,total_price,guests,check_in,check_out`. A should see the property's booking. As B, query that booking's ID; B should see only B's own booking. A different test user should see no row.
2. **Owner cannot manage guest booking:** as A, PATCH or DELETE `bookings?booking_id=eq.<B-booking-id>` using only a dedicated disposable booking. The request should affect zero rows due to RLS. Re-read as B and confirm the row is unchanged. Never use DELETE against a school record.
3. **Status and price:** as B, try PATCHing the disposable booking with `{"status":"confirmed"}`; the trigger should reject it. Try an unrelated edit with `total_price` forged; the trigger should retain the stored amount. A forged-price INSERT should return a stored total calculated from the current nightly rate and dates, and force `status` to `pending`; that INSERT creates a row, so only do it when a disposable test booking has been explicitly prepared.
4. **Capacity:** as B, try changing a disposable booking to more guests than the property's current `max_guests`; expect a database error and verify the row is unchanged. As A, try reducing the disposable property's capacity below an active booking's guest count; expect an error and verify the property is unchanged.
5. **Past dates:** as B, try moving a future disposable booking's check-in into the past; expect an error and verify it is unchanged. Direct deletion of a past booking can only be tested if a disposable past booking already exists; the trigger prevents creating one through normal requests. Do not use an existing school booking as a test fixture.
6. **Property cascade:** the migration intentionally allows the existing `ON DELETE CASCADE` when an owner deletes a property, including its historical bookings. Verify only with a disposable property and its disposable bookings, because the test deletes those rows.
7. **Property RLS:** public property SELECT should work without a login. As B, attempt to update A's disposable property; RLS should affect zero rows. A direct INSERT with a `user_id` other than B's Auth user ID should be rejected. Only create disposable rows for tests.

If a suitable disposable fixture is unavailable, leave that case **UNVERIFIED** instead of trying it against existing data.

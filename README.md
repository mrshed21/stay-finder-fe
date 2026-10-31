# StayFinder Frontend

Next.js and TypeScript interface for the StayFinder Hono API.

## Local setup

Start the backend first on port 3000. From this directory:

```sh
npm ci
```

Create `.env.local` with the backend URL:

```dotenv
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
```

Keep `.env.local` local and do not commit it. Then start the frontend on port 3001:

```sh
npm run dev -- --port 3001
```

Open <http://localhost:3001>. Authenticated requests include the backend session cookies.

## Checks

```sh
npx tsc --noEmit
npx next build --webpack
```

## Features

- Register, log in, restore the session after refresh, and log out.
- Browse property details; filter by location, maximum nightly price, and guest count; sort by price.
- Create, edit, and delete properties as their owner.
- Create and manage the signed-in guest's bookings. The property owner can view bookings for their properties.
- Show the saved booking total and a date-change estimate.

The selected VG criteria are VG1, VG3, VG5, and VG6. VG2, VG4, and VG7 are not implemented. The API and Supabase database, rather than hidden frontend controls, enforce authorization and booking rules.

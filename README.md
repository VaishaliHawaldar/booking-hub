# BookingHub 🎬

A movie ticket booking hub built with **Next.js 16** (App Router) + **TypeScript** + **Tailwind CSS v4**.

Currently powered by **mock data**. A **.NET Core Web API** will replace the mock layer later.

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in your Okta values
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Authentication (Auth0 + Auth.js)

Sign-in uses **Auth.js (NextAuth v5)** with **Auth0** as the OIDC provider. The
"Sign in" button opens a modal that redirects to Auth0; once authenticated the
header shows the user and a "Sign out" button.

### Configure Auth0

1. In the **Auth0 Dashboard**, create an app: **Applications → Create
   Application → Regular Web Applications**.
2. In the app **Settings**, set:
   - **Allowed Callback URLs:** `http://localhost:3000/api/auth/callback/auth0`
   - **Allowed Logout URLs:** `http://localhost:3000`
3. Copy these into `.env.local` (see [.env.example](.env.example)):
   - `AUTH_AUTH0_ID` — the app's Client ID
   - `AUTH_AUTH0_SECRET` — the app's Client Secret
   - `AUTH_AUTH0_ISSUER` — your tenant domain, e.g.
     `https://your-tenant.us.auth0.com`
   - `AUTH_SECRET` — generate with `npx auth secret`

The Auth0 **access token** is captured in the Auth.js session
([src/auth.ts](src/auth.ts)) as `session.accessToken`, ready to forward as a
`Bearer` token to the .NET Core Web API later.

## Profile page & S3 image uploads

Signed-in users can edit their name, phone and preferred city at `/profile`
(linked from their name in the header), and upload a profile picture.

**How the upload works:** the browser asks `POST /api/profile/avatar` for a
presigned URL (the route checks the session, type — JPEG/PNG/WebP — and size ≤ 5 MB),
then `PUT`s the file **directly to S3**. AWS credentials stay on the server.
Images are stored at `avatars/<auth0-user-id>/<uuid>.<ext>`. Saving the form
stores the resulting URL with the profile; the server action rejects any URL
outside the user's own `avatars/` prefix.

Profile data is read/written through the .NET API: `GET /api/Users/me` and
`PUT /api/Users/me` with body `{ name, email, phone, cityId, avatarUrl }`.
Until `GET` exists, the page falls back to the Auth0 name/email.

### Configure S3

Add to `.env.local`:

```
AWS_REGION=ap-south-1
AWS_S3_BUCKET=booking-hub-uploads
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
# Optional — e.g. a CloudFront domain; defaults to https://<bucket>.s3.<region>.amazonaws.com
AWS_S3_PUBLIC_URL=
```

The IAM user needs `s3:PutObject` on `arn:aws:s3:::<bucket>/avatars/*`.

The bucket needs a **CORS rule** so the browser can upload:

```json
[
  {
    "AllowedOrigins": ["http://localhost:3000"],
    "AllowedMethods": ["PUT"],
    "AllowedHeaders": ["Content-Type"],
    "MaxAgeSeconds": 3000
  }
]
```

Images must also be publicly readable — either serve the bucket through
CloudFront (recommended; set `AWS_S3_PUBLIC_URL`) or add a bucket policy
allowing `s3:GetObject` on `avatars/*`.

## Features

- **Home page** with a movies grid and a **city filter**.
- City selection is reflected in the URL (`/?city=mumbai`), so filtered views are shareable and bookmarkable.
- Responsive movie cards (poster, rating, certification, language, runtime, genres).

## Project structure

```
src/
├── app/
│   ├── api/auth/[...nextauth]/route.ts  # Auth.js OAuth route handler
│   ├── api/profile/avatar/route.ts      # Issues presigned S3 upload URLs
│   ├── profile/page.tsx  # Profile page (server component)
│   ├── profile/actions.ts # Server action that saves the profile
│   ├── layout.tsx        # Root layout + SessionProvider
│   ├── page.tsx          # Home page (server component)
│   └── globals.css       # Tailwind + theme tokens
├── components/
│   ├── city-filter.tsx   # Client component — drives the ?city= URL param
│   ├── movie-card.tsx    # Single movie card
│   ├── movie-list.tsx    # Responsive grid / empty state
│   ├── profile-form.tsx  # Profile form + avatar upload to S3
│   ├── providers.tsx     # Wraps the app in Auth.js SessionProvider
│   └── sign-in.tsx       # Okta sign-in modal + signed-in state
├── data/
│   ├── cities.ts         # Mock cities
│   └── movies.ts         # Mock movies
├── lib/
│   ├── api.ts            # Mock data access layer (swap for .NET API later)
│   └── s3.ts             # S3 client + presigned upload URLs (server-only)
├── types/
│   ├── index.ts          # City & Movie types
│   └── next-auth.d.ts    # Session type augmentation (accessToken)
└── auth.ts               # Auth.js + Okta config
```

## Swapping in the .NET Core Web API

All data access goes through [`src/lib/api.ts`](src/lib/api.ts). When the
backend is ready, replace the function bodies with `fetch` calls — the
signatures (`getCities`, `getMovies(cityId?)`) and component code stay the same.

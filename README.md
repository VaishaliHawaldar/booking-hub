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

## Authentication (Okta + Auth.js)

Sign-in uses **Auth.js (NextAuth v5)** with **Okta** as the OIDC provider. The
"Sign in" button opens a modal that redirects to Okta; once authenticated the
header shows the user and a "Sign out" button.

### Configure Okta

1. In the **Okta Admin Console**, create an app: **Applications → Create App
   Integration → OIDC - OpenID Connect → Web Application**.
2. Set the redirect URIs:
   - **Sign-in redirect URI:** `http://localhost:3000/api/auth/callback/okta`
   - **Sign-out redirect URI:** `http://localhost:3000`
3. Copy these into `.env.local` (see [.env.example](.env.example)):
   - `AUTH_OKTA_ID` — the app's Client ID
   - `AUTH_OKTA_SECRET` — the app's Client secret
   - `AUTH_OKTA_ISSUER` — your issuer URL, e.g.
     `https://dev-1234567.okta.com/oauth2/default`
   - `AUTH_SECRET` — generate with `npx auth secret`

The Okta **access token** is captured in the Auth.js session
([src/auth.ts](src/auth.ts)) as `session.accessToken`, ready to forward as a
`Bearer` token to the .NET Core Web API later.

## Features

- **Home page** with a movies grid and a **city filter**.
- City selection is reflected in the URL (`/?city=mumbai`), so filtered views are shareable and bookmarkable.
- Responsive movie cards (poster, rating, certification, language, runtime, genres).

## Project structure

```
src/
├── app/
│   ├── api/auth/[...nextauth]/route.ts  # Auth.js OAuth route handler
│   ├── layout.tsx        # Root layout + SessionProvider
│   ├── page.tsx          # Home page (server component)
│   └── globals.css       # Tailwind + theme tokens
├── components/
│   ├── city-filter.tsx   # Client component — drives the ?city= URL param
│   ├── movie-card.tsx    # Single movie card
│   ├── movie-list.tsx    # Responsive grid / empty state
│   ├── providers.tsx     # Wraps the app in Auth.js SessionProvider
│   └── sign-in.tsx       # Okta sign-in modal + signed-in state
├── data/
│   ├── cities.ts         # Mock cities
│   └── movies.ts         # Mock movies
├── lib/
│   └── api.ts            # Mock data access layer (swap for .NET API later)
├── types/
│   ├── index.ts          # City & Movie types
│   └── next-auth.d.ts    # Session type augmentation (accessToken)
└── auth.ts               # Auth.js + Okta config
```

## Swapping in the .NET Core Web API

All data access goes through [`src/lib/api.ts`](src/lib/api.ts). When the
backend is ready, replace the function bodies with `fetch` calls — the
signatures (`getCities`, `getMovies(cityId?)`) and component code stay the same.

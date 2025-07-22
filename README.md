# NHS Procurement App

This project is a Next.js application that helps suppliers prepare procurement documents and manage contracts. It uses Supabase for authentication and storage and includes an AI assisted clause editor called **ClauseMind**.

## Setup

1. Copy `.env.local` from the example below and fill in your environment variables.
2. Install dependencies with `npm install`.
3. Start the development server using `npm run dev`.

### Required Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `STRIPE_SECRET_KEY`
- `POSTHOG_API_URL`
- `POSTHOG_API_KEY`
- `APP_URL` – base URL used for billing redirects

## Available Scripts

- `npm run dev` – start the dev server
- `npm run lint` – run ESLint
- `npm run test` – run unit tests

## Features

- ClauseMind editor with OpenAI powered explain, rewrite and simplify actions.
- Contract management with clause reordering and auto‑save.
- PDF export and e‑signature capture with shareable links.
- Basic rate limiting and analytics tracking.
- Billing route that creates Stripe checkout sessions.

API endpoints are documented in `openapi.yaml`.

## Testing

Run `npm run test` to execute unit tests using Node's built in runner.

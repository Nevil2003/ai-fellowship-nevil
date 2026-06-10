# Supabase setup (optional)

Propstical Canvas runs fully in `localStorage` by default — no backend
required. Supabase is opt-in and layers cloud sync + auth on top so
users can access their canvas from multiple devices.

## 1 · Create a project

1. Go to https://supabase.com → **New Project**
2. Copy `Project URL` and `anon public` key from **Settings → API**

## 2 · Add env vars

Copy `.env.example` to `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

## 3 · Install + run the schema

```bash
npm install @supabase/supabase-js
```

Open **SQL Editor → New Query** in Supabase and paste the contents of
`supabase/schema.sql`. Click **Run**. This creates the `projects`,
`blocks`, and `ghost_notes` tables with row-level security — every
user can only read/write their own rows.

## 4 · Enable email auth

**Authentication → Providers → Email** → toggle on *magic link*.
Set **Site URL** to your deploy URL (or `http://localhost:3000` for
dev).

## 5 · Restart dev server

```bash
npm run dev
```

When `NEXT_PUBLIC_SUPABASE_URL` is set, `getSupabase()` in
`lib/supabase.ts` returns a client and `useAuth()` in `lib/use-auth.ts`
gates cloud sync. When it's blank, both return null and the app falls
back to localStorage — so pulling the env vars never breaks the app.

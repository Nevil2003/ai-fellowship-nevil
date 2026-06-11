# Supabase setup

Mastical OS works in local browser mode without Supabase. Add Supabase when
you want magic-link sign-in and cloud persistence.

## 1. Create the project

1. Open https://supabase.com/dashboard/projects
2. Create a free project.
3. Open **Settings -> API** and copy:
   - Project URL
   - anon public key
   - service_role key

## 2. Create the database tables

Open **SQL Editor -> New query**, paste the full contents of
`supabase/schema.sql`, then run it once.

That single file creates the agency workspace, social hub, clipper, team,
automation, and bot persistence tables with row-level security.

## 3. Enable email magic links

In Supabase, open **Authentication -> Providers -> Email** and keep Email
enabled. Then open **Authentication -> URL Configuration** and set:

```text
Site URL: https://ai-fellowship-nevil.vercel.app
Redirect URLs:
https://ai-fellowship-nevil.vercel.app/**
http://localhost:3020/**
```

## 4. Add Vercel environment variables

The local folder is linked to the Vercel project. Add these in Vercel project
settings, or with the Vercel CLI:

```powershell
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production

vercel env add NEXT_PUBLIC_SUPABASE_URL preview
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview
vercel env add SUPABASE_SERVICE_ROLE_KEY preview
```

Also put the same values in `.env.local` for local testing:

```text
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 5. Redeploy

After the env vars are saved:

```powershell
vercel --prod
```

Then visit `/agency/settings`. Supabase should show as connected, and
`/agency/login` will send real magic links.
